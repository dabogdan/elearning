import React from 'react';
import { Link } from 'react-router-dom';

function AuthNotice({ signedInMessage, signedOutMessage, signedInLink, signedOutLink }) {
    const isAuthenticated = !!localStorage.getItem('access_token');

    return (
        <div className="text-center mt-6">
            {isAuthenticated ? (
                <p>{signedInMessage} <Link to={signedInLink} className="text-blue-600">Click here</Link></p>
            ) : (
                <p>{signedOutMessage} <Link to={signedOutLink} className="text-blue-600">Click here</Link></p>
            )}
        </div>
    );
}

export default AuthNotice;
