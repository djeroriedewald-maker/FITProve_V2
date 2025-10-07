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
    <div className="bg-black/60 rounded-xl p-4 mb-6 shadow-lg">
      <h2 className="text-xl font-bold text-cyan-300 mb-3">To-Do & Goals</h2>

      {/* Add row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className="flex-1 rounded p-2 bg-gray-900 text-white border border-cyan-700 focus:outline-none"
          placeholder="Add a new goal or task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          disabled={loading}
          maxLength={100}
        />
        <input
          type="date"
          className="rounded p-2 bg-gray-900 text-cyan-200 border border-cyan-700 focus:outline-none w-40"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-4 py-2 rounded"
          onClick={addTodo}
          disabled={loading || !newTodo.trim()}
        >
          Add
        </button>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {todos.length === 0 && !loading && (
          <li className="text-gray-400">No to-dos yet. Add your first goal!</li>
        )}

        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded transition ${
              todo.completed ? 'bg-green-900/40' : 'bg-gray-800/60'
            }`}
          >
            {editId === todo.id ? (
              <div className="flex flex-col sm:flex-row gap-2 flex-1 items-center">
                <input
                  className="flex-1 rounded p-2 bg-gray-900 text-white border border-cyan-700 focus:outline-none"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={loading}
                  maxLength={100}
                />
                <input
                  type="date"
                  className="rounded p-2 bg-gray-900 text-cyan-200 border border-cyan-700 focus:outline-none w-36"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-3 py-2 rounded"
                  onClick={saveEdit}
                  disabled={loading || !editContent.trim()}
                >
                  Save
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-3 py-2 rounded"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                    className="accent-cyan-500 w-5 h-5"
                    disabled={loading}
                  />
                  <span className={todo.completed ? 'line-through text-gray-400' : 'text-white'}>
                    {todo.content}
                  </span>
                  {todo.due_date && (
                    <span className="ml-2 text-xs text-cyan-300 bg-cyan-900/40 px-2 py-0.5 rounded-full">
                      Due: {todo.due_date}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button
                    className="text-cyan-400 hover:text-cyan-200 text-sm"
                    onClick={() => openEdit(todo)}
                    disabled={loading}
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 hover:text-red-200 text-sm"
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

      {loading && <div className="text-xs text-gray-400 mt-2">Loading…</div>}
    </div>
  );
};

export default PlannerTodos;
