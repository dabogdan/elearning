from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from courses.models import Course, StatusUpdate, UserProfile, Enrollment

class CourseViewSetTests(APITestCase):
    
    def setUp(self):
        self.teacher_user = User.objects.create_user(username='teacher', password='password')
        self.student_user = User.objects.create_user(username='student', password='password')
        self.teacher_profile = UserProfile.objects.create(user=self.teacher_user, role='teacher')
        self.student_profile = UserProfile.objects.create(user=self.student_user, role='student')
        self.course = Course.objects.create(title='Test Course', instructor=self.teacher_user)

    def test_list_courses(self):
        self.client.force_authenticate(user=self.teacher_user)  # Ensure user is authenticated
        url = reverse('course-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Course')

    def test_create_course_as_teacher(self):
        self.client.force_authenticate(user=self.teacher_user)  # Authenticate as teacher
        url = reverse('course-list')
        data = {'title': 'New Course', 'description': 'Course description', 'instructor': self.teacher_user.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 2)

    def test_create_course_as_student(self):
        self.client.force_authenticate(user=self.student_user)  # Authenticate as student
        url = reverse('course-list')
        data = {'title': 'New Course', 'description': 'Course description', 'instructor': self.student_user.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_enroll_in_course(self):
        self.client.force_authenticate(user=self.student_user)  # Authenticate as student
        url = reverse('course-enroll', args=[self.course.id])
        response = self.client.post(url)
        
        # Check the response status
        self.assertEqual(response.status_code, status.HTTP_200_OK, f"Unexpected response status: {response.status_code}, {response.data}")
        
        # Reload the student profile to check enrolled courses
        self.student_profile.refresh_from_db()

        enrolled_courses = self.student_profile.enrolled_courses.all()
        self.assertEqual(enrolled_courses.count(), 1, "The course was not added to the student's enrolled courses as expected")
        self.assertIn(self.course, enrolled_courses, "The course is not in the student's enrolled courses")

class EnrollmentViewSetTests(APITestCase):

    def setUp(self):
        self.student_user = User.objects.create_user(username='student', password='password')
        self.teacher_user = User.objects.create_user(username='teacher', password='password')
        self.student_profile = UserProfile.objects.create(user=self.student_user, role='student')
        self.teacher_profile = UserProfile.objects.create(user=self.teacher_user, role='teacher')
        self.course = Course.objects.create(title='Test Course', instructor=self.teacher_user)
        self.enrollment = Enrollment.objects.create(student=self.student_user, course=self.course)

    def test_get_enrolled_courses(self):
        self.client.force_authenticate(user=self.student_user)
        url = reverse('enrollments-enrolled-courses')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Course')

    def test_enroll_in_course(self):
        self.client.force_authenticate(user=self.student_user)
        new_course = Course.objects.create(title='New Course', instructor=self.teacher_user)
        url = reverse('enrollments-list')
        data = {'course_id': new_course.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, f"Unexpected response status: {response.status_code}, {response.data}")
        self.assertEqual(Enrollment.objects.count(), 2, "Enrollment was not created as expected")

class UserProfileViewTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.profile = UserProfile.objects.create(user=self.user, role='student')
        self.client.force_authenticate(user=self.user)

    def test_retrieve_user_profile(self):
        url = reverse('user-profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_update_user_profile(self):
        url = reverse('user-profile')
        data = {
            'first_name': 'UpdatedFirstName',
            'last_name': 'UpdatedLastName',
            'email': self.user.email, # email by default needs to be present
            'organisation': 'Updated Organisation'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated_user = User.objects.get(id=self.profile.user.id)
        self.assertEqual(self.profile.organisation, 'Updated Organisation')
        self.assertEqual(updated_user.first_name, 'UpdatedFirstName', f"Expected 'UpdatedFirstName', got '{updated_user.first_name}'")
        self.assertEqual(updated_user.last_name, 'UpdatedLastName', f"Expected 'UpdatedLastName', got '{updated_user.last_name}'")



class CustomTokenObtainPairViewTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.profile = UserProfile.objects.create(user=self.user, role='student')

    def test_token_obtain_pair(self):
        url = reverse('login')
        data = {'username': 'testuser', 'password': 'password'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class StatusUpdateViewSetTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.user_profile = UserProfile.objects.create(user=self.user, role='student')
        self.client.force_authenticate(user=self.user)

        self.other_user = User.objects.create_user(username='otheruser', password='password123')
        self.other_user_profile = UserProfile.objects.create(user=self.other_user, role='teacher')

    def test_create_status_update(self):
        url = reverse('statusupdate-list')
        data = {'content': 'This is a new status update'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_user_status_updates(self):
        # Create a status update
        StatusUpdate.objects.create(user=self.user, content='Status update content')

        url = reverse('statusupdate-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], 'Status update content')