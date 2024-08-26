import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CourseCard from './CourseCard';

function Dashboard() {
    const [courses, setCourses] = useState([]);
    const [latestNotification, setLatestNotification] = useState(null);
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                let url = `${process.env.REACT_APP_BASE_URL}/api/courses/`;
                if (role === 'student') {
                    url = `${process.env.REACT_APP_BASE_URL}/api/enrollments/enrolled_courses/`;
                }
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };

        const fetchLatestNotification = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/notifications/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const notifications = response.data;
                if (notifications.length > 0) {
                    setLatestNotification(notifications[0]); // Show only the most recent notification
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchLatestNotification();
        fetchCourses();
    }, [role, token]);

    const filteredCourses = role === 'teacher'
        ? courses.filter(course => course.instructor === parseInt(localStorage.getItem('user_id')))
        : courses;

    return (
        <div className="container mx-auto p-4">
            {latestNotification && (
                <div className="mb-4">
                    <h2 className="text-xl font-bold">Latest Notification</h2>
                    <div className={`p-2 ${latestNotification.is_read ? 'bg-gray-200' : 'bg-white'} rounded-md mb-2`}>
                        {latestNotification.message} 
                        <small className="text-gray-500">({new Date(latestNotification.created_at).toLocaleString()})</small>
                    </div>
                    <Link to="/notifications" className="text-blue-600">View All Notifications</Link>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{role === 'teacher' ? 'Your Courses' : 'Enrolled Courses'}</h1>
                {role === 'teacher' && (
                    <Link
                        to="/courses/new"
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                        Create New Course
                    </Link>
                )}
            </div>
            {filteredCourses.length === 0 ? (
                <p>{role === 'teacher' ? "You haven't created any courses yet." : "You are not enrolled in any courses yet."}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
