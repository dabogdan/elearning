import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/notifications/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setNotifications(response.data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
    }, [token]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">All Notifications</h1>
            {notifications.length === 0 ? (
                <p>No notifications available.</p>
            ) : (
                <ul>
                    {notifications.map(notification => (
                        <li key={notification.id} className={`p-2 ${notification.is_read ? 'bg-gray-200' : 'bg-white'} rounded-md mb-2`}>
                            {notification.message} 
                            <small className="text-gray-500">({new Date(notification.created_at).toLocaleString()})</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Notifications;
