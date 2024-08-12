import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h5 className="text-lg font-bold">eLearning Platform</h5>
                    <p className="text-gray-400">© 2024 Dmytro B. All rights reserved.</p>
                </div>
                <div className="flex space-x-4">
                    <Link to="/" className="hover:text-gray-300">Home</Link>
                    <Link to="/courses" className="hover:text-gray-300">Courses</Link>
                    <Link to="/contact" className="hover:text-gray-300">Contact</Link>
                    <Link to="/about" className="hover:text-gray-300">About</Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
