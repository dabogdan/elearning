import logging
from rest_framework import generics, viewsets
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Course, UserProfile, Feedback, StatusUpdate, Notification, CourseMaterial, Enrollment, UserProfile

from .serializers import UserProfileSerializer, UserSerializer, CourseSerializer, CustomTokenObtainPairSerializer, FeedbackSerializer, StatusUpdateSerializer, NotificationSerializer, CourseMaterialSerializer, EnrollmentSerializer, UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework import status
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import PermissionDenied

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
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user

        # Ensure the user has a profile before proceeding
        if not hasattr(user, 'profile'):
            raise PermissionDenied("You do not have a profile associated with your account.")

        if self.action == 'list':
            return Course.objects.all()
        elif user.profile.role == 'teacher':
            return Course.objects.filter(instructor=user)
        return Course.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        # Ensure the user has a profile and is a teacher
        if not hasattr(user, 'profile') or user.profile.role != 'teacher':
            raise PermissionDenied("You do not have permission to create a course.")
        
        serializer.save(instructor=user)

    def update(self, request, *args, **kwargs):
        user = self.request.user

        # user has a profile and is a teacher
        if not hasattr(user, 'profile') or user.profile.role != 'teacher':
            raise PermissionDenied("You do not have permission to update this course.")
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = self.request.user

        # Ensure the user has a profile and is a teacher
        if not hasattr(user, 'profile') or user.profile.role != 'teacher':
            raise PermissionDenied("You do not have permission to delete this course.")
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user_profile = request.user.profile

        # Ensure the user has a profile
        if not hasattr(request.user, 'profile'):
            raise PermissionDenied("You do not have a profile to enroll in a course.")
        
        user_profile.enrolled_courses.add(course)
        Notification.objects.create(
            recipient=course.instructor,
            message=f"{request.user.username} has enrolled in your course {course.title}."
        )
        # Notification.objects.create(
        #     teacher=course.instructor,
        #     message=f"{request.user.username} has enrolled in your course {course.title}."
        # )
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
        return StatusUpdate.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
        try:
            user_profile = user.profile 
        except UserProfile.DoesNotExist:
            logging.error("User profile not found for user: %s", user)
            return Response({"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)

        
        if not user_profile:
            logging.warning("User profile not found for user: %s", user)
            return Enrollment.objects.none()  # Return an empty queryset
        
        logging.info("User profile role: %s", user_profile.role)

        if user_profile.role == 'teacher':
            # If the user is a teacher, return all enrollments for courses they teach
            return Enrollment.objects.filter(course__instructor=user)
        
        # Otherwise, return only the enrollments for the student
        return Enrollment.objects.filter(student=user)

    def create(self, request, *args, **kwargs):
        user = request.user
        try:
            user_profile = user.profile 
        except UserProfile.DoesNotExist:
            logging.error("User profile not found for user: %s", user)
            return Response({"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)

        course_id = request.data.get('course_id')
        if not course_id:
            return Response({"detail": "Course ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        course = Course.objects.filter(id=course_id).first()
        if not course:
            return Response({"detail": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user's role is 'student'
        if user_profile.role != 'student':
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
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def enrolled_courses(self, request):
        user = request.user
        try:
            user_profile = user.profile 
        except UserProfile.DoesNotExist:
            logging.error("User profile not found for user: %s", user)
            return Response({"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)

        if user_profile.role == 'student':
            enrollments = Enrollment.objects.filter(student=user)
            courses = [enrollment.course for enrollment in enrollments]
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data)
        else:
            return Response({"detail": "Only students can view enrolled courses."}, status=status.HTTP_403_FORBIDDEN)


class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Get the UserProfile associated with the currently authenticated User
        return self.request.user.profile

    def update(self, request, *args, **kwargs):
        # Get the UserProfile object
        user_profile = self.get_object()
        user = user_profile.user  # Access the related User object

        # Update User fields
        user.email = request.data.get('email', user.email)
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        
        if 'password' in request.data:
            user.set_password(request.data['password'])
        user.save()

        # Update UserProfile fields
        user_profile.organisation = request.data.get('organisation', user_profile.organisation)
        profile_photo = request.FILES.get('profile_photo')
        if profile_photo:
            user_profile.profile_photo = profile_photo

        user_profile.save()

        serializer = self.get_serializer(user_profile)
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
                Q(email__icontains=query) |
                Q(profile__role__icontains=query)
            ).distinct()
        return User.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class UserListView(ListAPIView):
    serializer_class = UserProfileSerializer
    pagination_class = UserPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        current_user = self.request.user
        query = self.request.query_params.get('search', None)
        
        queryset = UserProfile.objects.exclude(user=current_user)  # Exclude the logged-in user
        
        if query:
            queryset = queryset.filter(
                Q(user__username__icontains=query) |
                Q(user__first_name__icontains=query) |
                Q(user__last_name__icontains=query)
            )
        
        return queryset


