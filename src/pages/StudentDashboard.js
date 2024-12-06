import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layouts/Layout';
import Dashboard from '../components/students/Dashboard';
import Marks from '../components/students/Marks';
import Attendance from '../components/students/Attendance';
import Notes from '../components/students/Notes';
import ComplaintForm from '../components/students/ComplaintForm';
import StudentTest from '../components/students/StudentTest';

const StudentDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/complaints" element={<ComplaintForm />} />
        <Route path="/test" element={<StudentTest />} />
      </Routes>
    </Layout>
  );
};

export default StudentDashboard;