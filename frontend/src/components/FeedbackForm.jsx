import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function FeedbackForm() {
    const { id } = useParams();  // Course ID
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const feedbackData = {
            course: id,
            comment,
            rating,
        };

        try {
            const token = localStorage.getItem('access_token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post(`${process.env.REACT_APP_BASE_URL}/feedback/`, feedbackData, config);
            toast.success("Feedback submitted successfully!");
            setComment('');
            setRating(1);
        } catch (error) {
            toast.error("Failed to submit feedback. Please try again.");
        }
    };

    return (
        <div className="bg-white p-4 rounded-md shadow-md">
            <h3 className="text-xl font-bold mb-4">Leave Feedback</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rating">
                        Rating
                    </label>
                    <select
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comment">
                        Comment
                    </label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                    Submit Feedback
                </button>
            </form>
        </div>
    );
}

export default FeedbackForm;
