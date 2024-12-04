import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeComplaints: 0,
    totalUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get users count by role
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => doc.data());
        const students = users.filter(user => user.role === 'student');
        const teachers = users.filter(user => user.role === 'teacher');

        // Get active complaints
        const complaintsSnapshot = await getDocs(collection(db, 'complaints'));
        const activeComplaints = complaintsSnapshot.docs.filter(
          doc => doc.data().status === 'pending'
        ).length;

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          activeComplaints,
          totalUsers: users.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Teachers</h3>
          <p className="text-3xl font-bold">{stats.totalTeachers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Complaints</h3>
          <p className="text-3xl font-bold">{stats.activeComplaints}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;