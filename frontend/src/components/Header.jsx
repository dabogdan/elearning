import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('role');
        delete axios.defaults.headers.common['Authorization'];
        toast.success("Logged out successfully!");
        navigate('/courses');
    };

    const isAuthenticated = !!localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    console.log(role);
    

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-lg font-bold">
                    <Link to="/" className="mr-4">eLearning</Link>
                </div>
                <div className="flex space-x-4">
                    <Link to="/courses" className="hover:text-gray-200">Courses</Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" className="hover:text-gray-200">Profile</Link>
                            <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
                            <Link to="/chat/general" className="hover:text-gray-200">Chat Room</Link>
                            {role === 'teacher' && <Link to="/search" className="px-2">Search Users</Link>}
                            <button onClick={handleLogout} className="hover:text-gray-200">Logout</button>
                            
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="hover:text-gray-200">Register</Link>
                            <Link to="/login" className="hover:text-gray-200">Login</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;
