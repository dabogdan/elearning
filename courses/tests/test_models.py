from django.test import TestCase
from django.contrib.auth.models import User
from courses.models import Course, UserProfile, Enrollment, Feedback, StatusUpdate, Notification, CourseMaterial, PrivateChatRoom, ChatMessage

class CourseModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teacher', password='password')
        self.course = Course.objects.create(title='Test Course', description='A test course', instructor=self.user)

    def test_course_creation(self):
        self.assertEqual(str(self.course), 'Test Course')
        self.assertEqual(self.course.description, 'A test course')

class UserProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='student', password='password')
        self.course = Course.objects.create(title='Test Course', description='A test course', instructor=self.user)
        self.profile = UserProfile.objects.create(user=self.user, role='student', organisation='Test Org')

    def test_user_profile_creation(self):
        self.assertEqual(str(self.profile), 'student - Student')
        self.assertEqual(self.profile.organisation, 'Test Org')
        self.profile.enrolled_courses.add(self.course)
        self.assertIn(self.course, self.profile.enrolled_courses.all())

class EnrollmentModelTest(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(username='student', password='password')
        self.course = Course.objects.create(title='Test Course', instructor=self.student)
        self.enrollment = Enrollment.objects.create(student=self.student, course=self.course)

    def test_enrollment_creation(self):
        self.assertEqual(str(self.enrollment), 'student enrolled in Test Course')

class FeedbackModelTest(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(username='student', password='password')
        self.course = Course.objects.create(title='Test Course', instructor=self.student)
        self.feedback = Feedback.objects.create(course=self.course, student=self.student, comment='Great course!', rating=5)

    def test_feedback_creation(self):
        self.assertEqual(str(self.feedback), 'student - Test Course')
        self.assertEqual(self.feedback.comment, 'Great course!')
        self.assertEqual(self.feedback.rating, 5)

class StatusUpdateModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user', password='password')
        self.status = StatusUpdate.objects.create(user=self.user, content='This is a status update.')

    def test_status_update_creation(self):
        self.assertEqual(str(self.status), 'Status Update by user')
        self.assertEqual(self.status.content, 'This is a status update.')

class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user', password='password')
        self.notification = Notification.objects.create(recipient=self.user, message='You have a new notification.')

    def test_notification_creation(self):
        self.assertEqual(str(self.notification), 'Notification for user - You have a new notification.')
        self.assertFalse(self.notification.is_read)

class CourseMaterialModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teacher', password='password')
        self.course = Course.objects.create(title='Test Course', instructor=self.user)
        self.course_material = CourseMaterial.objects.create(course=self.course, file='materials/test.pdf')

    def test_course_material_creation(self):
        self.assertEqual(str(self.course_material), 'Material for Test Course')

class PrivateChatRoomModelTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password')
        self.user2 = User.objects.create_user(username='user2', password='password')
        self.chat_room = PrivateChatRoom.objects.create()
        self.chat_room.participants.add(self.user1, self.user2)

    def test_private_chat_room_creation(self):
        self.assertIn(self.user1, self.chat_room.participants.all())
        self.assertIn(self.user2, self.chat_room.participants.all())
        self.assertEqual(str(self.chat_room), 'Chat between: user1, user2')

class ChatMessageModelTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password')
        self.chat_room = PrivateChatRoom.objects.create()
        self.chat_room.participants.add(self.user1)
        self.chat_message = ChatMessage.objects.create(room=self.chat_room, user=self.user1, message='Hello!')

    def test_chat_message_creation(self):
        self.assertEqual(str(self.chat_message), 'user1: Hello!')
        self.assertEqual(self.chat_message.room, self.chat_room)
        self.assertEqual(self.chat_message.user, self.user1)
