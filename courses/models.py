from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    USER_ROLES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organisation = models.CharField(max_length=256, null=True, blank=True)
    role = models.CharField(max_length=10, choices=USER_ROLES, default='student')
    enrolled_courses = models.ManyToManyField('Course', related_name='enrolled_students')
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE)
    imageUrl = models.URLField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

class Feedback(models.Model):
    course = models.ForeignKey(Course, related_name='feedback', on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    rating = models.PositiveIntegerField(default=1)  # Rating from 1 to 5
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.student.username} - {self.course.title}'

class StatusUpdate(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='status_updates')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Status Update by {self.user_profile.user.username}'

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.recipient.username} - {self.message}"

class CourseMaterial(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    file = models.FileField(upload_to='course_materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Material for {self.course.title}'