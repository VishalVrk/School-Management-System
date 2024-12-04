import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layouts/Layout';
import Dashboard from '../components/students/Dashboard';
import Marks from '../components/students/Marks';
import Attendance from '../components/students/Attendance';
import Notes from '../components/students/Notes';
import ComplaintForm from '../components/students/ComplaintForm';

const StudentDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/complaints" element={<ComplaintForm />} />
      </Routes>
    </Layout>
  );
};

export default StudentDashboard;