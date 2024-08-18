import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from './CourseCard';
import AuthNotice from './auth/AuthNotice';



function Courses() {
    const [courses, setCourses] = useState([]);
    const token = localStorage.getItem('access_token');

    

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/courses/`);
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };

        fetchCourses();
    }, [token]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Available Courses</h1>
            </div>
            {courses.length === 0 ? (  // Adjusted condition to check if the courses array is empty
                <p>There are no courses available yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
            <AuthNotice
                signedInMessage="Go to dashboard: "
                signedOutMessage="Not registered yet?"
                signedInLink="/dashboard"
                signedOutLink="/register"
            />
        </div>
    );
}

export default Courses;
