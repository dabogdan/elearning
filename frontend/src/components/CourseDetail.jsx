import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FeedbackForm from './FeedbackForm';

function CourseDetail() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('access_token');
    const [hasLeftFeedback, setHasLeftFeedback] = useState(false);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {


        const checkFeedback = async () => {
            if (token) {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_BASE_URL}/api/courses/${id}/has_left_feedback/`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setHasLeftFeedback(response.data.has_left_feedback);
                } catch (error) {
                    console.error('Failed to check feedback status', error);
                }
            }
        };

        fetchCourse();
        checkFeedback();
    }, [id, role, token]);

    const fetchCourse = async () => {
        try {
            const config = {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            };

            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/courses/${id}/`, config);
            setCourse(response.data);

            if (role === 'student') {
                const enrollmentResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/enrollments/`, config);
                const enrolledCourses = enrollmentResponse.data.map(enrollment => enrollment.course);
                setIsEnrolled(enrolledCourses.includes(parseInt(id)));
            } else if (role === 'teacher') {
                const enrolledResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/enrollments/`, config);

                const courseEnrollments = enrolledResponse.data.filter(enrollment => enrollment.course === parseInt(id));                    
                setEnrolledStudents(courseEnrollments);
            }
        } catch (error) {
            console.error("Failed to fetch course details", error);
        }
    };

    const handleRemoveStudent = async (enrollmentId) => {
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/enrollments/${enrollmentId}/remove/`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Student removed successfully!");
            // Re-fetch the course details to update the enrolled students list
            fetchCourse();
        } catch (error) {
            console.error("Failed to remove student", error);
            toast.error("Failed to remove student. Please try again.");
        }
    };


    const handleEnroll = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/enrollments/`, {
                course: id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Successfully enrolled!");
            setIsEnrolled(true);
        } catch (error) {
            console.error("Failed to enroll", error);
            toast.error("Failed to enroll. Please try again.");
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

    if (!course) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            {course.imageUrl && (
                <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                    style={{ width: '900px', height: '600px' }}
                />
            )}
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p>{course.description}</p>
            {role === 'teacher' && (
                <>
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
                <div className="mt-4">
                {enrolledStudents.length > 0 ? (
                    <>
                        <h2 className="text-2xl font-bold">Enrolled Students:</h2>
                        <ul>
                            {enrolledStudents.map(enrollment => (
                                <li key={enrollment.student}>
                                    {enrollment.student_username}
                                    <button
                                    onClick={() => handleRemoveStudent(enrollment.id)}
                                    className="ml-4 bg-red-600 text-white py-1 px-2 rounded-md hover:bg-red-700"
                                >
                                    Remove
                                </button>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>Nobody is enrolled</p>
                )}
            </div>
            </>
            )}

            {role === 'student' && (
                <button
                    onClick={handleEnroll}
                    className={`py-2 px-4 rounded-md mt-4 ${
                        isEnrolled
                            ? "bg-gray-500 text-white cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    disabled={isEnrolled}
                >
                    {isEnrolled ? "You are enrolled" : "Enroll"}
                </button>
            )}

            {!hasLeftFeedback && token && (
                <div className="mt-6">
                    <h2 className="text-2xl font-bold mb-4">Leave Your Feedback</h2>
                    <FeedbackForm />
                </div>
            )}
            <div className="mt-6">
                <h2 className="text-2xl font-bold mb-4">Student Feedback</h2>
                {course.feedback.length === 0 ? (
                    <p>No feedback available yet.</p>
                ) : (
                    <div>
                        {course.feedback.map((fb, index) => (
                            <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold">{fb.student}</h3>
                                <p className="text-yellow-600">Rating: {fb.rating}/5</p>
                                <p>{fb.comment}</p>
                                <p className='text-gray-300'>Posted: {fb.created_at}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CourseDetail;