import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layouts/Layout';
import Dashboard from '../components/teacher/Dashboard';
import AttendanceManager from '../components/teacher/AttendanceManager';
import NotesManager from '../components/teacher/NotesManager';
import MarksManager from '../components/teacher/MarksManager';

const TeacherDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/attendance" element={<AttendanceManager />} />
        <Route path="/notes" element={<NotesManager />} />
        <Route path="/marks" element={<MarksManager />} />
      </Routes>
    </Layout>
  );
};

export default TeacherDashboard;