import React, { useEffect, useState } from 'react';
import { getWorkoutsBySource, deleteWorkoutById, SavedWorkout } from '../../../../modules/workout/my-workouts';
import { createClient } from '@supabase/supabase-js';
// Setup Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const MyWorkoutsPage: React.FC = () => {
  const [generatorWorkouts, setGeneratorWorkouts] = useState<SavedWorkout[]>([]);
  const [creatorWorkouts, setCreatorWorkouts] = useState<SavedWorkout[]>([]);


  // Helper to refresh lists
  const refreshWorkouts = () => {
    setGeneratorWorkouts(getWorkoutsBySource('generator'));
    setCreatorWorkouts(getWorkoutsBySource('creator'));
  };

  useEffect(() => {
    refreshWorkouts();
  }, []);

  // Undo state
  const [undoData, setUndoData] = useState<{ workout: SavedWorkout; source: 'generator' | 'creator' } | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Delete handler for generator workouts (local only)
  const handleDeleteGenerator = (id: string) => {
    const workout = generatorWorkouts.find(w => w.id === id);
    if (!workout) return;
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    deleteWorkoutById(id, 'generator');
    setUndoData({ workout, source: 'generator' });
    refreshWorkouts();
    if (undoTimeout) clearTimeout(undoTimeout);
    setUndoTimeout(setTimeout(() => setUndoData(null), 6000));
  };

  // Delete handler for creator workouts (local and Supabase)
  const handleDeleteCreator = async (id: string) => {
    const workout = creatorWorkouts.find(w => w.id === id);
    if (!workout) return;
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    deleteWorkoutById(id, 'creator');
    if (id) {
      await supabase.from('custom_workouts').delete().eq('id', id);
    }
    setUndoData({ workout, source: 'creator' });
    refreshWorkouts();
    if (undoTimeout) clearTimeout(undoTimeout);
    setUndoTimeout(setTimeout(() => setUndoData(null), 6000));
  };

  // Undo handler
  const handleUndo = async () => {
    if (!undoData) return;
    const { workout, source } = undoData;
    // Restore to localStorage
    const workouts = getWorkoutsBySource(source);
    workouts.push(workout);
    localStorage.setItem('my_workouts_v2', JSON.stringify([
      ...getWorkoutsBySource(source === 'generator' ? 'creator' : 'generator'),
      ...workouts
    ]));
    // Restore to Supabase if creator
    if (source === 'creator') {
      await supabase.from('custom_workouts').insert([{ ...workout }]);
    }
    setUndoData(null);
    refreshWorkouts();
    if (undoTimeout) clearTimeout(undoTimeout);
  };

  return (
    <div className="min-h-screen bg-black dark:bg-black">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-8 w-full">
        {/* Undo Snackbar */}
        {undoData && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in">
            <span>Workout deleted.</span>
            <button
              onClick={handleUndo}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded transition-colors"
            >
              Undo
            </button>
          </div>
        )}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Workouts</h2>

        {/* Generator Workouts */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Saved from Generator</h3>
          {generatorWorkouts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
              No generator workouts saved yet.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {generatorWorkouts.map((w) => (
                <div
                  key={w.id}
                  className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 flex flex-col gap-2 w-full max-w-full border-4 border-dashed border-red-500"
                  style={{
                    minWidth: 0,
                    maxWidth: '100vw',
                    overflowX: 'auto',
                    overflowY: 'visible',
                    background: '#fffbe6',
                  }}
                >
                  <b className="text-lg font-semibold text-gray-900 dark:text-white break-words border border-blue-500 bg-blue-50 px-1">{w.name}</b>
                  <span className="text-gray-500 text-xs mb-1">{w.created_at}</span>
                  <span className="text-gray-600 dark:text-gray-300 text-xs">{w.exercises?.length || 0} exercises</span>
                  <div className="flex flex-col xs:flex-row gap-2 w-full mt-3 border border-green-500 bg-green-50 overflow-x-auto" style={{minWidth:0}}>
                    <button className="w-full xs:w-auto flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-sm border border-blue-400">
                      Share
                    </button>
                    <button
                      className="w-full xs:w-auto flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm border border-red-400"
                      onClick={() => handleDeleteGenerator(w.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Creator Workouts */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Created Workouts (Public)</h3>
          {creatorWorkouts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
              No creator workouts yet.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {creatorWorkouts.map((w) => (
                <div
                  key={w.id}
                  className="relative shadow rounded-lg flex flex-col gap-2 w-full max-w-full overflow-hidden"
                  style={{
                    background: `url('/images/community_workout.webp') center/cover no-repeat`,
                    minHeight: '240px',
                  }}
                >
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-70" />
                  <div className="relative z-10 flex flex-col gap-2 p-6 h-full justify-end">
                    <b className="text-lg font-semibold text-white break-words drop-shadow-lg">{w.name}</b>
                    <span className="text-gray-200 text-xs mb-1 drop-shadow">{w.created_at}</span>
                    <span className="text-gray-100 text-xs drop-shadow">{w.exercises?.length || 0} exercises</span>
                    <div className="flex flex-col xs:flex-row gap-2 w-full mt-3" style={{minWidth:0}}>
                      <button className="w-full xs:w-auto flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-sm border border-blue-400">
                        Share
                      </button>
                      <button
                        className="w-full xs:w-auto flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm border border-red-400"
                        onClick={() => handleDeleteCreator(w.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyWorkoutsPage;

