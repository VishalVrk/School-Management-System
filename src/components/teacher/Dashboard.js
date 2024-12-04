import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    totalNotes: 0,
    pendingGrading: 0
  });

  useEffect(() => {
    const fetchTeacherStats = async () => {
      try {
        // Get assigned students
        const studentsQuery = query(
          collection(db, 'teacherStudent'),
          where('teacherId', '==', user.uid)
        );
        const studentsSnap = await getDocs(studentsQuery);
        const totalStudents = studentsSnap.size;

        // Get attendance statistics
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('teacherId', '==', user.uid)
        );
        const attendanceSnap = await getDocs(attendanceQuery);
        const presentCount = attendanceSnap.docs.filter(doc => 
          doc.data().status === 'present'
        ).length;
        const averageAttendance = (presentCount / attendanceSnap.size) * 100 || 0;

        // Update stats
        setStats({
          totalStudents,
          averageAttendance,
          totalNotes: 0, // Implement notes count
          pendingGrading: 0 // Implement pending assignments
        });
      } catch (error) {
        console.error('Error fetching teacher stats:', error);
      }
    };

    fetchTeacherStats();
  }, [user.uid]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Average Attendance</h3>
          <p className="text-3xl font-bold">{stats.averageAttendance.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Notes</h3>
          <p className="text-3xl font-bold">{stats.totalNotes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Pending Grading</h3>
          <p className="text-3xl font-bold">{stats.pendingGrading}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;