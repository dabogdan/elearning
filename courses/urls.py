from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import HasLeftFeedbackView, RegisterView, LogoutView, CourseViewSet, CustomTokenObtainPairView, FeedbackCreateView, StatusUpdateViewSet, NotificationViewSet, EnrollmentViewSet, UserProfileView, UserSearchView, UserListView, StatusUpdateViewSet

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'status-updates', StatusUpdateViewSet)
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')


urlpatterns = [
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='login'),

    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/', include(router.urls)),
    path('feedback/', FeedbackCreateView.as_view(), name='feedback-create'),
    path('api/courses/<int:course_id>/has_left_feedback/', HasLeftFeedbackView.as_view(), name='has-left-feedback'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/search/', UserSearchView.as_view(), name='user-search'),
    path('api/enrollments/<int:pk>/remove/', EnrollmentViewSet.as_view({'post': 'remove_student'}), name='remove-student'),
    path('api/users/', UserListView.as_view(), name='user-list'),
    # path('api/status-updates/', StatusUpdateViewSet.as_view(), name='status-update-create'),
    # path('api/status-updates/user/', StatusUpdateViewSet.as_view(), name='user-status-updates'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
import logging
# logging.debug("Available URLs: %s", urlpatterns)
