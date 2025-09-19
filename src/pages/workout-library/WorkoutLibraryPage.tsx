import React, { useState, useEffect } from 'react';
// --- Wger API-token instellen ---
// Vul hieronder je Wger API-token in als je authenticated requests wilt doen.
// Laat leeg voor publieke data.
const WGER_API_TOKEN = '';
import WorkoutLibraryHero from './WorkoutLibraryHero';


// Wger API type
interface WgerRoutine {
  id: number;
  name: string;
  description: string;
  start: string;
  end: string;
  is_public: boolean;
}

interface WgerRoutineDetail extends WgerRoutine {
  days: WgerRoutineDay[];
}

interface WgerRoutineDay {
  id: number;
  day: number;
  workouts: WgerRoutineWorkout[];
}

interface WgerRoutineWorkout {
  id: number;
  name: string;
  exercises: WgerRoutineExercise[];
}

interface WgerRoutineExercise {
  id: number;
  name: string;
  description: string;
  sets?: number;
  reps?: string;
}

const WorkoutLibraryPage: React.FC = () => {

  const [routines, setRoutines] = useState<WgerRoutine[]>([]);
  const [routineDetails, setRoutineDetails] = useState<Record<number, WgerRoutineDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = 'https://wger.de/api/v2/routine/?limit=10';
    const headers: HeadersInit = WGER_API_TOKEN ? { Authorization: `Token ${WGER_API_TOKEN}` } : {};
    fetch(url, { headers })
      .then((res) => res.json())
      .then(async (data) => {
        if (!data || !Array.isArray(data.results)) {
          setRoutines([]);
          setRoutineDetails({});
          setLoading(false);
          return;
        }
        setRoutines(data.results);
        // Voor elke routine: haal de details op
        const details: Record<number, WgerRoutineDetail> = {};
        for (const routine of data.results) {
          try {
            const detailRes = await fetch(`https://wger.de/api/v2/routine/${routine.id}/`, { headers });
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              details[routine.id] = detailData;
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Routine detail fetch error', err);
          }
        }
        setRoutineDetails(details);
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Routine fetch error', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-gray-900">
      <WorkoutLibraryHero />
      <div className="flex flex-col flex-grow min-h-0">
        <div className="max-w-5xl mx-auto p-4 w-full">
          <h2 className="text-xl font-bold mb-2">Wger Workout Routines</h2>
          {loading ? (
            <div>Routines laden...</div>
          ) : (
            <ul>
              {Array.isArray(routines) && routines.length > 0 ? (
                routines.map((routine) => (
                  <li key={routine?.id || Math.random()} className="mb-8">
                    <div className="font-semibold text-lg mb-1">{routine?.name ?? 'Routine'}</div>
                    <div className="text-gray-500 dark:text-gray-300 mb-2">{routine?.description ?? ''}</div>
                    <div className="text-xs text-gray-400 mb-2">{routine?.start ?? ''} t/m {routine?.end ?? ''}</div>
                    {/* Toon dagen, workouts en oefeningen */}
                    {Array.isArray(routineDetails[routine.id]?.days) && routineDetails[routine.id].days.length > 0 ? (
                      <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                        {routineDetails[routine.id].days.map((day) => (
                          <li key={day?.id || Math.random()} className="mb-4">
                            <div className="font-semibold">Dag {day?.day ?? '?'}</div>
                            {Array.isArray(day?.workouts) && day.workouts.length > 0 ? (
                              <ul className="ml-4 border-l border-gray-100 dark:border-gray-700 pl-4">
                                {day.workouts.map((workout) => (
                                  <li key={workout?.id || Math.random()} className="mb-2">
                                    <div className="font-medium">
                                      Workout: {workout?.name ?? 'Onbekend'}
                                    </div>
                                    {Array.isArray(workout?.exercises) && workout.exercises.length > 0 ? (
                                      <ul className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-4">
                                        {workout.exercises.map((ex) => (
                                          <li key={ex?.id || Math.random()} className="mb-1">
                                            <div className="font-normal">
                                              {ex?.name ?? 'Oefening'}
                                            </div>
                                            {ex?.sets && (
                                              <span className="text-xs text-gray-500 mr-2">
                                                Sets: {ex.sets}
                                              </span>
                                            )}
                                            {ex?.reps && (
                                              <span className="text-xs text-gray-500 mr-2">
                                                Reps: {ex.reps}
                                              </span>
                                            )}
                                            {ex?.description && (
                                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">
                                                {ex.description}
                                              </div>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <div className="text-xs text-gray-400">
                                        Geen oefeningen gevonden.
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-xs text-gray-400">
                                Geen workouts gevonden voor deze dag.
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Geen dagen gevonden voor deze routine.
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <div className="text-xs text-gray-400">Geen routines gevonden.</div>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutLibraryPage;
