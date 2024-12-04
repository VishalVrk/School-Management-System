// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './components/auth/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - Move this to .env file in production
const firebaseConfig = {
  apiKey: "AIzaSyDUllCIW21CzR6RXGUuz7je1dHluZTSCQU",
  authDomain: "school-management-132ef.firebaseapp.com",
  projectId: "school-management-132ef",
  storageBucket: "school-management-132ef.firebasestorage.app",
  messagingSenderId: "259571680475",
  appId: "1:259571680475:web:3c8852251f9f697ecf38fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Define dashboard routes for better organization
const dashboardRoutes = {
  student: {
    path: "/student-dashboard/*",
    component: StudentDashboard,
    roles: ['student']
  },
  teacher: {
    path: "/teacher-dashboard/*",
    component: TeacherDashboard,
    roles: ['teacher']
  },
  admin: {
    path: "/admin-dashboard/*",
    component: AdminDashboard,
    roles: ['admin']
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />

            {/* Dashboard Routes */}
            {Object.values(dashboardRoutes).map(({ path, component: Component, roles }) => (
              <Route
                key={path}
                path={path}
                element={
                  <PrivateRoute allowedRoles={roles}>
                    <Component />
                  </PrivateRoute>
                }
              />
            ))}

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;