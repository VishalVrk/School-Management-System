import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AttendanceManager = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const teacherStudentQuery = query(
          collection(db, 'teacherStudent'),
          where('teacherId', '==', user.uid)
        );
        const snapshot = await getDocs(teacherStudentQuery);
        
        const studentPromises = snapshot.docs.map(async doc => {
          const studentDoc = await getDocs(query(
            collection(db, 'users'),
            where('uid', '==', doc.data().studentId)
          ));
          return {
            id: doc.data().studentId,
            ...studentDoc.docs[0].data(),
            attendance: 'present' // default value
          };
        });

        const studentsData = await Promise.all(studentPromises);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [user.uid]);

  const handleAttendanceChange = (studentId, status) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, attendance: status } : student
    ));
  };

  const submitAttendance = async () => {
    setLoading(true);
    try {
      const attendancePromises = students.map(student => 
        addDoc(collection(db, 'attendance'), {
          studentId: student.id,
          teacherId: user.uid,
          date: new Date(selectedDate),
          status: student.attendance,
          subject
        })
      );

      await Promise.all(attendancePromises);
      setMessage('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Mark Attendance</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="mb-4 flex gap-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="border p-2 rounded"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={student.attendance}
                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={submitAttendance}
        disabled={loading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Attendance'}
      </button>
    </div>
  );
};

export default AttendanceManager;