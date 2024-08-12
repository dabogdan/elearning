// frontend/src/components/Logout.js
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
                toast.success("Logged out successfully!");
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                delete axios.defaults.headers.common['Authorization'];
                navigate('/login');
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
