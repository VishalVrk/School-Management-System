import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, query, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { Trash2, Plus, Edit2, Save } from 'lucide-react';

const TestManager = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedSet, setSelectedSet] = useState('1');
  const [availableSets, setAvailableSets] = useState([]);
  
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
  });

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    marks: 1,
    testId: null,
    set: '1'
  });

  useEffect(() => {
    fetchTests();
    fetchVariations();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchQuestions(selectedTest.id, selectedSet);
    }
  }, [selectedTest, selectedSet]);

  const fetchVariations = async () => {
    try {
      const response = await fetch('https://feature-flag-api-c31g.onrender.com/get-variations');
      const data = await response.json();
      
      if (data.variations && Array.isArray(data.variations)) {
        // Extract set numbers from variations
        const sets = data.variations.map((variation, index) => (index + 1).toString());
        setAvailableSets(sets);
      } else {
        setMessage('Error fetching variations data');
      }
    } catch (error) {
      console.error('Error fetching variations:', error);
      setMessage('Error connecting to variations API');
    }
  };

  const fetchTests = async () => {
    try {
      const testsQuery = query(collection(db, 'tests'));
      const snapshot = await getDocs(testsQuery);
      const testsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTests(testsList);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchQuestions = async (testId, set) => {
    try {
      const questionsQuery = query(
        collection(db, 'testQuestions'),
        where('testId', '==', testId),
        where('set', '==', set)
      );
      const snapshot = await getDocs(questionsQuery);
      const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestQuestions(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAddTest = async () => {
    if (!newTest.name.trim()) {
      setMessage('Please enter a test name');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'tests'), {
        ...newTest,
        sets: availableSets,
        createdBy: user.uid,
        createdAt: new Date()
      });
      
      setNewTest({
        name: '',
        description: '',
      });
      
      fetchTests();
      setMessage('Test added successfully!');
    } catch (error) {
      setMessage('Failed to add test');
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedTest) {
      setMessage('Please select a test first');
      return;
    }

    if (!newQuestion.text.trim() || newQuestion.options.some(opt => !opt.trim())) {
      setMessage('Please fill in all question fields');
      return;
    }

    try {
      await addDoc(collection(db, 'testQuestions'), {
        ...newQuestion,
        testId: selectedTest.id,
        set: selectedSet,
        createdBy: user.uid,
        createdAt: new Date()
      });
      setNewQuestion({
        text: '',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 1,
        testId: selectedTest.id,
        set: selectedSet
      });
      fetchQuestions(selectedTest.id, selectedSet);
      setMessage('Question added successfully!');
    } catch (error) {
      setMessage('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteDoc(doc(db, 'testQuestions', questionId));
      fetchQuestions(selectedTest.id, selectedSet);
      setMessage('Question deleted successfully!');
    } catch (error) {
      setMessage('Failed to delete question');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Test Manager</h2>

      {user?.role === 'teacher' && (
        <>
          {/* Test Creation Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Create New Test</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Test name"
                value={newTest.name}
                onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Test description"
                value={newTest.description}
                onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Available Sets:</span>
                {availableSets.map(set => (
                  <span key={set} className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Set {set}
                  </span>
                ))}
              </div>
              <button
                onClick={handleAddTest}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Create Test
              </button>
            </div>
          </div>

          {/* Test Selection */}
          {tests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Select a Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTest?.id === test.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{test.name}</h4>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Set Selection and Question Management */}
          {selectedTest && (
            <>
              {/* Set Selection Tabs */}
              <div className="mb-6">
                <div className="flex space-x-2 border-b">
                  {availableSets.map((set) => (
                    <button
                      key={set}
                      onClick={() => setSelectedSet(set)}
                      className={`px-4 py-2 ${
                        selectedSet === set
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Set {set}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Form */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Add Question to: {selectedTest.name} (Set {selectedSet})
                </h3>
                <div className="space-y-4">
                  <textarea
                    placeholder="Question text"
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newQuestion.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[idx] = e.target.value;
                            setNewQuestion({...newQuestion, options: newOptions});
                          }}
                          className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newQuestion.correctOption === idx}
                          onChange={() => setNewQuestion({...newQuestion, correctOption: idx})}
                          className="w-4 h-4 text-blue-600"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Marks"
                      value={newQuestion.marks}
                      onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})}
                      className="w-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Question
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-700">
                  Questions in Set {selectedSet}
                </h3>
                {testQuestions.map((question) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-lg">{question.text}</p>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        Set {question.set}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {question.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded ${
                            question.correctOption === idx
                              ? 'bg-green-100 border border-green-500'
                              : 'bg-gray-100'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">Marks: {question.marks}</div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {message && (
        <div className={`mt-4 p-4 rounded-md ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TestManager;