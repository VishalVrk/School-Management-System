import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getRoleSpecificLinks = () => {
    switch (user?.role) {
      case 'student':
        return (
          <>
            <Link to="/student/marks" className="text-gray-300 hover:text-white px-3 py-2">Marks</Link>
            <Link to="/student/attendance" className="text-gray-300 hover:text-white px-3 py-2">Attendance</Link>
            <Link to="/student/notes" className="text-gray-300 hover:text-white px-3 py-2">Notes</Link>
          </>
        );
      case 'teacher':
        return (
          <>
            <Link to="/teacher/attendance" className="text-gray-300 hover:text-white px-3 py-2">Mark Attendance</Link>
            <Link to="/teacher/notes" className="text-gray-300 hover:text-white px-3 py-2">Manage Notes</Link>
            <Link to="/teacher/marks" className="text-gray-300 hover:text-white px-3 py-2">Manage Marks</Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link to="/admin/users" className="text-gray-300 hover:text-white px-3 py-2">Users</Link>
            <Link to="/admin/complaints" className="text-gray-300 hover:text-white px-3 py-2">Complaints</Link>
            <Link to="/admin/mapping" className="text-gray-300 hover:text-white px-3 py-2">Teacher-Student Mapping</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              School Management
            </Link>
            
            {user && (
              <div className="ml-10 flex items-baseline space-x-4">
                {/* <Link 
                  to={`/${user.role}-dashboard`} 
                  className="text-gray-300 hover:text-white px-3 py-2"
                >
                  Dashboard
                </Link> */}
                {/* {getRoleSpecificLinks()} */}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link 
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;