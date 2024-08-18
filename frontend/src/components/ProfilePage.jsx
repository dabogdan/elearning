import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        organisation: '',
        profile_photo: null,
    });
    const [previewPhoto, setPreviewPhoto] = useState(null);

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response.data);
                
                // Unpack the response to set the profile state
                setProfile({
                    username: response.data.user.username || '',
                    email: response.data.user.email || '',
                    first_name: response.data.user.first_name || '',
                    last_name: response.data.user.last_name || '',
                    organisation: response.data.organisation || '',
                    profile_photo: response.data.profile_photo || null,
                });
                setPreviewPhoto(response.data.profile_photo);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Failed to load profile data. Please try again.");
            }
        };        

        fetchProfile();
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setProfile({ ...profile, profile_photo: file });

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewPhoto(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('email', profile.email);
        formData.append('first_name', profile.first_name);
        formData.append('last_name', profile.last_name);
        formData.append('organisation', profile.organisation);
        if (profile.profile_photo && typeof profile.profile_photo === 'object') {
            formData.append('profile_photo', profile.profile_photo);
        }

        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/profile/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile. Please try again.");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-4">
                    {previewPhoto ? (
                        <img
                            src={previewPhoto}
                            alt="Profile"
                            className="w-24 h-24 object-cover rounded-full"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-white">No Photo</span>
                        </div>
                    )}
                    <input
                        type="file"
                        name="profile_photo"
                        onChange={handlePhotoChange}
                        className="mt-2"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-lg font-medium">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        disabled
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-lg font-medium">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={profile.first_name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-lg font-medium">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={profile.last_name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-lg font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-lg font-medium">Organisation</label>
                    <input
                        type="text"
                        name="organisation"
                        value={profile.organisation}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
