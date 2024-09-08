import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                await axios.post(`${process.env.REACT_APP_BASE_URL}/api/logout/`, {
                    refresh_token: refreshToken,
                });
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('role');
                localStorage.removeItem('user_id');
                console.log(localStorage.getItem('role'));
                toast.success("Logged out successfully!");
                
                delete axios.defaults.headers.common['Authorization'];
                navigate('/courses');
            } catch (error) {
                console.error("Logout error:", error.response ? error.response.data : error.message);
                toast.error("Logout failed. Please try again.");
            }
        };

        logout();
    }, [navigate]);

    return <div>You have been logged out.</div>;
}

export default Logout;
