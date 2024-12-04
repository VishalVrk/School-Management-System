// TeacherStudentMapper.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TeacherStudentMapper = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchMappings();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTeachers(users.filter(user => user.role === 'teacher'));
      setStudents(users.filter(user => user.role === 'student'));
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Failed to fetch users');
    }
  };

  const fetchMappings = async () => {
    try {
      const mappingsSnapshot = await getDocs(collection(db, 'teacherStudent'));
      const mappingsData = mappingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMappings(mappingsData);
    } catch (error) {
      console.error('Error fetching mappings:', error);
      setMessage('Failed to fetch mappings');
    }
  };

  const handleMapping = async () => {
    if (!selectedTeacher || !selectedStudent) {
      setMessage('Please select both teacher and student');
      return;
    }

    setLoading(true);
    try {
      // Check if mapping already exists
      const existingMapping = mappings.find(
        mapping => 
          mapping.teacherId === selectedTeacher && 
          mapping.studentId === selectedStudent
      );

      if (existingMapping) {
        setMessage('This mapping already exists');
        return;
      }

      // Add new mapping
      await addDoc(collection(db, 'teacherStudent'), {
        teacherId: selectedTeacher,
        studentId: selectedStudent,
        createdAt: new Date()
      });

      setMessage('Mapping created successfully!');
      setSelectedTeacher('');
      setSelectedStudent('');
      fetchMappings();
    } catch (error) {
      console.error('Error creating mapping:', error);
      setMessage('Failed to create mapping');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    try {
      await deleteDoc(doc(db, 'teacherStudent', mappingId));
      setMessage('Mapping deleted successfully!');
      fetchMappings();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      setMessage('Failed to delete mapping');
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.uid === teacherId);
    return teacher ? teacher.email : 'Unknown Teacher';
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.uid === studentId);
    return student ? student.email : 'Unknown Student';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Teacher-Student Mapping</h2>

      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Mapping Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Choose a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.uid} value={teacher.uid}>
                  {teacher.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Choose a student</option>
              {students.map((student) => (
                <option key={student.uid} value={student.uid}>
                  {student.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleMapping}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Mapping'}
            </button>
          </div>
        </div>
      </div>

      {/* Mappings Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mappings.map((mapping) => (
              <tr key={mapping.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTeacherName(mapping.teacherId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStudentName(mapping.studentId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {mapping.createdAt.toDate().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteMapping(mapping.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherStudentMapper;