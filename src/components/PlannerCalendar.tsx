// src/components/PlannerCalendar.tsx
import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import moment, { Moment } from 'moment';
import 'moment/locale/nl';
import { FaCheckCircle, FaRegEdit, FaRegTrashAlt, FaRegTimesCircle, FaPlay } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/** -----------------------------
 *  Neon colors & source mapping
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

type PlannerEvent = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  type: 'workout' | 'rest' | string;
  title?: string;
  notes?: string;
  time?: string; // HH:mm
  duration_min?: number;
  completed?: boolean;
  // optional metadata for “creator/external” style workouts
  external?: boolean;
  hero_image_url?: string;
  tags?: string[];
  creator_id?: string;
  exercises?: any[];
  source?: WorkoutSource;
  workout_type?: WorkoutType | string; // for display
  recurrence_rule?: string | null;
  recurrence_end?: string | null; // YYYY-MM-DD
  color?: string | null; // HEX or color name
  reminder_minutes_before?: number | null;
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
  recurrence_rule?: string | null;
  recurrence_end?: string | null; // YYYY-MM-DD
  color?: string | null; // HEX or color name
  reminder_minutes_before?: number | null;
};

type AddModalState = { open: boolean; date: string };
type AddTypeModalState = { open: boolean; date: string; type: 'Creator' | 'External' | '' };
type EditModalState = { open: boolean; workoutId: string | null };
type DetailModalState = { open: boolean; workout: PlannerEvent | null };

/** -----------------------------
 *  Utils
 *  ----------------------------- */
const isBrowser = typeof window !== 'undefined';

const getWeekDates = (date: Moment) => {
  const start = moment(date).startOf('isoWeek');
  return Array.from({ length: 7 }, (_, i) => moment(start).add(i, 'days'));
};

// Normalize any free-form string to a valid WorkoutType
const normalizeWorkoutType = (t: unknown): WorkoutType => {
  const s = String(t || '').trim();
  return (WORKOUT_TYPES as readonly string[]).includes(s) ? (s as WorkoutType) : 'Other';
};

/** -----------------------------
 *  Component
 *  ----------------------------- */

export type PlannerCalendarHandle = {
  openAddModalForToday: () => void;
};

