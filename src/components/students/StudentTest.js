import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, query, getDocs, where } from 'firebase/firestore';
import { Clock, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useNumberFlagValue } from '@openfeature/react-sdk';

const StudentTest = () => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testQuestions, setTestQuestions] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [availableTests, setAvailableTests] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Get the exam code value from the feature flag
  const examCodeValue = useNumberFlagValue('exam-code', 1); // Default to set 1 if not defined

  useEffect(() => {
    // Fetch available tests first
    const fetchTests = async () => {
      try {
        const testsQuery = query(collection(db, 'tests'));
        const snapshot = await getDocs(testsQuery);
        const tests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAvailableTests(tests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchTests();
  }, []);

  const fetchQuestions = async (testId) => {
    try {
      // Query questions for the selected test and set (based on exam code)
      const q = query(
        collection(db, 'testQuestions'),
        where('testId', '==', testId),
        where('set', '==', examCodeValue.toString())
      );
      
      const snapshot = await getDocs(q);
      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTestQuestions(questions);
      setTimeLeft(3600); // 1 hour
      setMessage(questions.length === 0 ? 'No questions found for this set' : '');
    } catch (error) {
      console.error('Error fetching questions:', error);
      setMessage('Error loading questions');
    }
  };

  useEffect(() => {
    let timer;
    if (timeLeft && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmitTest();
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleStartTest = async (test) => {
    setSelectedTest(test);
    await fetchQuestions(test.id);
    setActiveTest({
      id: test.id,
      title: test.name,
      totalQuestions: testQuestions.length
    });
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    let total = 0;
    
    testQuestions.forEach(question => {
      total += question.marks || 1;
      if (studentAnswers[question.id] === question.correctOption) {
        score += question.marks || 1;
      }
    });

    return { score, total };
  };

  const handleSubmitTest = async () => {
    try {
      const { score, total } = calculateScore();
      const result = {
        testId: activeTest.id,
        studentId: user.uid,
        answers: studentAnswers,
        score,
        totalPossible: total,
        submittedAt: new Date(),
        timeSpent: 3600 - timeLeft,
        setNumber: examCodeValue // Store which set was taken
      };

      await addDoc(collection(db, 'testResults'), result);
      setTestResults(result);
      setActiveTest(null);
    } catch (error) {
      setMessage('Error submitting test');
    }
  };

  if (testResults) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Test Results</h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-xl mb-4">Your Score: {testResults.score} / {testResults.totalPossible}</p>
          <p className="text-lg mb-4">Percentage: {((testResults.score / testResults.totalPossible) * 100).toFixed(2)}%</p>
          <p className="text-md text-gray-600">Time Spent: {Math.floor((3600 - timeLeft) / 60)} minutes</p>
          <p className="text-md text-gray-600">Set Number: {examCodeValue}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  if (!activeTest) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Available Tests</h2>
        <p className="text-gray-600 mb-4">You are assigned to Set {examCodeValue}</p>
        
        {availableTests.map(test => (
          <div key={test.id} className="p-6 bg-gray-50 rounded-lg mb-4">
            <h3 className="text-xl font-semibold mb-2">{test.name}</h3>
            <p className="text-gray-600 mb-2">{test.description}</p>
            <p className="text-gray-600 mb-4">Test Duration: 1 hour</p>
            <button
              onClick={() => handleStartTest(test)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Test
            </button>
          </div>
        ))}
      </div>
    );
  }

  const currentQuestionData = testQuestions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {activeTest.title} - Set {examCodeValue}
        </h2>
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="text-blue-600" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {testQuestions.length === 0 ? (
        <div className="p-6 bg-yellow-50 rounded-lg">
          <p className="text-yellow-700">No questions available for this set.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="text-gray-600">
              Question {currentQuestion + 1} of {testQuestions.length}
            </div>
            <div className="text-gray-600">
              Marks: {currentQuestionData?.marks || 1}
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg mb-6">
            <p className="text-lg font-medium mb-6">{currentQuestionData?.text}</p>
            <div className="grid grid-cols-1 gap-4">
              {currentQuestionData?.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors
                    ${studentAnswers[currentQuestionData.id] === idx 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionData.id}`}
                    checked={studentAnswers[currentQuestionData.id] === idx}
                    onChange={() => handleAnswerSelect(currentQuestionData.id, idx)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                currentQuestion === 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              <ArrowLeft size={20} /> Previous
            </button>
            
            <div className="flex gap-4">
              <button
                onClick={handleSubmitTest}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={20} /> Submit Test
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestion === testQuestions.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  currentQuestion === testQuestions.length - 1 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
              >
                Next <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {testQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                    ${currentQuestion === idx 
                      ? 'border-blue-500 bg-blue-50' 
                      : studentAnswers[testQuestions[idx].id] !== undefined
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
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

export default StudentTest;