from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Course, UserProfile, Feedback, StatusUpdate, Notification, CourseMaterial, Enrollment
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        # User creation
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['role'] = instance.userprofile.role  # Add role from the related UserProfile
        return representation

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = ['user', 'organisation', 'role', 'profile_photo']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update User model fields
        user.username = user_data.get('username', user.username)
        user.email = user_data.get('email', user.email)
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        if 'password' in user_data:
            user.set_password(user_data['password'])
        user.save()

        # Update UserProfile model fields
        instance.organisation = validated_data.get('organisation', instance.organisation)
        if 'profile_photo' in validated_data:
            instance.profile_photo = validated_data['profile_photo']
        instance.save()

        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        data['user_id'] = self.user.id
        data['role'] = self.user.userprofile.role

        return data

class FeedbackSerializer(serializers.ModelSerializer):
    student = serializers.ReadOnlyField(source='student.username')

    class Meta:
        model = Feedback
        fields = ['id', 'course', 'student', 'comment', 'rating', 'created_at']

class CourseSerializer(serializers.ModelSerializer):
    feedback = FeedbackSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'imageUrl', 'feedback', 'average_rating']
    
    def get_average_rating(self, obj):
        feedbacks = obj.feedback.all()
        if feedbacks:
            return round(sum(fb.rating for fb in feedbacks) / len(feedbacks), 1)
        return None

class StatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusUpdate
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'message', 'created_at', 'is_read']

class CourseMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMaterial
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['student', 'student_username', 'course', 'enrolled_at']
        read_only_fields = ['student', 'student_username', 'enrolled_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['student'] = user
        return super().create(validated_data)