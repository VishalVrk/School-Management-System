import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'student':
          navigate('/student-dashboard');
          break;
        case 'teacher':
          navigate('/teacher-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            School Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome to our comprehensive school management platform
          </p>
          {!user && (
            <div className="space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="border border-blue-500 text-blue-500 px-6 py-3 rounded-lg hover:bg-blue-50"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;