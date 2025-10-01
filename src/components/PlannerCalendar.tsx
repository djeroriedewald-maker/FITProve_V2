// src/components/PlannerCalendar.tsx
import React, { useEffect, useMemo, useState } from 'react';
import moment, { Moment } from 'moment';
import 'moment/locale/nl'; // Optioneel: NL labels voor dagen/maanden
import {
  FaPlus,
  FaCheckCircle,
  FaRegEdit,
  FaRegTrashAlt,
  FaRegTimesCircle,
  FaPlay,
} from 'react-icons/fa';

/** -----------------------------
 *  Kleuren & bron -> neon mapping
 *  ----------------------------- */
const NEON_ORANGE = '#FF7A18';
const NEON_GREEN = '#39FF14';
const NEON_BLUE = '#00D1FF';
const NEON_YELLOW = '#FFC300';
const NEON_PURPLE = '#B66CFF';

type WorkoutSource = 'library' | 'community' | 'creator' | 'external' | 'other';
const SOURCE_NEON: Record<WorkoutSource, string> = {
  library: NEON_GREEN,
  community: NEON_BLUE,
  creator: NEON_ORANGE,
  external: NEON_BLUE,
  other: NEON_YELLOW,
};

/** -----------------------------
 *  Types
 *  ----------------------------- */
const WORKOUT_TYPES = [
  'Run',
  'Strength',
  'Hybrid',
  'Cardio',
  'Mobility',
  'Stretching',
  'Zen',
  'Other',
] as const;
type WorkoutType = (typeof WORKOUT_TYPES)[number];

type Workout = {
  id: string;
  date: string; // "YYYY-MM-DD"
  name: string;
  notes: string;
  time: string; // "HH:mm"
  type: WorkoutType | string;
  completed: boolean;
  external: boolean;
  hero_image_url?: string;
  tags?: string[];
  creator_id?: string; // indien 'creator' workout
  exercises?: any[];
  duration?: number; // minuten
  source?: WorkoutSource;
};

type ExternalForm = {
  name: string;
  notes: string;
  time: string; // "HH:mm"
  types: WorkoutType[]; // max 3
  hero_image_url: string;
  tags: string[];
  creator_id?: string;
  exercises: any[];
  duration: number;
};

type AddModalState = { open: boolean; date: string };
type AddTypeModalState = { open: boolean; date: string; type: 'Creator' | 'External' | '' };
type EditModalState = { open: boolean; workoutId: string | null };
type DetailModalState = { open: boolean; workout: Workout | null };

/** -----------------------------
 *  Utils
 *  ----------------------------- */
const isBrowser = typeof window !== 'undefined';

const makeId = (len = 10) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 36).toString(36)).join('');

const getWeekDates = (date: Moment) => {
  const start = moment(date).startOf('isoWeek');
  return Array.from({ length: 7 }, (_, i) => moment(start).add(i, 'days'));
};

/** -----------------------------
 *  Component
 *  ----------------------------- */
