import React, { useState } from 'react';
import axios from 'axios';

const UserSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const token = localStorage.getItem('access_token');

    const handleSearch = async () => {
        console.log(searchTerm);
        
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/search/?search=${searchTerm}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setResults(response.data);
        } catch (error) {
            console.error("Failed to search users", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Search Users</h2>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Search by username or email"
            />
            <button
                onClick={handleSearch}
                className="bg-blue-600 text-white py-2 px-4 rounded-md mt-2"
            >
                Search
            </button>
            <div className="mt-4">
                {results.length > 0 ? (
                    <ul>
                        {results.map(user => (
                            <li key={user.id}>
                                {user.username} ({user.email})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );
};

export default UserSearch;
