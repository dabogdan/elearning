import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function CourseCard({ course }) {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    
    const token = localStorage.getItem('access_token');

    const handleViewCourse = () => {
        const isAuthenticated = !!localStorage.getItem('access_token');
        if (isAuthenticated) {
            navigate(`/courses/${course.id}`);
        } else {
            navigate('/login');
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this course? This action cannot be undone.");
        if (confirmed) {
            try {
                await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/courses/${course.id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                toast.success("Course deleted successfully!");
                navigate(0);
            } catch (error) {
                console.error("Failed to delete course", error);
                toast.error("Failed to delete course. Please try again.");
            }
        }
    };

    const handleEdit = () => {
        navigate(`/courses/edit/${course.id}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            {course.imageUrl && (
                <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                    style={{ width: '900px', height: '600px' }}
                />
            )}
            <h3 className="text-lg font-bold mb-2">{course.title}</h3>
            <p className="text-gray-700 mb-4">{course.description}</p>
            {course.average_rating !== null ? (
                <p className="text-yellow-600 mb-4">Average Rating: {course.average_rating}/5</p>
            ) : (
                <p className="text-gray-600 mb-4">No ratings yet</p>
            )}
            <button
                onClick={handleViewCourse}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
                View Course
            </button>
            {role === 'teacher' && (
                <div className="mt-4 flex space-x-2">
                    <button
                        onClick={handleEdit}
                        className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
                    >
                        Edit Course
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                    >
                        Delete Course
                    </button>
                </div>
            )}
        </div>
    );
}

export default CourseCard;
