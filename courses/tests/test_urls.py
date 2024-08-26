from django.test import SimpleTestCase
from django.urls import reverse, resolve
from courses.views import (
    RegisterView, CustomTokenObtainPairView, LogoutView, FeedbackCreateView, 
    HasLeftFeedbackView, UserProfileView, UserSearchView, UserListView,
    EnrollmentViewSet
)

class UrlsTest(SimpleTestCase):

    def test_register_url_resolves(self):
        url = reverse('register')
        self.assertEqual(resolve(url).func.view_class, RegisterView)

    def test_login_url_resolves(self):
        url = reverse('login')
        self.assertEqual(resolve(url).func.view_class, CustomTokenObtainPairView)

    def test_logout_url_resolves(self):
        url = reverse('logout')
        self.assertEqual(resolve(url).func.view_class, LogoutView)

    def test_feedback_create_url_resolves(self):
        url = reverse('feedback-create')
        self.assertEqual(resolve(url).func.view_class, FeedbackCreateView)

    def test_has_left_feedback_url_resolves(self):
        url = reverse('has-left-feedback', args=[1])
        self.assertEqual(resolve(url).func.view_class, HasLeftFeedbackView)

    def test_user_profile_url_resolves(self):
        url = reverse('user-profile')
        self.assertEqual(resolve(url).func.view_class, UserProfileView)

    def test_user_search_url_resolves(self):
        url = reverse('user-search')
        self.assertEqual(resolve(url).func.view_class, UserSearchView)

    def test_user_list_url_resolves(self):
        url = reverse('user-list')
        self.assertEqual(resolve(url).func.view_class, UserListView)

    def test_remove_student_url_resolves(self):
        url = reverse('remove-student', args=[1])
        resolved_func = resolve(url).func
        expected_func = EnrollmentViewSet.as_view({'post': 'remove_student'}).__name__

        self.assertEqual(resolved_func.__name__, expected_func, f"Expected {expected_func}, got {resolved_func.__name__}")