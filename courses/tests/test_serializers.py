from django.test import TestCase
from django.contrib.auth.models import User
from courses.models import UserProfile, Course
from courses.serializers import UserSerializer, UserProfileSerializer, FeedbackSerializer, EnrollmentSerializer
from django.test import RequestFactory


class UserSerializerTest(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'password123',
            'role': 'student'
        }

    def user_serializer_create(self):
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'testuser@example.com')
        self.assertTrue(user.check_password('password123'))
        self.assertEqual(user.profile.role, 'student')

    def user_serializer_invalid_data(self):
        invalid_data = self.user_data.copy()
        invalid_data['email'] = 'not-an-email'
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

class UserProfileSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.course = Course.objects.create(title='Test Course', instructor=self.user)
        self.profile = UserProfile.objects.create(user=self.user, role='student', organisation='Test Org')

    def userprofile_serializer_update(self):
        data = {
            'user': {
                'username': 'newusername',
                'email': 'newemail@example.com',
                'first_name': 'New',
                'last_name': 'Name',
                'password': '123'
            },
            'organisation': 'New Org',
            'role': 'teacher',
            'enrolled_courses': [
                self.course.id
            ]    
        }
        serializer = UserProfileSerializer(instance=self.profile, data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        updated_profile = serializer.save()
        self.user.refresh_from_db()
        self.assertEqual(updated_profile.organisation, 'New Org')
        self.assertEqual(updated_profile.role, 'teacher')
        self.assertEqual(self.user.username, 'newusername')
        self.assertEqual(self.user.email, 'newemail@example.com')


class FeedbackSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='student', password='password123')
        self.course = Course.objects.create(title='Test Course', instructor=self.user)

    def feedback_serializer(self):
        data = {
            'course': self.course.id,
            'comment': 'Great course!',
            'rating': 5
        }

        serializer = FeedbackSerializer(data=data)
        serializer.context['request'] = RequestFactory().get('/')
        serializer.context['request'].user = self.user
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        feedback = serializer.save(student=self.user)
        self.assertEqual(feedback.course, self.course)
        self.assertEqual(feedback.student, self.user)
        self.assertEqual(feedback.comment, 'Great course!')
        self.assertEqual(feedback.rating, 5)


class EnrollmentSerializerTest(TestCase):

    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(username='student', password='password123')
        self.teacher_user = User.objects.create_user(username='teacher', password='password123')
        self.course = Course.objects.create(title='Test Course', instructor=self.teacher_user)

    def enrollment_serializer_creates(self):
        request = self.factory.post('/')
        request.user = self.user 

        serializer = EnrollmentSerializer(data={'course': self.course.id}, context={'request': request})
        self.assertTrue(serializer.is_valid())
        enrollment = serializer.save()
        self.assertEqual(enrollment.course, self.course)
        self.assertEqual(enrollment.student, self.user)
