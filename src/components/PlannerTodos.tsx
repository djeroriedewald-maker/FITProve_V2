// src/components/PlannerTodos.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type PlannerTodo = {
  id: string;
  user_id: string;
  content: string;
  completed: boolean;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
};

const PlannerTodos: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<PlannerTodo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  // Open edit for a specific todo
  const openEdit = (todo: PlannerTodo) => {
    setEditId(todo.id);
    setEditContent(todo.content);
    setEditDueDate(todo.due_date || '');
  };

  // Save edits
  const saveEdit = async () => {
    if (!editId || !editContent.trim()) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('planner_todos')
        .update({ content: editContent.trim(), due_date: editDueDate || null })
        .eq('id', editId)
        .select()
        .single<PlannerTodo>();

      if (error) throw error;
      if (data) {
        setTodos((prev) => prev.map((t) => (t.id === editId ? data : t)));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save todo edit:', e);
    } finally {
      setEditId(null);
      setEditContent('');
      setEditDueDate('');
      setLoading(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    setEditContent('');
    setEditDueDate('');
  };

  // Initial fetch
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('planner_todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!cancelled) setTodos((data as PlannerTodo[]) || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load todos:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Add a todo
  const addTodo = async () => {
    if (!user || !newTodo.trim()) return;
    try {
      setLoading(true);
      const insertObj: Partial<PlannerTodo> = {
        user_id: user.id,
        content: newTodo.trim(),
        due_date: dueDate || null,
      };
      const { data, error } = await supabase
        .from('planner_todos')
        .insert(insertObj)
        .select()
        .single<PlannerTodo>();

      if (error) throw error;
      if (data) setTodos((prev) => [data, ...prev]);
      setNewTodo('');
      setDueDate('');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to add todo:', e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle complete
  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('planner_todos')
        .update({ completed: !completed })
        .eq('id', id)
        .select()
        .single<PlannerTodo>();

      if (error) throw error;
      if (data) setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle todo:', e);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteTodo = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('planner_todos').delete().eq('id', id);
      if (error) throw error;
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete todo:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyan-900/60 to-black/80 border-2 border-cyan-400/20 shadow-xl p-4 mb-8">
      <h2 className="text-2xl font-extrabold text-cyan-200 mb-4 tracking-tight" style={{ textShadow: '0 2px 8px #00fff7aa' }}>
        To-Do & Goals
      </h2>

      {/* Add row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="flex-1 rounded-2xl p-4 bg-black/60 text-cyan-100 border-2 border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-lg shadow-lg"
          placeholder="Add a new goal or task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          disabled={loading}
          maxLength={100}
        />
        <input
          type="date"
          className="rounded-2xl p-4 bg-black/60 text-cyan-200 border-2 border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-44 text-lg shadow-lg"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-bold px-6 py-3 rounded-2xl shadow-neon-cyan text-lg transition-transform hover:scale-105"
          onClick={addTodo}
          disabled={loading || !newTodo.trim()}
        >
          Add
        </button>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {todos.length === 0 && !loading && (
          <li className="text-cyan-200/60 text-center text-lg">No to-dos yet. Add your first goal!</li>
        )}

        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl shadow-lg transition-all duration-200 border-2 ${
              todo.completed ? 'bg-green-900/40 border-green-400/30' : 'bg-black/40 border-cyan-400/10'
            }`}
          >
            {editId === todo.id ? (
              <div className="flex flex-col sm:flex-row gap-3 flex-1 items-center">
                <input
                  className="flex-1 rounded-2xl p-3 bg-black/60 text-cyan-100 border-2 border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-lg shadow"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={loading}
                  maxLength={100}
                />
                <input
                  type="date"
                  className="rounded-2xl p-3 bg-black/60 text-cyan-200 border-2 border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-40 text-lg shadow"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-bold px-5 py-2 rounded-2xl shadow-neon-cyan text-lg transition-transform hover:scale-105"
                  onClick={saveEdit}
                  disabled={loading || !editContent.trim()}
                >
                  Save
                </button>
                <button
                  className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-bold px-5 py-2 rounded-2xl text-lg shadow transition-transform hover:scale-105"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                    className="accent-cyan-400 w-6 h-6 rounded-full border-2 border-cyan-400/40 shadow focus:ring-2 focus:ring-cyan-400"
                    disabled={loading}
                  />
                  <span className={todo.completed ? 'line-through text-cyan-200/60' : 'text-cyan-100 font-semibold text-lg'} style={{ textShadow: todo.completed ? '' : '0 2px 8px #00fff7aa' }}>
                    {todo.content}
                  </span>
                  {todo.due_date && (
                    <span className="ml-2 text-xs text-cyan-200 bg-cyan-900/40 px-3 py-1 rounded-full font-bold shadow" style={{ textShadow: '0 2px 8px #00fff7aa' }}>
                      Due: {todo.due_date}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
                  <button
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-bold px-4 py-2 rounded-2xl shadow-neon-cyan text-base transition-transform hover:scale-110"
                    onClick={() => openEdit(todo)}
                    disabled={loading}
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-300 hover:to-pink-400 text-white font-bold px-4 py-2 rounded-2xl shadow text-base transition-transform hover:scale-110"
                    onClick={() => deleteTodo(todo.id)}
                    disabled={loading}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {loading && <div className="text-base text-cyan-200/60 mt-4 text-center">Loading…</div>}
    </div>
  );
};

export default PlannerTodos;
