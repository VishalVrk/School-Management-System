// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import { OpenFeatureProvider, OpenFeature } from '@openfeature/react-sdk'
import DevCycleProvider from '@devcycle/openfeature-web-provider'

// Pages
import Login from './pages/Login';
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

await OpenFeature.setContext({ user_id: 'user_id' })
await OpenFeature.setProviderAndWait(new DevCycleProvider('dvc_client_9b49683d_afff_41f9_b34f_b58af0d43074_f0e296d'))

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
    <OpenFeatureProvider>
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}

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
    </OpenFeatureProvider>
  );
}

export default App;