import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { to: '/student-dashboard', label: 'Overview', icon: '📊' },
          // { to: '/student-dashboard/marks', label: 'Marks', icon: '📝' },
          // { to: '/student-dashboard/attendance', label: 'Attendance', icon: '📅' },
          // { to: '/student-dashboard/notes', label: 'Notes', icon: '📚' },
          // { to: '/student-dashboard/complaints', label: 'Complaints', icon: '✋' },
          { to: '/student-dashboard/test', label: 'Test', icon: '📝' },
        ];
      case 'teacher':
        return [
          { to: '/teacher-dashboard', label: 'Overview', icon: '📊' },
          // { to: '/teacher-dashboard/attendance', label: 'Mark Attendance', icon: '📅' },
          // { to: '/teacher-dashboard/notes', label: 'Manage Notes', icon: '📚' },
          // { to: '/teacher-dashboard/marks', label: 'Manage Marks', icon: '📝' },
          { to: '/teacher-dashboard/test', label: 'Test', icon: '📝' },
        ];
      case 'admin':
        return [
          { to: '/admin-dashboard', label: 'Overview', icon: '📊' },
          { to: '/admin-dashboard/users', label: 'Manage Users', icon: '👥' },
          { to: '/admin-dashboard/complaints', label: 'View Complaints', icon: '📧' },
          { to: '/admin-dashboard/mapping', label: 'Teacher-Student Mapping', icon: '🔗' },
          // { to: '/admin-dashboard/register', label: 'Register', icon: '👥' },
        ];
      default:
        return [];
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="space-y-3">
        <div className="flex items-center space-x-4 px-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Panel</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <nav className="flex-1">
          {getMenuItems().map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className={`flex items-center space-x-3 px-6 py-3 rounded transition duration-150 ${
                location.pathname === item.to
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">
            Last login: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;