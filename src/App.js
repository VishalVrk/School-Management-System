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
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};


const devCycleClientKey = process.env.REACT_APP_DEVCYCLE_CLIENT_KEY;

// Check if the client key is available
if (!devCycleClientKey) {
  console.error('DevCycle client key is not defined. Please set REACT_APP_DEVCYCLE_CLIENT_KEY in your environment variables.');
}

await OpenFeature.setContext({ user_id: 'user_id' })
await OpenFeature.setProviderAndWait(new DevCycleProvider(devCycleClientKey))

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
            {/* <Route path="/" element={'Hello'} /> */}
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