const PlannerCalendar: React.FC = () => {
  // Stap 2: User ID ophalen (dummy, vervang door echte auth als beschikbaar)
  const userId = (() => {
    // Voorbeeld: haal uit localStorage of context
    return localStorage.getItem('fitprove_user_id') || 'demo-user';
  })();

  // Persistent storage helpers
  const STORAGE_KEY = `planner_workouts_${userId}`;
  const loadWorkouts = (): Workout[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const saveWorkouts = (ws: Workout[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
  };

  // Workouts state initialiseren vanuit storage
  const [workouts, setWorkouts] = useState<Workout[]>(loadWorkouts());

  // Workouts opslaan bij elke wijziging
  useEffect(() => {
    saveWorkouts(workouts);
  }, [workouts]);
  // Stap 1: Router state checken voor plannerAddWorkout (vanuit generator)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nav = window.history.state;
    // React Router v6: location.state zit in nav.usr
    const plannerAddWorkout = nav?.usr?.plannerAddWorkout;
    if (plannerAddWorkout) {
      setAddTypeModal({ open: true, date: moment().format('YYYY-MM-DD'), type: 'Creator' });
      setExternalForm({
        name: plannerAddWorkout.name || 'Generated Workout',
        notes: plannerAddWorkout.description || '',
        time: '07:00',
        types: [plannerAddWorkout.trainingType || 'Other'],
        hero_image_url: plannerAddWorkout.hero_image_url || '',
        tags: plannerAddWorkout.tags || [],
        creator_id: undefined,
        exercises: plannerAddWorkout.exercises || [],
        duration: plannerAddWorkout.duration || 0,
      });
      // Verwijder state zodat modal niet steeds opent bij navigatie
      window.history.replaceState(
        { ...nav, usr: { ...nav.usr, plannerAddWorkout: undefined } },
        ''
      );
    }
  }, []);
  moment.locale('nl');

  // State
  const [currentWeek, setCurrentWeek] = useState<Moment>(moment());
  const [restDays, setRestDays] = useState<Record<string, boolean>>({});

  const [addModal, setAddModal] = useState<AddModalState>({ open: false, date: '' });
  const [addTypeModal, setAddTypeModal] = useState<AddTypeModalState>({
    open: false,
    date: '',
    type: '',
  });
  const [editModal, setEditModal] = useState<EditModalState>({ open: false, workoutId: null });
  const [detailModal, setDetailModal] = useState<DetailModalState>({
    open: false,
    workout: null,
  });

  const [externalForm, setExternalForm] = useState<ExternalForm>({
    name: '',
    notes: '',
    time: '07:00',
    types: [],
    hero_image_url: '',
    tags: [],
    creator_id: undefined,
    exercises: [],
    duration: 0,
  });

  // Afgeleiden
  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const weekNumber = useMemo(() => currentWeek.isoWeek(), [currentWeek]);

  const completedCount = useMemo(() => workouts.filter((w) => w.completed).length, [workouts]);

  const futureCount = useMemo(() => {
    const todayStr = moment().format('YYYY-MM-DD');
    return workouts.filter((w) => w.date > todayStr).length;
  }, [workouts]);

  const totalMinutes = useMemo(
    () =>
      workouts.reduce((sum, w) => {
        const d = Number(w.duration || 0);
        return sum + (isFinite(d) ? d : 0);
      }, 0),
    [workouts]
  );

  /** -----------------------------
   *  Week navigatie
   *  ----------------------------- */
  const handlePrevWeek = () => setCurrentWeek((w) => moment(w).subtract(1, 'week'));
  const handleNextWeek = () => setCurrentWeek((w) => moment(w).add(1, 'week'));

  /** -----------------------------
   *  CTA's
   *  ----------------------------- */
  const handleAddWorkoutClick = (date: string) => {
    setAddModal({ open: true, date });
  };

  const handleRestDayClick = (date: string) => {
    setRestDays((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  /** -----------------------------
   *  Workout aanmaken / selecteren
   *  ----------------------------- */
  const handleWorkoutTypeSelect = (type: string) => {
    if (type === 'External') {
      setAddModal({ open: false, date: addModal.date });
      setAddTypeModal({ open: true, date: addModal.date, type: 'External' });
      setExternalForm({
        name: '',
        notes: '',
        time: '07:00',
        types: [],
        hero_image_url: '',
        tags: [],
        creator_id: undefined,
        exercises: [],
        duration: 0,
      });
      return;
    }
    if (type === 'Workout Generator') {
      if (isBrowser) window.location.href = '/workout-generator';
      return;
    }
    if (type === 'Workout Creator') {
      if (isBrowser) window.location.href = '/modules/workout/workout-creator';
      return;
    }
    // Fallback: snelle toevoeging op basis van type
    setWorkouts((prev) => [
      ...prev,
      {
        id: makeId(),
        date: addModal.date,
        name: `${type} Workout`,
        notes: '',
        time: '07:00',
        type,
        completed: false,
        external: false,
        duration: 0,
        source: 'other',
      },
    ]);
    setAddModal({ open: false, date: '' });
  };

  const handleExternalFormChange = <K extends keyof ExternalForm>(
    field: K,
    value: ExternalForm[K]
  ) => {
    setExternalForm((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle workout type (max 3)
  const handleTypeToggle = (type: WorkoutType) => {
    setExternalForm((prev) => {
      const exists = prev.types.includes(type);
      const next = exists
        ? prev.types.filter((t) => t !== type)
        : prev.types.length < 3
          ? [...prev.types, type]
          : prev.types;
      return { ...prev, types: next };
    });
  };

  // Submit external/creator workout
  const handleExternalFormSubmit = () => {
    if (!addTypeModal.date) return;
    setWorkouts((prev) => [
      ...prev,
      {
        id: makeId(),
        date: addTypeModal.date,
        name: externalForm.name || 'Workout',
        notes: externalForm.notes,
        time: externalForm.time,
        type: externalForm.types[0] || 'Other',
        completed: false,
        external: true,
        hero_image_url: externalForm.hero_image_url || undefined,
        tags: externalForm.tags?.length ? externalForm.tags : undefined,
        creator_id: externalForm.creator_id,
        exercises: externalForm.exercises?.length ? externalForm.exercises : undefined,
        duration: Number(externalForm.duration) || 0,
        source: externalForm.creator_id ? 'creator' : 'external',
      },
    ]);
    setAddTypeModal({ open: false, date: '', type: '' });
    setExternalForm({
      name: '',
      notes: '',
      time: '07:00',
      types: [],
      hero_image_url: '',
      tags: [],
      creator_id: undefined,
      exercises: [],
      duration: 0,
    });
    setWorkouts((prev) => {
      const next = [
        ...prev,
        {
          id: makeId(),
          date: addTypeModal.date,
          name: externalForm.name || 'Workout',
          notes: externalForm.notes,
          time: externalForm.time,
          type: externalForm.types[0] || 'Other',
          completed: false,
          external: true,
          hero_image_url: externalForm.hero_image_url || undefined,
          tags: externalForm.tags?.length ? externalForm.tags : undefined,
          creator_id: externalForm.creator_id,
          exercises: externalForm.exercises?.length ? externalForm.exercises : undefined,
          duration: Number(externalForm.duration) || 0,
          source: externalForm.creator_id
            ? 'creator'
            : addTypeModal.type === 'Creator'
              ? 'generator'
              : 'external',
        },
      ];
      saveWorkouts(next);
      return next;
    });
    setAddTypeModal({ open: false, date: '', type: '' });
    setExternalForm({
      name: '',
      notes: '',
      time: '07:00',
      types: [],
      hero_image_url: '',
      tags: [],
      creator_id: undefined,
      exercises: [],
      duration: 0,
    });
  };

  /** -----------------------------
   *  Edit/Delete/Complete
   *  ----------------------------- */
  const handleEditWorkout = (id: string) => {
    const workout = workouts.find((w) => w.id === id);
    if (!workout) return;
    setEditModal({ open: true, workoutId: id });
    setExternalForm({
      name: workout.name,
      notes: workout.notes,
      time: workout.time,
      types: [workout.type as WorkoutType],
      hero_image_url: workout.hero_image_url || '',
      tags: workout.tags || [],
      creator_id: workout.creator_id,
      exercises: workout.exercises || [],
      duration: workout.duration || 0,
    });
  };

  const handleEditFormSubmit = () => {
    if (!editModal.workoutId) return;
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === editModal.workoutId
          ? {
              ...w,
              name: externalForm.name || w.name,
              notes: externalForm.notes,
              time: externalForm.time,
              type: externalForm.types[0] || (w.type as WorkoutType),
              hero_image_url: externalForm.hero_image_url || undefined,
              tags: externalForm.tags?.length ? externalForm.tags : undefined,
              creator_id: externalForm.creator_id,
              exercises: externalForm.exercises?.length ? externalForm.exercises : undefined,
              duration: Number(externalForm.duration) || 0,
            }
          : w
      )
    );
    setEditModal({ open: false, workoutId: null });
    setWorkouts((prev) => {
      const next = prev.map((w) =>
        w.id === editModal.workoutId
          ? {
              ...w,
              name: externalForm.name || w.name,
              notes: externalForm.notes,
              time: externalForm.time,
              type: externalForm.types[0] || (w.type as WorkoutType),
              hero_image_url: externalForm.hero_image_url || undefined,
              tags: externalForm.tags?.length ? externalForm.tags : undefined,
              creator_id: externalForm.creator_id,
              exercises: externalForm.exercises || [],
              duration: externalForm.duration || 0,
            }
          : w
      );
      saveWorkouts(next);
      return next;
    });
    setEditModal({ open: false, workoutId: null });
  };

  const handleDeleteWorkout = (id: string) => {
    if (!isBrowser) return;
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this workout from the planner?')) {
      setWorkouts((prev) => {
        const next = prev.filter((w) => w.id !== id);
        saveWorkouts(next);
        return next;
      });
      setEditModal({ open: false, workoutId: null });
    }
  };

  const handleCompleteWorkout = (id: string) => {
    setWorkouts((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w));
      saveWorkouts(next);
      return next;
    });
  };

  // Run workout handler (for creator workouts)
  const handleRunWorkout = (creatorId: string) => {
    if (!isBrowser) return;
    // eslint-disable-next-line no-alert
    alert('Start workout: ' + creatorId);
    // eventueel: navigate('/modules/workouts/execute?id=' + creatorId)
  };

  /** -----------------------------
   *  Background overlay effect (SSR-safe)
   *  ----------------------------- */
  useEffect(() => {
    if (!isBrowser || !document?.body) return;

    const body = document.body;
    const prevStyles = {
      backgroundImage: body.style.backgroundImage,
      backgroundSize: body.style.backgroundSize,
      backgroundPosition: body.style.backgroundPosition,
      backgroundRepeat: body.style.backgroundRepeat,
      minHeight: body.style.minHeight,
    };

    const prevOverlay = document.getElementById('planner-bg-overlay');
    body.style.backgroundImage = "url('/images/workout_office_1.webp')";
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
    body.style.minHeight = '100vh';

    let overlay = document.getElementById('planner-bg-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'planner-bg-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.35)';
      overlay.style.zIndex = '0';
      overlay.style.pointerEvents = 'none';
      document.body.appendChild(overlay);
    }

    return () => {
      body.style.backgroundImage = prevStyles.backgroundImage;
      body.style.backgroundSize = prevStyles.backgroundSize;
      body.style.backgroundPosition = prevStyles.backgroundPosition;
      body.style.backgroundRepeat = prevStyles.backgroundRepeat;
      body.style.minHeight = prevStyles.minHeight;
      const currentOverlay = document.getElementById('planner-bg-overlay');
      if (currentOverlay && currentOverlay.parentNode) {
        currentOverlay.parentNode.removeChild(currentOverlay);
      }
      if (prevOverlay && !document.getElementById('planner-bg-overlay')) {
        document.body.appendChild(prevOverlay);
      }
    };
  }, []);

  /** -----------------------------
   *  Render
   *  ----------------------------- */
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* KPIs */}
      <div className="flex gap-4 mb-6 justify-center">
        <div
          style={{
            background: '#181A1B',
            borderRadius: 12,
            padding: 16,
            minWidth: 110,
            textAlign: 'center',
            border: `2px solid ${NEON_GREEN}`,
          }}
        >
          <div style={{ color: NEON_GREEN, fontWeight: 700, fontSize: 28 }}>{completedCount}</div>
          <div style={{ color: NEON_GREEN, fontSize: 13 }}>Workouts voltooid</div>
        </div>
        <div
          style={{
            background: '#181A1B',
            borderRadius: 12,
            padding: 16,
            minWidth: 110,
            textAlign: 'center',
            border: `2px solid ${NEON_BLUE}`,
          }}
        >
          <div style={{ color: NEON_BLUE, fontWeight: 700, fontSize: 28 }}>{futureCount}</div>
          <div style={{ color: NEON_BLUE, fontSize: 13 }}>Toekomstig gepland</div>
        </div>
        <div
          style={{
            background: '#181A1B',
            borderRadius: 12,
            padding: 16,
            minWidth: 110,
            textAlign: 'center',
            border: `2px solid ${NEON_YELLOW}`,
          }}
        >
          <div style={{ color: NEON_YELLOW, fontWeight: 700, fontSize: 28 }}>{totalMinutes}</div>
          <div style={{ color: NEON_YELLOW, fontSize: 13 }}>Minuten getraind</div>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevWeek}
          className="rounded-full p-2 bg-transparent"
          style={{ color: NEON_ORANGE, border: `1.5px solid ${NEON_ORANGE}` }}
          aria-label="Previous week"
        >
          {'<'}
        </button>
        <span className="font-bold text-lg" style={{ color: NEON_ORANGE }}>
          {weekDates[0].format('D MMM')} - {weekDates[6].format('D MMM YYYY')}
        </span>
        <button
          onClick={handleNextWeek}
          className="rounded-full p-2 bg-transparent"
          style={{ color: NEON_ORANGE, border: `1.5px solid ${NEON_ORANGE}` }}
          aria-label="Next week"
        >
          {'>'}
        </button>
      </div>

      {/* Planner grid: days */}
      <div className="flex flex-col gap-3 px-2">
        {weekDates.map((date) => {
          const dateStr = date.format('YYYY-MM-DD');
          const dayWorkouts = workouts.filter((w) => w.date === dateStr);
          const isRest = !!restDays[dateStr];

          return (
            <div
              key={dateStr}
              className="rounded-xl p-3 mb-1"
              style={{
                background: 'transparent',
                border: `1.5px solid ${NEON_ORANGE}`,
                opacity: isRest ? 0.7 : 1,
                position: 'relative',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: NEON_ORANGE }}>
                    {date.format('dddd D MMM')}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded cursor-pointer"
                    style={{
                      background: 'transparent',
                      color: NEON_ORANGE,
                      border: `1px solid ${NEON_ORANGE}`,
                    }}
                    onClick={() => handleRestDayClick(dateStr)}
                    title="Markeer rustdag"
                  >
                    {isRest ? 'Restday ✓' : 'Set Restday'}
                  </span>
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: NEON_ORANGE }}
                  title="ISO weeknummer"
                >
                  Week {weekNumber}
                </div>
              </div>

              {/* Workouts */}
              {dayWorkouts.length > 0 &&
                dayWorkouts.map((w) => {
                  const neon = (w.source && SOURCE_NEON[w.source]) ?? NEON_ORANGE;

                  return (
                    <div
                      key={w.id}
                      className={
                        w.creator_id
                          ? 'flex flex-col gap-2 p-3 rounded-lg mb-2 cursor-pointer'
                          : 'flex flex-col gap-1 p-2 rounded-lg mb-2 cursor-pointer'
                      }
                      style={{
                        background: w.creator_id ? '#181A1B' : 'transparent',
                        border: `2px solid ${neon}`,
                        position: 'relative',
                        boxShadow: w.creator_id ? `0 2px 12px ${neon}22` : undefined,
                      }}
                      onClick={() => setDetailModal({ open: true, workout: w })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setDetailModal({ open: true, workout: w });
                        }
                      }}
                    >
                      {w.creator_id ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          {w.hero_image_url && (
                            <img
                              src={w.hero_image_url}
                              alt={w.name}
                              style={{
                                width: 48,
                                height: 48,
                                objectFit: 'cover',
                                borderRadius: 6,
                                marginRight: 8,
                                border: `1.5px solid ${neon}`,
                                background: '#222',
                              }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold" style={{ color: '#fff' }}>
                                {w.name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (w.creator_id) handleRunWorkout(w.creator_id);
                                }}
                                className="flex items-center gap-1 px-3 py-1 rounded-full font-semibold"
                                style={{
                                  background: neon,
                                  color: '#181A1B',
                                  border: `1.5px solid ${neon}`,
                                }}
                              >
                                <FaPlay /> Run workout
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {w.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{
                                    background: 'transparent',
                                    color: neon,
                                    border: `1px solid ${neon}`,
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold" style={{ color: '#fff' }}>
                              {w.name}
                            </span>
                            <span
                              className="ml-2 text-xs px-2 py-0.5 rounded"
                              style={{
                                background: 'transparent',
                                color: neon,
                                border: `1px solid ${neon}`,
                                marginLeft: 8,
                              }}
                            >
                              {w.type}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditWorkout(w.id);
                                }}
                                className="text-gray-400"
                                title="Edit"
                                style={{
                                  color: neon,
                                  fontSize: 22,
                                  padding: 8,
                                  borderRadius: 8,
                                  background: '#232323',
                                  border: `1.5px solid ${neon}`,
                                }}
                                aria-label="Edit workout"
                              >
                                <FaRegEdit />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteWorkout(w.id);
                                }}
                                className="text-gray-400"
                                title="Mark as complete"
                                style={{
                                  color: w.completed ? neon : '#888',
                                  fontSize: 22,
                                  padding: 8,
                                  borderRadius: 8,
                                  background: '#232323',
                                  border: `1.5px solid ${neon}`,
                                }}
                                aria-label="Toggle complete"
                              >
                                <FaCheckCircle />
                              </button>
                            </div>
                            {/* START alleen voor creator/external workouts */}
                            {w.external && (
                              <button
                                className="flex items-center gap-1 px-3 py-1 mt-1 rounded-full font-semibold"
                                style={{
                                  background: neon,
                                  color: '#181A1B',
                                  border: `1.5px solid ${neon}`,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (w.creator_id) handleRunWorkout(w.creator_id);
                                }}
                                title="Start deze workout"
                                aria-label="Start workout"
                              >
                                <FaPlay /> Start
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2 text-xs text-gray-400">
                        {w.notes && <span>{w.notes}</span>}
                        <span>{moment(w.date).format('ddd D MMM YYYY')}</span>
                        <span>{w.time}</span>
                        {w.duration ? (
                          <>
                            <span>•</span>
                            <span>{w.duration} min</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

              {/* Add workout / Restday CTA */}
              {!isRest ? (
                <button
                  className="w-full flex items-center justify-center gap-2 mt-1 py-2 rounded-lg font-semibold"
                  style={{
                    background: 'transparent',
                    color: NEON_ORANGE,
                    border: `1.5px solid ${NEON_ORANGE}`,
                    boxShadow: 'none',
                  }}
                  onClick={() => handleAddWorkoutClick(dateStr)}
                >
                  <FaPlus />+ ADD WORKOUT
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Add Workout Modal */}
      {addModal.open && (
        <Modal onClose={() => setAddModal({ open: false, date: '' })}>
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-lg mb-2" style={{ color: '#fff' }}>
              Add Workout
            </h2>
            <div className="flex flex-col gap-2">
              <button
                className="w-full py-2 rounded"
                style={{
                  background: 'transparent',
                  color: NEON_GREEN,
                  border: `1.5px solid ${NEON_GREEN}`,
                }}
                onClick={() => handleWorkoutTypeSelect('Workout Library')}
              >
                Workout Library
              </button>
              <button
                className="w-full py-2 rounded"
                style={{
                  background: 'transparent',
                  color: NEON_YELLOW,
                  border: `1.5px solid ${NEON_YELLOW}`,
                }}
                onClick={() => handleWorkoutTypeSelect('Community Workouts')}
              >
                Community Workouts
              </button>
              <button
                className="w-full py-2 rounded"
                style={{
                  background: 'transparent',
                  color: NEON_PURPLE,
                  border: `1.5px solid ${NEON_PURPLE}`,
                }}
                onClick={() => handleWorkoutTypeSelect('Workout Creator')}
              >
                Workout Creator
              </button>
              <button
                className="w-full py-2 rounded"
                style={{
                  background: 'transparent',
                  color: NEON_ORANGE,
                  border: `1.5px solid ${NEON_ORANGE}`,
                }}
                onClick={() => handleWorkoutTypeSelect('Workout Generator')}
              >
                Workout Generator
              </button>
              <button
                className="w-full py-2 rounded"
                style={{
                  background: 'transparent',
                  color: NEON_BLUE,
                  border: `1.5px solid ${NEON_BLUE}`,
                }}
                onClick={() => handleWorkoutTypeSelect('External')}
              >
                External Workout
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* AddTypeModal (creator/external) */}
      {addTypeModal.open && (
        <Modal onClose={() => setAddTypeModal({ open: false, date: '', type: '' })}>
          <div className="flex flex-col gap-4">
            <h2
              className="font-bold text-lg mb-2"
              style={{ color: addTypeModal.type === 'External' ? '#fff' : NEON_ORANGE }}
            >
              {addTypeModal.type === 'Creator' ? 'Plan Workout' : 'External Workout'}
            </h2>

            <label className="font-semibold">Name</label>
            <input
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE}`,
              }}
              value={externalForm.name}
              onChange={(e) => handleExternalFormChange('name', e.target.value)}
              placeholder="Workout name"
            />

            <label className="font-semibold">Notes</label>
            <textarea
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE}`,
              }}
              value={externalForm.notes}
              onChange={(e) => handleExternalFormChange('notes', e.target.value)}
              placeholder="Notes"
            />

            <label className="font-semibold">Date</label>
            <input
              type="date"
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE}`,
              }}
              value={addTypeModal.date}
              onChange={(e) => setAddTypeModal((prev) => ({ ...prev, date: e.target.value }))}
            />

            <label className="font-semibold">Time</label>
            <input
              type="time"
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE}`,
              }}
              value={externalForm.time}
              onChange={(e) => handleExternalFormChange('time', e.target.value)}
            />

            <label className="font-semibold">Duur (minuten)</label>
            <input
              type="number"
              min={0}
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE}`,
              }}
              value={externalForm.duration}
              onChange={(e) => handleExternalFormChange('duration', Number(e.target.value || 0))}
              placeholder="Bijv. 45"
            />

            {/* Type alleen tonen als het geen creator workout is */}
            {!externalForm.creator_id && (
              <>
                <label className="font-semibold">Type</label>
                <div className="flex gap-2 overflow-x-auto">
                  {WORKOUT_TYPES.map((type) => {
                    const selected = externalForm.types.includes(type);
                    const disabled = !selected && externalForm.types.length >= 3;
                    const activeColor = addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE;
                    return (
                      <button
                        key={type}
                        className={`px-4 py-1 rounded-full font-semibold whitespace-nowrap flex items-center justify-center ${
                          selected ? 'border-2' : 'border'
                        }`}
                        style={{
                          background: selected ? activeColor : 'transparent',
                          color: selected ? '#181A1B' : activeColor,
                          borderColor: activeColor,
                          minWidth: 110,
                          maxWidth: 140,
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        onClick={() => handleTypeToggle(type)}
                        type="button"
                        disabled={disabled}
                        title={
                          selected
                            ? 'Verwijder preset'
                            : disabled
                              ? 'Maximaal 3 presets'
                              : 'Selecteer preset'
                        }
                      >
                        <span
                          style={{
                            width: '100%',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button
              className="w-full py-2 mt-2 rounded font-bold"
              style={{
                background: addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE,
                color: '#181A1B',
                fontSize: 18,
              }}
              onClick={handleExternalFormSubmit}
            >
              SCHEDULE
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Workout Modal */}
      {editModal.open && (
        <Modal onClose={() => setEditModal({ open: false, workoutId: null })}>
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-lg mb-2" style={{ color: NEON_ORANGE }}>
              Edit Workout
            </h2>

            <label className="font-semibold">Name</label>
            <input
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${NEON_ORANGE}`,
              }}
              value={externalForm.name}
              onChange={(e) => handleExternalFormChange('name', e.target.value)}
              placeholder="Workout name"
            />

            <label className="font-semibold">Notes</label>
            <textarea
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${NEON_ORANGE}`,
              }}
              value={externalForm.notes}
              onChange={(e) => handleExternalFormChange('notes', e.target.value)}
              placeholder="Notes"
            />

            <label className="font-semibold">Time</label>
            <input
              type="time"
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${NEON_ORANGE}`,
              }}
              value={externalForm.time}
              onChange={(e) => handleExternalFormChange('time', e.target.value)}
            />

            <label className="font-semibold">Duur (minuten)</label>
            <input
              type="number"
              min={0}
              className="rounded p-2"
              style={{
                background: 'transparent',
                color: '#fff',
                border: `1.5px solid ${NEON_ORANGE}`,
              }}
              value={externalForm.duration}
              onChange={(e) => handleExternalFormChange('duration', Number(e.target.value || 0))}
              placeholder="Bijv. 45"
            />

            <label className="font-semibold">Type</label>
            <div className="flex gap-2 overflow-x-auto">
              {WORKOUT_TYPES.map((type) => {
                const selected = externalForm.types.includes(type);
                const disabled = !selected && externalForm.types.length >= 3;
                return (
                  <button
                    key={type}
                    className={`px-4 py-1 rounded-full font-semibold whitespace-nowrap flex items-center justify-center ${
                      selected ? 'border-2' : 'border'
                    }`}
                    style={{
                      background: selected ? NEON_ORANGE : 'transparent',
                      color: selected ? '#181A1B' : NEON_ORANGE,
                      borderColor: NEON_ORANGE,
                      minWidth: 110,
                      maxWidth: 140,
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    onClick={() => handleTypeToggle(type)}
                    type="button"
                    disabled={disabled}
                    title={
                      selected
                        ? 'Verwijder preset'
                        : disabled
                          ? 'Maximaal 3 presets'
                          : 'Selecteer preset'
                    }
                  >
                    <span style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {type}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                className="w-full py-2 rounded font-bold"
                style={{ background: NEON_ORANGE, color: '#181A1B', fontSize: 18 }}
                onClick={handleEditFormSubmit}
              >
                UPDATE
              </button>
              <button
                className="w-full py-2 rounded font-bold"
                style={{
                  background: 'transparent',
                  color: NEON_ORANGE,
                  border: `1.5px solid ${NEON_ORANGE}`,
                  fontSize: 18,
                }}
                onClick={() => editModal.workoutId && handleDeleteWorkout(editModal.workoutId)}
              >
                <FaRegTrashAlt className="inline mr-1" />
                DELETE
              </button>
            </div>

            <button
              className="w-full py-2 rounded font-bold mt-2"
              style={{
                background: 'transparent',
                color: NEON_ORANGE,
                border: `1.5px solid ${NEON_ORANGE}`,
                fontSize: 18,
              }}
              onClick={() => editModal.workoutId && handleCompleteWorkout(editModal.workoutId)}
            >
              {workouts.find((w) => w.id === editModal.workoutId)?.completed ? (
                <>
                  <FaCheckCircle color={NEON_ORANGE} className="inline mr-1" />
                  Completed
                </>
              ) : (
                'Mark as Complete'
              )}
            </button>

            <button
              className="w-full py-2 rounded font-bold mt-2"
              style={{
                background: NEON_ORANGE,
                color: '#181A1B',
                border: `1.5px solid ${NEON_ORANGE}`,
                fontSize: 18,
              }}
              onClick={() => {
                const w = workouts.find((x) => x.id === editModal.workoutId);
                if (w?.creator_id) handleRunWorkout(w.creator_id);
              }}
            >
              START
            </button>
          </div>
        </Modal>
      )}

      {/* Workout detail modal */}
      {detailModal.open && detailModal.workout && (
        <Modal onClose={() => setDetailModal({ open: false, workout: null })}>
          <div className="flex flex-col gap-4">
            {detailModal.workout.hero_image_url && (
              <img
                src={detailModal.workout.hero_image_url}
                alt={detailModal.workout.name}
                style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10 }}
              />
            )}

            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl" style={{ color: NEON_ORANGE }}>
                {detailModal.workout.name}
              </h2>

              {detailModal.workout.creator_id && (
                <button
                  onClick={() =>
                    detailModal.workout?.creator_id &&
                    handleRunWorkout(detailModal.workout.creator_id)
                  }
                  className="flex items-center gap-1 px-3 py-1 rounded-full font-semibold"
                  style={{
                    background: NEON_ORANGE,
                    color: '#181A1B',
                    border: `1.5px solid ${NEON_ORANGE}`,
                  }}
                >
                  <FaPlay /> Run workout
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {detailModal.workout.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: 'transparent',
                    color: NEON_ORANGE,
                    border: `1px solid ${NEON_ORANGE}`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-4 text-sm">
              <span style={{ color: '#fff' }}>
                {moment(detailModal.workout.date).format('dddd D MMMM YYYY')}
              </span>
              <span style={{ color: '#fff' }}>{detailModal.workout.time}</span>
              <span style={{ color: NEON_ORANGE }}>{detailModal.workout.type}</span>
              {detailModal.workout.duration ? (
                <span style={{ color: NEON_YELLOW }}>{detailModal.workout.duration} min</span>
              ) : null}
            </div>

            {detailModal.workout.notes && (
              <div className="text-sm" style={{ color: '#fff' }}>
                <b>Notes:</b> {detailModal.workout.notes}
              </div>
            )}

            {/* Oefeningen tonen indien beschikbaar */}
            {Array.isArray(detailModal.workout.exercises) &&
              detailModal.workout.exercises.length > 0 && (
                <div>
                  <b style={{ color: NEON_ORANGE }}>Oefeningen:</b>
                  <ul className="mt-2 list-disc list-inside" style={{ color: '#fff' }}>
                    {detailModal.workout.exercises.map((ex: any, idx: number) => (
                      <li key={idx}>
                        {ex?.name || ex?.title || ex?.exerciseName || 'Oefening'}
                        {ex?.sets && ex?.reps ? ` - ${ex.sets}x${ex.reps}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </Modal>
      )}
    </div>
  );
};

/** -----------------------------
 *  Simple Modal component
 *  ----------------------------- */
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(2px)',
    }}
    role="dialog"
    aria-modal="true"
  >
    <div
      className="bg-gray-900 rounded-xl p-6 w-full max-w-md relative"
      style={{
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
        color: '#fff',
      }}
    >
      <button
        className="absolute top-2 right-2"
        style={{ color: NEON_ORANGE }}
        onClick={onClose}
        title="Close"
        aria-label="Close"
      >
        <FaRegTimesCircle size={24} />
      </button>
      {children}
    </div>
  </div>
);

export default PlannerCalendar;
