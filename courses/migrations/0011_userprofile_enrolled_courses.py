# Generated by Django 5.0.6 on 2024-08-23 18:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0010_remove_statusupdate_user_profile_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='enrolled_courses',
            field=models.ManyToManyField(related_name='students', to='courses.course'),
        ),
    ]
