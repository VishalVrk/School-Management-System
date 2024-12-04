// MarksManager.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MarksManager = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [testDetails, setTestDetails] = useState({
    subject: '',
    testName: '',
    maxMarks: 100,
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [user.uid]);

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
          marks: '' // default value
        };
      });

      const studentsData = await Promise.all(studentPromises);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage('Failed to fetch students');
    }
  };

  const handleMarksChange = (studentId, marks) => {
    setStudents(students.map(student =>
      student.id === studentId ? { ...student, marks } : student
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate input
      if (!testDetails.subject || !testDetails.testName) {
        throw new Error('Please fill in all test details');
      }

      // Validate marks
      const invalidMarks = students.find(
        student => !student.marks || isNaN(student.marks) || 
        student.marks < 0 || student.marks > testDetails.maxMarks
      );

      if (invalidMarks) {
        throw new Error(`Invalid marks. Must be between 0 and ${testDetails.maxMarks}`);
      }

      const marksPromises = students.map(student => 
        addDoc(collection(db, 'marks'), {
          studentId: student.id,
          teacherId: user.uid,
          subject: testDetails.subject,
          testName: testDetails.testName,
          maxMarks: Number(testDetails.maxMarks),
          score: Number(student.marks),
          date: new Date(testDetails.date),
          createdAt: new Date()
        })
      );

      await Promise.all(marksPromises);
      setMessage('Marks submitted successfully!');

      // Reset form
      setTestDetails({
        subject: '',
        testName: '',
        maxMarks: 100,
        date: new Date().toISOString().split('T')[0]
      });
      
      setStudents(students.map(student => ({
        ...student,
        marks: ''
      })));

    } catch (error) {
      console.error('Error submitting marks:', error);
      setMessage(error.message || 'Failed to submit marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Marks</h2>

      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={testDetails.subject}
              onChange={(e) => setTestDetails({...testDetails, subject: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Test Name</label>
            <input
              type="text"
              value={testDetails.testName}
              onChange={(e) => setTestDetails({...testDetails, testName: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Marks</label>
            <input
              type="number"
              value={testDetails.maxMarks}
              onChange={(e) => setTestDetails({...testDetails, maxMarks: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={testDetails.date}
              onChange={(e) => setTestDetails({...testDetails, date: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
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
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={student.marks}
                      onChange={(e) => handleMarksChange(student.id, e.target.value)}
                      className="border rounded p-1 w-20"
                      min="0"
                      max={testDetails.maxMarks}
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Marks'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarksManager;