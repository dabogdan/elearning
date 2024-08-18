import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Logout from './components/auth/Logout';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CourseForm from './components/CourseForm';
import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import Notifications from './components/Notifications';
import ChatRoom from './components/ChatRoom';
import ProfilePage from './components/ProfilePage';
import UserSearch from './components/UserSearch';

function App() {
    return (
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<Logout />} />
                <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />
                <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/courses/new"
                    element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                            <CourseForm />
                        </ProtectedRoute>
                    }
                />
                <Route path="/courses/edit/:id" element={
                                <ProtectedRoute allowedRoles={['teacher']}>
                                    <CourseForm />
                                </ProtectedRoute>
                            } 
                        />
                <Route
                    path="/chat/:roomName"
                    element={
                        <ProtectedRoute>
                            <ChatRoom />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/search"
                    element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                            <UserSearch />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Login />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </Router>
    );
}

export default App;
