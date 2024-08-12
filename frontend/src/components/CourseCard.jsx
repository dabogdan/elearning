// src/components/CourseCard.js
import React from 'react';

const CourseCard = ({ course }) => {
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-4">
            <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                <p className="text-gray-700 mb-4">{course.description}</p>
                <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    View Course
                </button>
            </div>
        </div>
    );
}

export default CourseCard;
