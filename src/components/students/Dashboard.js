// Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    attendance: 0,
    averageMarks: 0,
    totalNotes: 0,
    pendingComplaints: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch attendance
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('studentId', '==', user.uid)
        );
        const attendanceSnap = await getDocs(attendanceQuery);
        const totalClasses = attendanceSnap.size;
        const presentClasses = attendanceSnap.docs.filter(doc => doc.data().status === 'present').length;
        const attendancePercentage = (presentClasses / totalClasses) * 100 || 0;

        // Fetch marks
        const marksQuery = query(
          collection(db, 'marks'),
          where('studentId', '==', user.uid)
        );
        const marksSnap = await getDocs(marksQuery);
        const marks = marksSnap.docs.map(doc => doc.data().score);
        const averageMarks = marks.reduce((a, b) => a + b, 0) / marks.length || 0;

        // Update stats
        setStats({
          attendance: attendancePercentage,
          averageMarks: averageMarks,
          totalNotes: 0, // You'll need to implement this
          pendingComplaints: 0 // You'll need to implement this
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user.uid]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Attendance</h3>
          <p className="text-3xl font-bold">{stats.attendance.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Average Marks</h3>
          <p className="text-3xl font-bold">{stats.averageMarks.toFixed(1)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Notes Available</h3>
          <p className="text-3xl font-bold">{stats.totalNotes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Pending Complaints</h3>
          <p className="text-3xl font-bold">{stats.pendingComplaints}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;