const PlannerCalendar = forwardRef<PlannerCalendarHandle>((_, ref) => {
  moment.locale('nl');
  const { user } = useAuth();

  // Core state
  const [currentWeek, setCurrentWeek] = useState<Moment>(moment());
  const [currentDay, setCurrentDay] = useState<Moment>(moment());
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);
  const [viewMode, setViewMode] = useState<'Week' | 'Month' | 'Day'>('Week');

  // Month view state (mirrors selected week when switching)
  const [currentMonth, setCurrentMonth] = useState<Moment>(moment());
  useEffect(() => {
    if (viewMode === 'Month') {
      setCurrentMonth(currentWeek.clone());
    }
  }, [viewMode, currentWeek]);

  // Month grid (Mon-Sun rows spanning first/last partial weeks)
  const getMonthGrid = (month: Moment) => {
    const start = month.clone().startOf('month').startOf('isoWeek');
    const end = month.clone().endOf('month').endOf('isoWeek');
    const days: Moment[] = [];
    let day = start.clone();
    while (day.isSameOrBefore(end, 'day')) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    return days;
  };

  const monthDays = useMemo(() => getMonthGrid(currentMonth), [currentMonth]);
  const monthLabel = useMemo(() => currentMonth.format('MMMM YYYY'), [currentMonth]);

  // UI state
  const [addModal, setAddModal] = useState<AddModalState>({ open: false, date: '' });
  const [addTypeModal, setAddTypeModal] = useState<AddTypeModalState>({
    open: false,
    date: '',
    type: '',
  });
  const [editModal, setEditModal] = useState<EditModalState>({ open: false, workoutId: null });
  const [detailModal, setDetailModal] = useState<DetailModalState>({ open: false, workout: null });

  // External/Creator form
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
    recurrence_rule: null,
    recurrence_end: null,
    color: '#FF7A18',
    reminder_minutes_before: null,
  });

  // Expose imperative handle for parent to trigger Add modal
  useImperativeHandle(ref, () => ({
    openAddModalForToday: () => {
      setAddModal({ open: true, date: moment().format('YYYY-MM-DD') });
    },
  }));

  /** -----------------------------
   *  Derived values
   *  ----------------------------- */
  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const weekNumber = useMemo(() => currentWeek.isoWeek(), [currentWeek]);

  // Helper: expand recurring events for a given date range
  function expandRecurringEvents(events: PlannerEvent[], range: Moment[]) {
    const result: PlannerEvent[] = [];
    for (const e of events) {
      if (!e.recurrence_rule) {
        result.push(e);
        continue;
      }
      // Only support simple RRULEs: DAILY, WEEKLY, MONTHLY
      const start = moment(e.date);
      const end = e.recurrence_end ? moment(e.recurrence_end) : range[range.length - 1];
      let freq = '';
      if (e.recurrence_rule.includes('FREQ=DAILY')) freq = 'DAILY';
      else if (e.recurrence_rule.includes('FREQ=WEEKLY')) freq = 'WEEKLY';
      else if (e.recurrence_rule.includes('FREQ=MONTHLY')) freq = 'MONTHLY';
      else {
        result.push(e); // fallback: treat as single event
        continue;
      }
      for (const d of range) {
        if (d.isBefore(start, 'day') || d.isAfter(end, 'day')) continue;
        if (
          freq === 'DAILY' ||
          (freq === 'WEEKLY' && d.isoWeekday() === start.isoWeekday()) ||
          (freq === 'MONTHLY' && d.date() === start.date())
        ) {
          // Clone event for this date
          result.push({ ...e, date: d.format('YYYY-MM-DD') });
        }
      }
    }
    return result;
  }

  // Map date string to events for DnD (Week view, with recurrence)
  // Events for current day (Day view)
  const eventsForCurrentDay = useMemo(() => {
    const dateStr = currentDay.format('YYYY-MM-DD');
    // Expand recurring events for this day only
    const expanded = expandRecurringEvents(plannerEvents, [currentDay]);
    return expanded.filter(e => e.date === dateStr);
  }, [plannerEvents, currentDay]);
  const eventsByDate = useMemo(() => {
    const map: Record<string, PlannerEvent[]> = {};
    weekDates.forEach((d) => {
      map[d.format('YYYY-MM-DD')] = [];
    });
    const expanded = expandRecurringEvents(plannerEvents, weekDates);
    expanded.forEach((e) => {
      if (map[e.date]) map[e.date].push(e);
    });
    return map;
  }, [plannerEvents, weekDates]);

  // Map date string to events for the whole month (Month view, with recurrence)
  const eventsByDateMonth = useMemo(() => {
    const map: Record<string, PlannerEvent[]> = {};
    monthDays.forEach((d) => {
      map[d.format('YYYY-MM-DD')] = [];
    });
    const expanded = expandRecurringEvents(plannerEvents, monthDays);
    expanded.forEach((e) => {
      if (map[e.date]) map[e.date].push(e);
    });
    return map;
  }, [plannerEvents, monthDays]);

  // KPIs
  const completedCount = useMemo(
    () => plannerEvents.filter((e) => e.completed && e.type === 'workout').length,
    [plannerEvents]
  );
  const futureCount = useMemo(() => {
    const todayStr = moment().format('YYYY-MM-DD');
    return plannerEvents.filter((e) => e.type === 'workout' && e.date > todayStr).length;
  }, [plannerEvents]);
  const totalMinutes = useMemo(
    () =>
      plannerEvents.reduce((sum, e) => {
        const d = Number(e.duration_min || 0);
        return sum + (Number.isFinite(d) ? d : 0);
      }, 0),
    [plannerEvents]
  );

  /** -----------------------------
   *  Fetch events (range depends on view)
   *  ----------------------------- */
  useEffect(() => {
    if (!user) return;

    const { start, end } =
      viewMode === 'Month'
        ? {
            start: currentMonth.clone().startOf('month').startOf('isoWeek').format('YYYY-MM-DD'),
            end: currentMonth.clone().endOf('month').endOf('isoWeek').format('YYYY-MM-DD'),
          }
        : {
            start: currentWeek.clone().startOf('isoWeek').format('YYYY-MM-DD'),
            end: currentWeek.clone().endOf('isoWeek').format('YYYY-MM-DD'),
          };

    (async () => {
      const { data, error } = await supabase
        .from('planner_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load planner_events:', error);
        return;
      }
      setPlannerEvents((data || []) as PlannerEvent[]);
    })();
  }, [user, viewMode, currentWeek, currentMonth]);

  /** -----------------------------
   *  Check router state: plannerAddWorkout (from generator)
   *  ----------------------------- */
  useEffect(() => {
    if (!isBrowser) return;
    const nav = (window.history.state || {}) as any;
    const plannerAddWorkout = nav?.usr?.plannerAddWorkout;
    if (plannerAddWorkout) {
      const today = moment().format('YYYY-MM-DD');
      setAddTypeModal({ open: true, date: today, type: 'Creator' });

      // Normalize inbound fields to satisfy TS and UI constraints
      const normalizedType = normalizeWorkoutType(plannerAddWorkout.trainingType);
      const normalizedTypes: WorkoutType[] = [normalizedType];

      setExternalForm((prev) => ({
        ...prev,
        name: plannerAddWorkout.name || 'Generated Workout',
        notes: plannerAddWorkout.description || '',
        time: '07:00',
        types: normalizedTypes,
        hero_image_url: plannerAddWorkout.hero_image_url || '',
        tags: Array.isArray(plannerAddWorkout.tags) ? plannerAddWorkout.tags : [],
        creator_id: undefined,
        exercises: Array.isArray(plannerAddWorkout.exercises) ? plannerAddWorkout.exercises : [],
        duration: Number(plannerAddWorkout.duration || 0),
      }));
      // Clear the state so it won't reopen
      window.history.replaceState(
        { ...nav, usr: { ...nav?.usr, plannerAddWorkout: undefined } },
        ''
      );
    }
  }, []);

  /** -----------------------------
   *  Week navigation
   *  ----------------------------- */
  const handlePrevWeek = () => setCurrentWeek((w) => moment(w).subtract(1, 'week'));
  const handleNextWeek = () => setCurrentWeek((w) => moment(w).add(1, 'week'));

  /** -----------------------------
   *  Drag-and-drop
   *  ----------------------------- */
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const srcDate = source.droppableId;
    const destDate = destination.droppableId;
    if (srcDate === destDate) return;

    const event = plannerEvents.find((e) => e.id === draggableId);
    if (!event) return;

    const { data, error } = await supabase
      .from('planner_events')
      .update({ date: destDate })
      .eq('id', event.id)
      .select()
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to move workout:', error);
      return;
    }

    if (data) {
      setPlannerEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, date: destDate } : e))
      );
    }
  };

  /** -----------------------------
   *  CTA: Add & Rest Day
   *  ----------------------------- */
  const handleAddWorkoutClick = (date: string) => {
    setAddModal({ open: true, date });
  };

  const handleRestDayClick = async (date: string) => {
    if (!user) return;
    const existing = plannerEvents.find((e) => e.date === date && e.type === 'rest');
    if (existing) {
      const { error } = await supabase.from('planner_events').delete().eq('id', existing.id);
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete rest day:', error);
      }
      setPlannerEvents((events) => events.filter((e) => e.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('planner_events')
        .insert({
          user_id: user.id,
          date,
          type: 'rest',
          title: 'Rest Day',
        })
        .select()
        .single();

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to insert rest day:', error);
      }

      if (data) {
        setPlannerEvents((events) => [...events, data as PlannerEvent]);
      }
    }
  };

  /** -----------------------------
   *  Add flow: choose type
   *  ----------------------------- */
  const handleWorkoutTypeSelect = async (choice: string) => {
    if (!user) return;

    if (choice === 'External') {
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
        recurrence_rule: null,
        recurrence_end: null,
        color: '#FF7A18',
        reminder_minutes_before: null,
      });
      return;
    }

    if (choice === 'Workout Generator') {
      if (isBrowser) window.location.href = '/workout-generator';
      return;
    }

    if (choice === 'Workout Creator') {
      if (isBrowser) window.location.href = '/modules/workout/workout-creator';
      return;
    }

    // Quick add placeholder workout event
    const { data, error } = await supabase
      .from('planner_events')
      .insert({
        user_id: user.id,
        date: addModal.date,
        type: 'workout',
        title: `${choice}`,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to quick insert workout:', error);
    }

    if (data) setPlannerEvents((events) => [...events, data as PlannerEvent]);
    setAddModal({ open: false, date: '' });
  };

  /** -----------------------------
   *  External/Creator form helpers
   *  ----------------------------- */
  const handleExternalFormChange = <K extends keyof ExternalForm>(
    field: K,
    value: ExternalForm[K]
  ) => setExternalForm((prev) => ({ ...prev, [field]: value }));

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

  const handleExternalFormSubmit = async () => {
    if (!user || !addTypeModal.date) return;

    const payload: any = {
      user_id: user.id,
      date: addTypeModal.date,
      type: 'workout' as const,
      title: externalForm.name || 'Workout',
      notes: externalForm.notes || '',
      duration_min: Number(externalForm.duration || 0),
      completed: false,
      external: addTypeModal.type === 'External',
      hero_image_url: externalForm.hero_image_url || null,
      tags: externalForm.tags?.length ? externalForm.tags : null,
      creator_id: externalForm.creator_id || null,
      exercises: externalForm.exercises?.length ? externalForm.exercises : null,
      workout_type: externalForm.types?.[0] || 'Other',
      source: (addTypeModal.type === 'External' ? 'external' : 'creator') as WorkoutSource,
      recurrence_rule: externalForm.recurrence_rule || null,
      recurrence_end: externalForm.recurrence_end || null,
      color: externalForm.color || null,
      reminder_minutes_before: externalForm.reminder_minutes_before ?? null,
      time: externalForm.time || null,
    };

    const { data, error } = await supabase.from('planner_events').insert(payload).select().single();
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to insert external/creator workout:', error);
    }
    if (data) {
      setPlannerEvents((events) => [...events, data as PlannerEvent]);
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
        recurrence_rule: null,
        recurrence_end: null,
        color: '#FF7A18',
        reminder_minutes_before: null,
      });
    }
  };

  /** -----------------------------
   *  Edit / Complete / Delete
   *  ----------------------------- */
  const openEditFor = (id: string) => {
    const ev = plannerEvents.find((e) => e.id === id);
    if (!ev) return;

    setExternalForm((prev) => ({
      ...prev,
      name: ev.title || '',
      notes: ev.notes || '',
      time: ev.time || '07:00',
      types: ev.workout_type ? [normalizeWorkoutType(ev.workout_type)] : [],
      hero_image_url: ev.hero_image_url || '',
      tags: ev.tags || [],
      creator_id: ev.creator_id,
      exercises: ev.exercises || [],
      duration: Number(ev.duration_min || 0),
      recurrence_rule: ev.recurrence_rule ?? null,
      recurrence_end: ev.recurrence_end ?? null,
      color: ev.color ?? '#FF7A18',
      reminder_minutes_before: ev.reminder_minutes_before ?? null,
    }));

    setEditModal({ open: true, workoutId: id });
  };

  const handleEditFormSubmit = async () => {
    if (!editModal.workoutId) return;

    const payload: any = {
      title: externalForm.name || 'Workout',
      notes: externalForm.notes || '',
      duration_min: Number(externalForm.duration || 0),
      workout_type: externalForm.types?.[0] || 'Other',
      hero_image_url: externalForm.hero_image_url || null,
      tags: externalForm.tags?.length ? externalForm.tags : null,
      exercises: externalForm.exercises?.length ? externalForm.exercises : null,
      creator_id: externalForm.creator_id || null,
      recurrence_rule: externalForm.recurrence_rule || null,
      recurrence_end: externalForm.recurrence_end || null,
      color: externalForm.color || null,
      reminder_minutes_before: externalForm.reminder_minutes_before ?? null,
      time: externalForm.time || null,
    };

    const { data, error } = await supabase
      .from('planner_events')
      .update(payload)
      .eq('id', editModal.workoutId)
      .select()
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update workout:', error);
    }

    if (data) {
      setPlannerEvents((events) =>
        events.map((e) => (e.id === editModal.workoutId ? (data as PlannerEvent) : e))
      );
      setEditModal({ open: false, workoutId: null });
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    const { error } = await supabase.from('planner_events').delete().eq('id', id);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete workout:', error);
    }
    setPlannerEvents((events) => events.filter((e) => e.id !== id));
    if (editModal.open && editModal.workoutId === id) {
      setEditModal({ open: false, workoutId: null });
    }
    // Close detail panel if that item was open
    if (detailModal.open && detailModal.workout?.id === id) {
      setDetailModal({ open: false, workout: null });
    }
  };

  const handleCompleteWorkout = async (id: string) => {
    const event = plannerEvents.find((e) => e.id === id);
    if (!event) return;

    const { data, error } = await supabase
      .from('planner_events')
      .update({ completed: !event.completed })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle complete:', error);
    }

    if (data) {
      setPlannerEvents((events) => events.map((e) => (e.id === id ? (data as PlannerEvent) : e)));
      // sync the detail drawer if it is showing this workout
      if (detailModal.open && detailModal.workout?.id === id) {
        setDetailModal({ open: true, workout: data as PlannerEvent });
      }
    }
  };

  const handleRunWorkout = (creatorId: string) => {
    if (!isBrowser) return;
    // In the future: navigate(`/modules/workouts/execute?id=${creatorId}`)
    // For now:
    // eslint-disable-next-line no-alert
    alert('Start workout: ' + creatorId);
  };

  /** -----------------------------
   *  Background overlay (SSR-safe)
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
    <div className="w-full max-w-full px-1 sm:px-4" style={{ position: 'relative', zIndex: 1 }}>
      {/* KPIs at the very top for instant visibility */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 mt-2">
        <div className="rounded-xl border border-cyan-700 bg-black/60 p-4 flex flex-col items-center">
          <span className="text-3xl font-bold text-cyan-400">{completedCount}</span>
          <span className="text-white/80 text-sm mt-1">Workouts voltooid</span>
        </div>
        <div className="rounded-xl border border-cyan-700 bg-black/60 p-4 flex flex-col items-center">
          <span className="text-3xl font-bold text-cyan-400">{futureCount}</span>
          <span className="text-white/80 text-sm mt-1">Toekomstig gepland</span>
        </div>
        <div className="rounded-xl border border-yellow-600 bg-black/60 p-4 flex flex-col items-center">
          <span className="text-3xl font-bold text-yellow-400">{totalMinutes}</span>
          <span className="text-white/80 text-sm mt-1">Minuten getraind</span>
        </div>
      </div>

      {/* View Switcher - mobile friendly */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['Week', 'Month', 'Day'].map((view) => (
          <button
            key={view}
            className={`w-full xs:w-auto px-4 py-3 rounded-full font-semibold transition border-2 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400/60
              ${
                viewMode === view
                  ? 'bg-cyan-500 border-cyan-400 text-white shadow'
                  : 'bg-black/40 border-cyan-700 text-cyan-300 hover:bg-cyan-900/30'
              }`}
            style={{ minWidth: 90, marginBottom: 4 }}
            onClick={() => setViewMode(view as 'Week' | 'Month' | 'Day')}
            aria-pressed={viewMode === view}
          >
            {view}
          </button>
        ))}
      </div>

      {/* WEEK VIEW */}
      {viewMode === 'Week' && (
        <>

          {/* Week navigation */}
          <div className="flex flex-col xs:flex-row items-center justify-between gap-2 mb-2 sm:mb-4">
            <button
              onClick={handlePrevWeek}
              className="text-cyan-400 hover:text-cyan-200 text-2xl font-bold px-2"
              aria-label="Previous week"
            >
              {'<'}
            </button>
            <span className="text-lg font-semibold text-white/90">
              {weekDates[0].format('D MMM')} - {weekDates[6].format('D MMM YYYY')}{' '}
              <span className="text-cyan-400 font-normal ml-2">Week {weekNumber}</span>
            </span>
            <button
              onClick={handleNextWeek}
              className="text-cyan-400 hover:text-cyan-200 text-2xl font-bold px-2"
              aria-label="Next week"
            >
              {'>'}
            </button>
          </div>

          {/* Calendar days with drag-and-drop */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 gap-2 sm:gap-4">
              {weekDates.map((dateObj) => {
                const dateStr = dateObj.format('YYYY-MM-DD');
                const dayEvents = eventsByDate[dateStr] || [];
                const isRestDay = dayEvents.some((e) => e.type === 'rest');
                return (
                  <Droppable droppableId={dateStr} key={dateStr} direction="vertical">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        <div
                          className={`rounded-xl border ${
                            isRestDay ? 'border-yellow-600' : 'border-cyan-700'
                          } bg-black/50 p-4 flex flex-col gap-2 relative ${
                            snapshot.isDraggingOver ? 'ring-2 ring-cyan-400' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-white/90">
                              {dateObj.format('dddd D MMMM')}
                            </span>
                            <span className="text-xs text-cyan-300">Week {weekNumber}</span>
                          </div>
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => handleRestDayClick(dateStr)}
                              className={`text-xs px-2 py-1 rounded-full border ${
                                isRestDay
                                  ? 'border-yellow-400 text-yellow-400'
                                  : 'border-cyan-400 text-cyan-400'
                              } bg-transparent hover:bg-cyan-900/30 transition`}
                            >
                              {isRestDay ? 'Unset Restday' : 'Set Restday'}
                            </button>
                            <button
                              onClick={() => handleAddWorkoutClick(dateStr)}
                              className="text-xs px-2 py-1 rounded-full border border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-900/30 transition"
                            >
                              + Add Workout
                            </button>
                          </div>
                          {/* Render events for this day with DnD */}
                          <div className="flex flex-col gap-2 min-h-[32px]">
                            {dayEvents.filter((e) => e.type === 'workout').length === 0 &&
                              !isRestDay && (
                                <span className="text-sm text-gray-400">No workouts planned.</span>
                              )}
                            {dayEvents
                              .filter((e) => e.type === 'workout')
                              .map((event, idx) => {
                                // Use event.color if present, otherwise fallback to neon logic
                                let color = event.color ?? undefined;
                                if (!color) {
                                  color = NEON_ORANGE;
                                  if (event.type === 'rest') color = NEON_YELLOW;
                                  else if (event.workout_type) {
                                    const t = normalizeWorkoutType(event.workout_type);
                                    if (t === 'Run') color = NEON_GREEN;
                                    else if (t === 'Strength') color = NEON_ORANGE;
                                    else if (t === 'Hybrid') color = NEON_PURPLE;
                                    else if (t === 'Cardio') color = NEON_BLUE;
                                    else if (t === 'Mobility' || t === 'Stretching' || t === 'Zen')
                                      color = NEON_YELLOW;
                                  } else if (
                                    event.source &&
                                    SOURCE_NEON[event.source as WorkoutSource]
                                  ) {
                                    color = SOURCE_NEON[event.source as WorkoutSource];
                                  }
                                }
                                return (
                                  <Draggable draggableId={event.id} index={idx} key={event.id}>
                                    {(dragProvided, dragSnapshot) => (
                                      <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        className="rounded-lg border p-3 flex items-center justify-between cursor-pointer bg-opacity-90"
                                        style={{
                                          borderColor: color,
                                          background: dragSnapshot.isDragging
                                            ? `${color}22`
                                            : `${color}12`,
                                          ...dragProvided.draggableProps.style,
                                        }}
                                        onClick={() => openEditFor(event.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            openEditFor(event.id);
                                          }
                                        }}
                                      >
                                        <div className="min-w-0">
                                          <span className="text-white font-semibold break-words">
                                            {event.title || 'Workout'}
                                          </span>
                                          {event.duration_min ? (
                                            <span className="ml-2 text-xs text-yellow-400">
                                              {event.duration_min} min
                                            </span>
                                          ) : null}
                                          <div className="flex gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                                            {event.notes && (
                                              <span className="truncate max-w-[240px]">
                                                {event.notes}
                                              </span>
                                            )}
                                            <span>
                                              {moment(event.date).format('ddd D MMM YYYY')}
                                            </span>
                                            {event.time && <span>{event.time}</span>}
                                            {event.workout_type && (
                                              <span
                                                className="px-2 py-0.5 rounded border"
                                                style={{ borderColor: color, color: color }}
                                              >
                                                {event.workout_type}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div
                                          className="flex flex-wrap gap-3 shrink-0 mt-2 md:mt-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            onClick={() => openEditFor(event.id)}
                                            className="rounded-full bg-cyan-900/30 text-cyan-400 hover:bg-cyan-700 hover:text-white p-3 text-xl flex items-center justify-center"
                                            aria-label="Edit"
                                            title="Edit"
                                            style={{ minWidth: 44, minHeight: 44 }}
                                          >
                                            <FaRegEdit />
                                          </button>
                                          <button
                                            onClick={() => handleCompleteWorkout(event.id)}
                                            className={`rounded-full bg-green-900/20 ${event.completed ? 'text-green-400' : 'text-gray-400'} hover:bg-green-700 hover:text-white p-3 text-xl flex items-center justify-center`}
                                            aria-label="Toggle complete"
                                            title="Mark as complete"
                                            style={{ minWidth: 44, minHeight: 44 }}
                                          >
                                            <FaCheckCircle />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteWorkout(event.id)}
                                            className="rounded-full bg-red-900/20 text-red-400 hover:bg-red-700 hover:text-white p-3 text-xl flex items-center justify-center"
                                            aria-label="Delete"
                                            title="Delete"
                                            style={{ minWidth: 44, minHeight: 44 }}
                                          >
                                            <FaRegTrashAlt />
                                          </button>
                                          {event.external && (
                                            <button
                                              onClick={() =>
                                                event.creator_id &&
                                                handleRunWorkout(event.creator_id)
                                              }
                                              className="rounded-full bg-purple-700 text-white font-semibold px-5 py-3 text-lg flex items-center gap-2 ml-1"
                                              style={{ minWidth: 80 }}
                                              aria-label="Start workout"
                                              title="Start"
                                            >
                                              <FaPlay /> Start
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                            {provided.placeholder}
                          </div>
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'Month' && (
        <>
          <div className="flex flex-col xs:flex-row items-center justify-between gap-2 mb-2 sm:mb-4">
            <button
              onClick={() => setCurrentMonth((m) => m.clone().subtract(1, 'month'))}
              className="text-cyan-400 hover:text-cyan-200 text-2xl font-bold px-2"
              aria-label="Previous month"
            >
              {'<'}
            </button>
            <span className="text-lg font-semibold text-white/90">{monthLabel}</span>
            <button
              onClick={() => setCurrentMonth((m) => m.clone().add(1, 'month'))}
              className="text-cyan-400 hover:text-cyan-200 text-2xl font-bold px-2"
              aria-label="Next month"
            >
              {'>'}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 bg-black/40 rounded-xl overflow-hidden text-xs sm:text-base">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-cyan-300 text-center py-2 font-semibold bg-black/60">
                {d}
              </div>
            ))}

            {monthDays.map((day) => {
              const dateStr = day.format('YYYY-MM-DD');
              const isCurrentMonth = day.month() === currentMonth.month();
              const isToday = day.isSame(moment(), 'day');
              const events = eventsByDateMonth[dateStr] || [];
              return (
                <div
                  key={dateStr}
                  className={`min-h-[56px] sm:min-h-[80px] p-0.5 sm:p-1 border border-black/30 flex flex-col rounded-lg cursor-pointer transition group
                      ${isCurrentMonth ? 'bg-black/70' : 'bg-black/30 opacity-60'}
                      ${isToday ? 'ring-2 ring-cyan-400' : ''}`}
                  onClick={() => setAddModal({ open: true, date: dateStr })}
                  onDoubleClick={() => setAddModal({ open: true, date: dateStr })}
                  tabIndex={0}
                  aria-label={`Add or view events for ${day.format('dddd, D MMMM YYYY')}`}
                >
                  <div className="text-[10px] sm:text-xs text-cyan-200 font-bold mb-0.5 sm:mb-1 text-right pr-0.5 sm:pr-1">
                    {day.date()}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {events.map((event) => {
                      const color = event.color || NEON_ORANGE;
                      return (
                        <div
                          key={event.id}
                          className="truncate text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded mb-0.5 font-semibold"
                          style={{
                            background: `${color}22`,
                            color: color,
                            border: `1px solid ${color}`,
                          }}
                          title={event.title || 'Workout'}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditFor(event.id);
                          }}
                        >
                          {event.title || event.workout_type || 'Workout'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* DAY VIEW */}
      {viewMode === 'Day' && (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 items-center py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              className="text-cyan-400 hover:text-cyan-200 text-2xl font-bold px-2"
              aria-label="Previous day"
              onClick={() => setCurrentDay((d) => d.clone().subtract(1, 'day'))}
            >
              {'<'}
            </button>
            <input
              type="date"
              className="bg-black/60 border border-cyan-700 rounded-lg px-3 py-1 text-cyan-200 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={currentDay.format('YYYY-MM-DD')}
              onChange={e => setCurrentDay(moment(e.target.value))}
              style={{ minWidth: 160 }}
            />
            <button
              className="text-cyan-400 hover:text-cyan-200 text-2xl font-bold px-2"
              aria-label="Next day"
              onClick={() => setCurrentDay((d) => d.clone().add(1, 'day'))}
            >
              {'>'}
            </button>
          </div>
          <div className="w-full flex flex-col gap-4">
            {eventsForCurrentDay.length === 0 ? (
              <div className="text-gray-400 text-center text-base">No workouts or events planned for this day.</div>
            ) : (
              eventsForCurrentDay.map((event, idx) => {
                let color = event.color;
                if (!color) {
                  color = NEON_ORANGE;
                  if (event.type === 'rest') color = NEON_YELLOW;
                  else if (event.workout_type) {
                    const t = normalizeWorkoutType(event.workout_type);
                    if (t === 'Run') color = NEON_GREEN;
                    else if (t === 'Strength') color = NEON_ORANGE;
                    else if (t === 'Hybrid') color = NEON_PURPLE;
                    else if (t === 'Cardio') color = NEON_BLUE;
                    else if (t === 'Mobility' || t === 'Stretching' || t === 'Zen')
                      color = NEON_YELLOW;
                  } else if (event.source && SOURCE_NEON[event.source as WorkoutSource]) {
                    color = SOURCE_NEON[event.source as WorkoutSource];
                  }
                }
                return (
                  <div
                    key={event.id}
                    className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer bg-opacity-90"
                    style={{
                      borderColor: color,
                      background: `${color}12`,
                    }}
                    onClick={() => openEditFor(event.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        openEditFor(event.id);
                      }
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-white font-semibold text-lg break-words">
                        {event.title || 'Workout'}
                      </span>
                      {event.duration_min ? (
                        <span className="ml-2 text-xs text-yellow-400">
                          {event.duration_min} min
                        </span>
                      ) : null}
                      <div className="flex gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                        {event.notes && (
                          <span className="truncate max-w-[240px]">
                            {event.notes}
                          </span>
                        )}
                        <span>{moment(event.date).format('ddd D MMM YYYY')}</span>
                        {event.time && <span>{event.time}</span>}
                        {event.workout_type && (
                          <span
                            className="px-2 py-0.5 rounded border"
                            style={{ borderColor: color, color: color }}
                          >
                            {event.workout_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0 self-end sm:self-center mt-2 md:mt-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openEditFor(event.id);
                        }}
                        className="rounded-full bg-cyan-900/30 text-cyan-400 hover:bg-cyan-700 hover:text-white p-3 text-xl flex items-center justify-center"
                        aria-label="Edit"
                        title="Edit"
                        style={{ minWidth: 44, minHeight: 44 }}
                      >
                        <FaRegEdit />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCompleteWorkout(event.id);
                        }}
                        className={`rounded-full bg-green-900/20 ${event.completed ? 'text-green-400' : 'text-gray-400'} hover:bg-green-700 hover:text-white p-3 text-xl flex items-center justify-center`}
                        aria-label="Toggle complete"
                        title="Mark as complete"
                        style={{ minWidth: 44, minHeight: 44 }}
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteWorkout(event.id);
                        }}
                        className="rounded-full bg-red-900/20 text-red-400 hover:bg-red-700 hover:text-white p-3 text-xl flex items-center justify-center"
                        aria-label="Delete"
                        title="Delete"
                        style={{ minWidth: 44, minHeight: 44 }}
                      >
                        <FaRegTrashAlt />
                      </button>
                      {event.external && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            event.creator_id && handleRunWorkout(event.creator_id);
                          }}
                          className="rounded-full bg-purple-700 text-white font-semibold px-5 py-3 text-lg flex items-center gap-2 ml-1"
                          style={{ minWidth: 80 }}
                          aria-label="Start workout"
                          title="Start"
                        >
                          <FaPlay /> Start
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Workout Modal - mobile friendly buttons */}
      {addModal.open && (
        <Modal onClose={() => setAddModal({ open: false, date: '' })}>
          <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-0">
            <h2 className="font-extrabold text-lg sm:text-2xl mb-2 text-cyan-300 flex items-center gap-2">
              <FaRegEdit className="text-cyan-400" /> Plan a New Workout
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                className="w-full py-4 rounded-2xl font-semibold shadow-md border-2 border-cyan-400 bg-black/40 hover:bg-cyan-900/30 transition flex flex-row items-center gap-3 text-lg"
                onClick={() => handleWorkoutTypeSelect('Workout Library')}
                aria-label="Add from Workout Library"
              >
                <span className="text-cyan-300 text-2xl">🏋️‍♂️</span>
                <span>Workout Library</span>
              </button>
              <button
                className="w-full py-4 rounded-2xl font-semibold shadow-md border-2 border-yellow-400 bg-black/40 hover:bg-yellow-900/20 transition flex flex-row items-center gap-3 text-lg"
                onClick={() => handleWorkoutTypeSelect('Community Workouts')}
                aria-label="Add Community Workout"
              >
                <span className="text-yellow-300 text-2xl">🤝</span>
                <span>Community</span>
              </button>
              <button
                className="w-full py-4 rounded-2xl font-semibold shadow-md border-2 border-purple-400 bg-black/40 hover:bg-purple-900/20 transition flex flex-row items-center gap-3 text-lg"
                onClick={() => handleWorkoutTypeSelect('Workout Creator')}
                aria-label="Create Custom Workout"
              >
                <span className="text-purple-300 text-2xl">🛠️</span>
                <span>Creator</span>
              </button>
              <button
                className="w-full py-4 rounded-2xl font-semibold shadow-md border-2 border-orange-400 bg-black/40 hover:bg-orange-900/20 transition flex flex-row items-center gap-3 text-lg"
                onClick={() => handleWorkoutTypeSelect('Workout Generator')}
                aria-label="Generate Workout"
              >
                <span className="text-orange-300 text-2xl">⚡</span>
                <span>Generator</span>
              </button>
              <button
                className="w-full py-4 rounded-2xl font-semibold shadow-md border-2 border-blue-400 bg-black/40 hover:bg-blue-900/20 transition flex flex-row items-center gap-3 text-lg"
                onClick={() => handleWorkoutTypeSelect('External')}
                aria-label="Add External Workout"
              >
                <span className="text-blue-300 text-2xl">🌐</span>
                <span>External Workout</span>
              </button>
            </div>
            <div className="text-base text-gray-400 mt-2 text-center">
              Choose a source to start planning your workout for{' '}
              <span className="text-cyan-200 font-semibold">{addModal.date}</span>.
            </div>
          </div>
        </Modal>
      )}

      {/* AddTypeModal (Creator/External) */}
      {addTypeModal.open && (
        <Modal onClose={() => setAddTypeModal({ open: false, date: '', type: '' })}>
          <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-0">
            <h2
              className="font-extrabold text-lg sm:text-2xl mb-2 flex items-center gap-2"
              style={{ color: addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE }}
            >
              {addTypeModal.type === 'Creator' ? (
                <>
                  <FaRegEdit className="text-orange-400" /> Plan Custom Workout
                </>
              ) : (
                <>
                  <FaRegEdit className="text-blue-400" /> Add External Workout
                </>
              )}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Color Picker */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Event Color</label>
                <input
                  type="color"
                  className="w-12 h-8 p-0 border-2 rounded"
                  value={externalForm.color || '#FF7A18'}
                  onChange={(e) => handleExternalFormChange('color', e.target.value)}
                  aria-label="Pick event color"
                />
              </div>
              {/* Reminder Picker */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Reminder</label>
                <select
                  className="rounded p-2 border-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/40 text-white"
                  value={externalForm.reminder_minutes_before ?? ''}
                  onChange={(e) =>
                    handleExternalFormChange(
                      'reminder_minutes_before',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">No reminder</option>
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Name</label>
                <input
                  className="rounded p-2 border-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    borderColor: addTypeModal.type === 'External' ? NEON_BLUE : NEON_ORANGE,
                  }}
                  value={externalForm.name}
                  onChange={(e) => handleExternalFormChange('name', e.target.value)}
                  placeholder="Workout name"
                  required
                  maxLength={60}
                />
              </div>
              {/* Additional fields can be added here as needed */}
              <button
                className="w-full py-3 mt-2 rounded-xl font-bold shadow-md text-lg tracking-wide"
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
          </div>
        </Modal>
      )}

      {/* Edit Workout Modal */}
      {editModal.open && (
        <Modal onClose={() => setEditModal({ open: false, workoutId: null })}>
          <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-0">
            <h2
              className="font-extrabold text-lg sm:text-2xl mb-2 flex items-center gap-2"
              style={{ color: NEON_ORANGE }}
            >
              <FaRegEdit className="text-orange-400" /> Edit Workout
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Color Picker */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Event Color</label>
                <input
                  type="color"
                  className="w-12 h-8 p-0 border-2 rounded"
                  value={externalForm.color || '#FF7A18'}
                  onChange={(e) => handleExternalFormChange('color', e.target.value)}
                  aria-label="Pick event color"
                />
              </div>
              {/* Reminder Picker */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Reminder</label>
                <select
                  className="rounded p-2 border-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-black/40 text-white"
                  value={externalForm.reminder_minutes_before ?? ''}
                  onChange={(e) =>
                    handleExternalFormChange(
                      'reminder_minutes_before',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">No reminder</option>
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Name</label>
                <input
                  className="rounded p-2 border-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    borderColor: NEON_ORANGE,
                  }}
                  value={externalForm.name}
                  onChange={(e) => handleExternalFormChange('name', e.target.value)}
                  placeholder="Workout name"
                  required
                  maxLength={60}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Notes</label>
                <textarea
                  className="rounded p-2 border-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    borderColor: NEON_ORANGE,
                  }}
                  value={externalForm.notes}
                  onChange={(e) => handleExternalFormChange('notes', e.target.value)}
                  placeholder="Notes"
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Time</label>
                  <input
                    type="time"
                    className="rounded p-2 border-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    style={{
                      background: 'transparent',
                      color: '#fff',
                      borderColor: NEON_ORANGE,
                    }}
                    value={externalForm.time}
                    onChange={(e) => handleExternalFormChange('time', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Duration (min)</label>
                  <input
                    type="number"
                    min={0}
                    className="rounded p-2 border-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    style={{
                      background: 'transparent',
                      color: '#fff',
                      borderColor: NEON_ORANGE,
                    }}
                    value={externalForm.duration}
                    onChange={(e) =>
                      handleExternalFormChange('duration', Number(e.target.value || 0))
                    }
                    placeholder="e.g. 45"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
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
                        title={selected ? 'Remove type' : disabled ? 'Max 3 types' : 'Select type'}
                      >
                        <span style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="w-full py-3 rounded-xl font-bold shadow-md text-lg tracking-wide"
                  style={{ background: NEON_ORANGE, color: '#181A1B', fontSize: 18 }}
                  onClick={handleEditFormSubmit}
                >
                  UPDATE
                </button>
                <button
                  className="w-full py-3 rounded-xl font-bold shadow-md text-lg tracking-wide border-2"
                  style={{
                    background: 'transparent',
                    color: NEON_ORANGE,
                    borderColor: NEON_ORANGE,
                    fontSize: 18,
                  }}
                  onClick={() => editModal.workoutId && handleDeleteWorkout(editModal.workoutId)}
                >
                  <FaRegTrashAlt className="inline mr-1" />
                  DELETE
                </button>
              </div>
              <button
                className="w-full py-3 rounded-xl font-bold shadow-md text-lg tracking-wide border-2 mt-2"
                style={{
                  background: 'transparent',
                  color: NEON_ORANGE,
                  borderColor: NEON_ORANGE,
                  fontSize: 18,
                }}
                onClick={() => editModal.workoutId && handleCompleteWorkout(editModal.workoutId)}
              >
                {plannerEvents.find((w) => w.id === editModal.workoutId)?.completed ? (
                  <>
                    <FaCheckCircle color={NEON_ORANGE} className="inline mr-1" /> Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>
              <button
                className="w-full py-3 rounded-xl font-bold shadow-md text-lg tracking-wide mt-2"
                style={{
                  background: NEON_ORANGE,
                  color: '#181A1B',
                  border: `1.5px solid ${NEON_ORANGE}`,
                  fontSize: 18,
                }}
                onClick={() => {
                  const w = plannerEvents.find((x) => x.id === editModal.workoutId);
                  if (w?.creator_id) handleRunWorkout(w.creator_id);
                }}
              >
                START
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
});

/** -----------------------------
 *  Simple Modal component
 *  ----------------------------- */
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
    role="dialog"
    aria-modal="true"
  >
    <div
      className="bg-gray-900 rounded-xl p-6 w-full max-w-md relative"
      style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.4)', color: '#fff' }}
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
