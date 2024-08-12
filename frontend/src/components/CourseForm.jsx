// src/components/CourseForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function CourseForm({ course = null }) {
    const [title, setTitle] = useState(course ? course.title : '');
    const [description, setDescription] = useState(course ? course.description : '');
    const [imageUrl, setImageUrl] = useState(course ? course.imageUrl : '');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const courseData = {
            title,
            description,
            imageUrl,
            instructor: localStorage.getItem('user_id')
        };

        console.log("Course Data:", courseData); 

        try {
            const token = localStorage.getItem('access_token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (course) {
                // Update existing course
                await axios.put(`${process.env.REACT_APP_BASE_URL}/api/courses/${course.id}/`, courseData, config);
                toast.success("Course updated successfully!");
            } else {
                // Create new course
                await axios.post(`${process.env.REACT_APP_BASE_URL}/api/courses/`, courseData, config);
                toast.success("Course created successfully!");
            }
            navigate('/dashboard');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.error("Bad Request Error:", error.response.data);  // Log the error response
                toast.error("Failed to save course. Please check your input.");
            } else if (error.response && error.response.status === 401) {
                toast.error("Unauthorized. Please log in again.");
                navigate('/login');
            } else {
                toast.error("Failed to save course. Please try again.");
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">
                    {course ? 'Edit Course' : 'Create Course'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                            Image URL
                        </label>
                        <input
                            type="text"
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                    >
                        {course ? 'Update Course' : 'Create Course'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CourseForm;
