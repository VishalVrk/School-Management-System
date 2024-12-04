import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layouts/Layout';
import Dashboard from '../components/admin/Dashboard';
import UserManager from '../components/admin/UserManager';
import ComplaintViewer from '../components/admin/ComplaintViewer';
import TeacherStudentMapper from '../components/admin/TeacherStudentMapper';
import Register from '../components/auth/Register';
import LandingPage from '../components/admin/LandingPage';

const AdminDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stats" element={<Dashboard />} />
        <Route path="/users" element={<UserManager />} />
        <Route path="/complaints" element={<ComplaintViewer />} />
        <Route path="/mapping" element={<TeacherStudentMapper />} />
      </Routes>
    </Layout>
  );
};

export default AdminDashboard;