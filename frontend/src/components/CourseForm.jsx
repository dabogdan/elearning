import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function CourseForm() {
    const { id } = useParams(); // Get course ID from the URL params
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            // Fetch course data if we're editing an existing course
            const fetchCourse = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/courses/${id}/`);
                    const course = response.data;
                    setTitle(course.title);
                    setDescription(course.description);
                    setImageUrl(course.imageUrl);
                } catch (error) {
                    console.error("Failed to fetch course details", error);
                    toast.error("Failed to load course data. Please try again.");
                }
            };

            fetchCourse();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const courseData = {
            title,
            description,
            imageUrl,
            instructor: localStorage.getItem('user_id')
        };

        try {
            const token = localStorage.getItem('access_token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (id) {
                // Update existing course
                await axios.put(`${process.env.REACT_APP_BASE_URL}/api/courses/${id}/`, courseData, config);
                toast.success("Course updated successfully!");
            } else {
                // Create new course
                await axios.post(`${process.env.REACT_APP_BASE_URL}/api/courses/`, courseData, config);
                toast.success("Course created successfully!");
            }
            navigate('/dashboard');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.error("Bad Request Error:", error.response.data);
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
                    {id ? 'Edit Course' : 'Create Course'}
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
                        {id ? 'Update Course' : 'Create Course'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CourseForm;
