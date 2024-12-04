import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const NotesManager = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    subject: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [user.uid]);

  const fetchNotes = async () => {
    try {
      const notesQuery = query(
        collection(db, 'notes'),
        where('teacherId', '==', user.uid)
      );
      const snapshot = await getDocs(notesQuery);
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'notes'), {
        ...newNote,
        teacherId: user.uid,
        createdAt: new Date()
      });
      setNewNote({ title: '', content: '', subject: '' });
      setMessage('Note added successfully!');
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      setMessage('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      setMessage('Note deleted successfully!');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      setMessage('Failed to delete note');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Notes</h2>

      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={newNote.subject}
              onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              rows="4"
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{note.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{note.subject}</p>
            <p className="text-gray-800 mb-4">{note.content}</p>
            <button
              onClick={() => handleDelete(note.id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesManager;