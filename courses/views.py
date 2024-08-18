from rest_framework import generics, viewsets
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Course, UserProfile, Feedback, StatusUpdate, Notification, CourseMaterial, Enrollment

from .serializers import UserSerializer, CourseSerializer, CustomTokenObtainPairSerializer, FeedbackSerializer, StatusUpdateSerializer, NotificationSerializer, CourseMaterialSerializer, EnrollmentSerializer, UserProfileSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework import status, filters
from django.db.models import Q


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer


class LogoutView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Successfully logged out"}, status=200)
        except Exception as e:
            return Response(status=400)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        # Allow anyone to list and retrieve courses
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            # Only authenticated users can create, update, or delete
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        # Teachers should only see their own courses in the list
        user = self.request.user
        if self.action == 'list':
            return Course.objects.all()  # Allow anyone to see all courses
        elif user.userprofile.role == 'teacher':
            return Course.objects.filter(instructor=user)
        return Course.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.userprofile.role != 'teacher':
            raise PermissionDenied("You do not have permission to create a course.")
        serializer.save(instructor=user)

    def update(self, request, *args, **kwargs):
        user = self.request.user
        if user.userprofile.role != 'teacher':
            raise PermissionDenied("You do not have permission to update this course.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        if user.userprofile.role != 'teacher':
            raise PermissionDenied("You do not have permission to delete this course.")
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user_profile = request.user.userprofile
        user_profile.enrolled_courses.add(course)
        Notification.objects.create(
            teacher=course.instructor,
            message=f"{request.user.username} has enrolled in your course {course.title}."
        )
        return Response({'status': 'enrolled'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_material(self, request, pk=None):
        course = self.get_object()
        file = request.FILES.get('file')
        CourseMaterial.objects.create(course=course, file=file)
        return Response({'status': 'material uploaded'})


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class HasLeftFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        user = request.user
        has_left_feedback = Feedback.objects.filter(course_id=course_id, student=user).exists()
        return Response({'has_left_feedback': has_left_feedback})

class StatusUpdateViewSet(viewsets.ModelViewSet):
    queryset = StatusUpdate.objects.all()
    serializer_class = StatusUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return StatusUpdate.objects.filter(user_profile=user.userprofile)

class StatusUpdateViewSet(viewsets.ModelViewSet):
    queryset = StatusUpdate.objects.all()
    serializer_class = StatusUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user_profile=self.request.user.userprofile)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(recipient=user).order_by('-created_at')


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'teacher':
            # If the user is a teacher, return all enrollments for courses they teach
            return Enrollment.objects.filter(course__instructor=user)
        # Otherwise, return only the enrollments for the student
        return Enrollment.objects.filter(student=user)

    def create(self, request, *args, **kwargs):
        user = request.user
        course_id = request.data.get('course_id')

        if not course_id:
            return Response({"detail": "Course ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        course = Course.objects.filter(id=course_id).first()
        if not course:
            return Response({"detail": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.userprofile.role != 'student':
            raise PermissionDenied("Only students can enroll in courses.")

        enrollment, created = Enrollment.objects.get_or_create(student=user, course=course)
        if not created:
            return Response({"detail": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a notification for the teacher
        Notification.objects.create(
            recipient=course.instructor,
            message=f"{user.username} has enrolled in your course '{course.title}'."
        )

        return Response({"detail": "Successfully enrolled."}, status=status.HTTP_201_CREATED)
   
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def remove_student(self, request, pk=None):
        enrollment = self.get_object()
        user = request.user

        if user.userprofile.role != 'teacher' or enrollment.course.instructor != user:
            raise PermissionDenied("You do not have permission to remove this student.")

        enrollment.delete()

        # Notify the student that they have been removed
        Notification.objects.create(
            recipient=enrollment.student,
            message=f"You have been removed from the course '{enrollment.course.title}'."
        )

        return Response({"detail": "Student removed successfully."}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.userprofile

    def update(self, request, *args, **kwargs):
        user_profile = self.get_object()

        # Update UserProfile fields
        user_profile.organisation = request.data.get('organisation', user_profile.organisation)
        
        profile_photo = request.FILES.get('profile_photo')
        if profile_photo:
            user_profile.profile_photo = profile_photo

        user_profile.save()

        # Update User fields
        user = request.user
        user.email = request.data.get('email', user.email)
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        if 'password' in request.data:
            user.set_password(request.data['password'])
        user.save()

        serializer = self.get_serializer(user_profile)  # Serialize the UserProfile instance
        return Response(serializer.data)

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('search', None)
        if query:
            return User.objects.filter(
                Q(username__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query)
            )
        return User.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)