import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/nl';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaRegEdit, FaCheckCircle, FaRegTrashAlt, FaPlay, FaSpinner, FaRedo } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  createWorkoutEvent,
  updateRecurringEvent,
  deleteRecurringEvent,
  generateRecurringEvents,
} from '../lib/planner.service';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PlannerSchedulePayload, ProgramSchedulingData } from '../lib/planner-payload';
import { ProgramSchedulingModal } from './ui/ProgramSchedulingModal';
import { calculateDateForDay, mapPreferredTimeToActualTime, addWeeks } from '../lib/date-utils';

moment.locale('nl');

// --- Types ---
type WorkoutType = 'Run' | 'Strength' | 'Hybrid' | 'Cardio' | 'Mobility' | 'Stretching' | 'Zen';
type WorkoutSource = 'Peloton' | 'Nike' | 'Strava' | 'Apple' | 'Manual';

interface CalendarEvent {
  id: string;
  user_id: string;
  type: 'workout' | 'rest';
  date: string;
  title?: string;
  workout_type?: string;
  time?: string;
  duration_min?: number;
  notes?: string;
  completed?: boolean;
  source?: string;
  workout_id?: string | null;
  color?: string;
  recurring_rule?: string;
  recurrence_end?: string;
  parent_event_id?: string;
  reminder_minutes?: number;
  reminder_sent?: boolean;
  created_at?: string;
  updated_at?: string;
  meta?: Record<string, unknown>;
}

// --- Color Constants ---
const NEON_GREEN = '#39FF14';
const NEON_ORANGE = '#FF6700';
const NEON_PURPLE = '#BC13FE';
const NEON_BLUE = '#00D9FF';
const NEON_YELLOW = '#FFFF00';

const SOURCE_NEON: Record<WorkoutSource, string> = {
  Peloton: NEON_ORANGE,
  Nike: NEON_GREEN,
  Strava: NEON_ORANGE,
  Apple: NEON_BLUE,
  Manual: NEON_PURPLE,
};

const WORKOUT_TYPE_COLORS: Record<string, string> = {
  Run: NEON_GREEN,
  Strength: NEON_ORANGE,
  Hybrid: NEON_PURPLE,
  Cardio: NEON_BLUE,
  Mobility: NEON_YELLOW,
  Stretching: NEON_YELLOW,
  Zen: NEON_YELLOW,
};

// --- Utility Functions ---
const normalizeWorkoutType = (type: string): WorkoutType => {
  const lower = type.toLowerCase();
  if (lower.includes('run')) return 'Run';
  if (lower.includes('strength') || lower.includes('weights')) return 'Strength';
  if (lower.includes('hybrid')) return 'Hybrid';
  if (lower.includes('cardio') || lower.includes('cycling') || lower.includes('bike')) return 'Cardio';
  if (lower.includes('mobility') || lower.includes('stretch') || lower.includes('yoga') || lower.includes('zen'))
    return 'Mobility';
  return 'Cardio';
};

// --- Modal Component ---
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-2xl font-bold text-cyan-300 mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

// --- Loading Spinner Component ---
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <FaSpinner className="animate-spin text-cyan-400 text-3xl" />
  </div>
);

// --- Main Component ---
export type PlannerCalendarHandle = {
  openAddModalForToday: () => void;
};

const PlannerCalendar = forwardRef<PlannerCalendarHandle>((_, ref) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- State ---
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'Week' | 'Month' | 'Day'>('Week');
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('isoWeek'));
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [currentDay, setCurrentDay] = useState(moment());
  const [addModal, setAddModal] = useState<{ open: boolean; date: string }>({ open: false, date: '' });
  const [editModal, setEditModal] = useState<{ open: boolean; eventId: string }>({ open: false, eventId: '' });
  const [typeModal, setTypeModal] = useState<{ open: boolean; date: string }>({ open: false, date: '' });
  const [restDayModal, setRestDayModal] = useState<{ open: boolean; date: string; eventId?: string }>({
    open: false,
    date: '',
    eventId: undefined
  });

  // Add workout modal state
  const [addWorkoutTime, setAddWorkoutTime] = useState<string>('');

  // Rest day modal state
  const [restDayNotes, setRestDayNotes] = useState<string>('');

  // Edit modal state
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editWorkoutType, setEditWorkoutType] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editReminderMinutes, setEditReminderMinutes] = useState<number>(0);
  const [editRecurringRule, setEditRecurringRule] = useState<string>('');
  const [showRecurringPrompt, setShowRecurringPrompt] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<{ eventId: string; updates: Partial<CalendarEvent> } | null>(null);
  const [generatorModal, setGeneratorModal] = useState<{
    open: boolean;
    payload: PlannerSchedulePayload | null;
  }>({ open: false, payload: null });
  const [generatorForm, setGeneratorForm] = useState<{
    date: string;
    time: string;
    reminderMinutes: number;
  }>({
    date: moment().format('YYYY-MM-DD'),
    time: '',
    reminderMinutes: 0,
  });
  const [programModal, setProgramModal] = useState<{
    open: boolean;
    data: ProgramSchedulingData | null;
  }>({ open: false, data: null });
  const [isProgramScheduling, setIsProgramScheduling] = useState(false);

  const sortEventsByDate = (list: CalendarEvent[]) =>
    list
      .slice()
      .sort((a, b) => {
        const dateDiff = moment(a.date).diff(moment(b.date));
        if (dateDiff !== 0) return dateDiff;
        const timeA = a.time || '';
        const timeB = b.time || '';
        return timeA.localeCompare(timeB);
      });

  // --- Expose methods via ref ---
  useImperativeHandle(ref, () => ({
    openAddModalForToday: () => {
      const today = moment().format('YYYY-MM-DD');
      setAddModal({ open: true, date: today });
    },
  }));

  useEffect(() => {
    const state = location.state as Record<string, unknown> | undefined;

    // Handle regular workout payload
    const payloadId = state?.plannerAddWorkoutId as string | undefined;
    const storedPayload =
      typeof window !== 'undefined' && payloadId ? sessionStorage.getItem(payloadId) : null;

    const inlinePayload = state?.plannerAddWorkout as PlannerSchedulePayload | undefined;

    let payload: PlannerSchedulePayload | null = null;

    if (storedPayload) {
      try {
        payload = JSON.parse(storedPayload) as PlannerSchedulePayload;
        console.log('[Planner] Loaded payload from sessionStorage:', payloadId, payload);
        sessionStorage.removeItem(payloadId!);
      } catch (error) {
        console.error('[Planner] Failed to load planner payload from storage', error);
        toast.error('Kon gegenereerde workout niet laden');
      }
    } else if (inlinePayload) {
      console.log('[Planner] Received inline payload via navigation state', inlinePayload);
      payload = inlinePayload;
    }

    if (payload) {
      console.log('[Planner] Opening generator modal with payload', payload);
      setGeneratorModal({ open: true, payload });
      setGeneratorForm({
        date: payload.suggestedDate || moment().format('YYYY-MM-DD'),
        time: payload.suggestedTime || '',
        reminderMinutes: 0,
      });
    }

    // Handle program scheduling data
    const programId = state?.plannerProgramId as string | undefined;
    const storedProgram =
      typeof window !== 'undefined' && programId ? sessionStorage.getItem(programId) : null;

    if (storedProgram) {
      try {
        const programData = JSON.parse(storedProgram) as ProgramSchedulingData;
        console.log('[Planner] Loaded program data from sessionStorage:', programId, programData);
        sessionStorage.removeItem(programId);
        setProgramModal({ open: true, data: programData });
      } catch (error) {
        console.error('[Planner] Failed to load program data from storage', error);
        toast.error('Kon programma niet laden');
      }
    }

    if (state?.plannerAddWorkoutId || state?.plannerAddWorkout || state?.plannerProgramId) {
      console.log('[Planner] Cleaning router state after consuming payload');
      const nextState = { ...state };
      delete (nextState as any).plannerAddWorkout;
      delete (nextState as any).plannerAddWorkoutId;
      delete (nextState as any).plannerProgramId;
      navigate(location.pathname, { replace: true, state: nextState });
    }
  }, [location, navigate]);

  // --- Load events from Supabase ---
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('planner_events')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (error) throw error;
        if (!cancelled && data) {
          setEvents(data as CalendarEvent[]);
        }
      } catch (e) {
        console.error('Failed to load events:', e);
        toast.error('Kon events niet laden');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Try to migrate localStorage data to Supabase on first load
    const migrateLocalStorage = async () => {
      const stored = localStorage.getItem('plannerEvents');
      if (stored && user) {
        try {
          const localEvents = JSON.parse(stored) as CalendarEvent[];
          if (localEvents.length > 0) {
            // Add user_id to each event and insert to Supabase
            const eventsToInsert = localEvents.map((event) => ({
              ...event,
              user_id: user.id,
              id: undefined, // Let Supabase generate new IDs
            }));

            const { error } = await supabase
              .from('planner_events')
              .insert(eventsToInsert);

            if (!error) {
              console.log('Migrated localStorage events to Supabase');
              localStorage.removeItem('plannerEvents');
              toast.success('Je oude workouts zijn gemigreerd!');
            }
          }
        } catch (e) {
          console.error('Failed to migrate localStorage events:', e);
        }
      }
    };

    migrateLocalStorage().then(() => loadEvents());

    return () => {
      cancelled = true;
    };
  }, [user]);

  // --- Computed Values ---
  const weekDates = Array.from({ length: 7 }, (_, i) => currentWeek.clone().add(i, 'days'));
  const weekNumber = currentWeek.isoWeek();

  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const completedCount = events.filter((e) => e.completed && e.type === 'workout').length;
  const futureCount = events.filter(
    (e) => !e.completed && e.type === 'workout' && moment(e.date).isSameOrAfter(moment(), 'day')
  ).length;
  const totalMinutes = events
    .filter((e) => e.completed && e.type === 'workout')
    .reduce((sum, e) => sum + (e.duration_min || 0), 0);

  // Month view
  const monthLabel = currentMonth.format('MMMM YYYY');
  const firstDayOfMonth = currentMonth.clone().startOf('month');
  const startOfCalendar = firstDayOfMonth.clone().startOf('isoWeek');
  const monthDays = Array.from({ length: 42 }, (_, i) => startOfCalendar.clone().add(i, 'days'));

  const eventsByDateMonth = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Day view
  const eventsForCurrentDay = events.filter((e) => e.date === currentDay.format('YYYY-MM-DD'));

  // --- Handlers ---
  const handlePrevWeek = () => setCurrentWeek((w) => w.clone().subtract(1, 'week'));
  const handleNextWeek = () => setCurrentWeek((w) => w.clone().add(1, 'week'));

  const handleRestDayClick = (dateStr: string) => {
    if (!user) return;
    const dayEvents = eventsByDate[dateStr] || [];
    const restEvent = dayEvents.find((e) => e.type === 'rest');

    if (restEvent) {
      // Edit existing rest day
      setRestDayNotes(restEvent.notes || '');
      setRestDayModal({ open: true, date: dateStr, eventId: restEvent.id });
    } else {
      // Add new rest day
      setRestDayNotes('');
      setRestDayModal({ open: true, date: dateStr, eventId: undefined });
    }
  };

  const handleSaveRestDay = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (restDayModal.eventId) {
        // Update existing rest day
        const { data, error } = await supabase
          .from('planner_events')
          .update({ notes: restDayNotes })
          .eq('id', restDayModal.eventId)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setEvents((prev) => prev.map((e) => (e.id === restDayModal.eventId ? (data as CalendarEvent) : e)));
          toast.success('Rustdag bijgewerkt');
        }
      } else {
        // Create new rest day
        const newRest: Partial<CalendarEvent> = {
          user_id: user.id,
          type: 'rest',
          date: restDayModal.date,
          title: 'Rest Day',
          notes: restDayNotes || undefined,
          color: NEON_YELLOW,
          completed: false,
        };

        const { data, error } = await supabase
          .from('planner_events')
          .insert(newRest)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setEvents((prev) => [...prev, data as CalendarEvent]);
          toast.success('Rustdag toegevoegd');
        }
      }

      setRestDayModal({ open: false, date: '', eventId: undefined });
      setRestDayNotes('');
    } catch (e) {
      console.error('Failed to save rest day:', e);
      toast.error('Kon rustdag niet opslaan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestDay = async () => {
    if (!restDayModal.eventId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('planner_events')
        .delete()
        .eq('id', restDayModal.eventId);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== restDayModal.eventId));
      toast.success('Rustdag verwijderd');
      setRestDayModal({ open: false, date: '', eventId: undefined });
      setRestDayNotes('');
    } catch (e) {
      console.error('Failed to delete rest day:', e);
      toast.error('Kon rustdag niet verwijderen');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkoutClick = (dateStr: string) => {
    setAddWorkoutTime('');
    setTypeModal({ open: true, date: dateStr });
  };

  const handleCompleteWorkout = async (id: string) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;

    // Optimistic update - update UI immediately
    const newCompletedState = !event.completed;
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: newCompletedState } : e)));

    // Show immediate feedback
    toast.success(newCompletedState ? 'Workout voltooid! 🎉' : 'Workout gemarkeerd als niet voltooid');

    try {
      // Update in background
      const { data, error } = await supabase
        .from('planner_events')
        .update({ completed: newCompletedState })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Sync with server response to ensure consistency
      if (data) {
        setEvents((prev) => prev.map((e) => (e.id === id ? (data as CalendarEvent) : e)));
        if (
          !event.completed &&
          newCompletedState &&
          event.meta &&
          typeof event.meta === 'object' &&
          (event.meta as any).generator &&
          user
        ) {
          try {
            await supabase.from('user_workout_history').insert({
              user_id: user.id,
              exercise_id: id,
              completed_at: new Date().toISOString(),
              notes: 'planner_generated',
            });
          } catch (historyError) {
            console.error('Failed to log workout completion history', historyError);
          }
        }
      }
    } catch (e) {
      console.error('Failed to toggle workout completion:', e);
      // Rollback on error
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: event.completed } : e)));
      toast.error('Kon workout status niet bijwerken - wijziging teruggedraaid');
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze workout wilt verwijderen?')) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('planner_events').delete().eq('id', id);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Workout verwijderd');
    } catch (e) {
      console.error('Failed to delete workout:', e);
      toast.error('Kon workout niet verwijderen');
    } finally {
      setLoading(false);
    }
  };

  const handleRunWorkout = (workoutId: string) => {
    toast('Workout starten binnenkort beschikbaar!', { icon: '🏃' });
  };

  const openEditFor = (id: string) => {
    const event = events.find((e) => e.id === id);
    if (event) {
      setEditTitle(event.title || '');
      setEditDuration(event.duration_min || 0);
      setEditNotes(event.notes || '');
      setEditTime(event.time || '');
      setEditWorkoutType(event.workout_type || '');
      setEditColor(event.color || '');
      setEditReminderMinutes(event.reminder_minutes || 0);
      setEditRecurringRule(event.recurring_rule || '');
      setEditModal({ open: true, eventId: id });
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newDate = destination.droppableId;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('planner_events')
        .update({ date: newDate })
        .eq('id', draggableId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setEvents((prev) => prev.map((e) => (e.id === draggableId ? (data as CalendarEvent) : e)));
        toast.success('Workout verplaatst');
      }
    } catch (e) {
      console.error('Failed to move event:', e);
      toast.error('Kon workout niet verplaatsen');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = async (type: string, date: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const newWorkout = {
        type: 'workout' as const,
        date,
        title: `${type} Workout`,
        workout_type: type,
        duration_min: 30,
        time: addWorkoutTime || undefined,
        color: WORKOUT_TYPE_COLORS[type] || NEON_ORANGE,
        completed: false,
      };

      // Use the service to handle recurring events
      const endDate = moment(date).add(3, 'months').format('YYYY-MM-DD');
      const { data, error } = await createWorkoutEvent(newWorkout, endDate);

      if (error) throw error;
      if (data) {
        // Reload events to get any generated recurring instances
        const { data: allEvents } = await supabase
          .from('planner_events')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (allEvents) {
          setEvents(allEvents as CalendarEvent[]);
        }

        setTypeModal({ open: false, date: '' });
        setAddWorkoutTime('');
        toast.success(`${type} workout toegevoegd!`);
      }
    } catch (e) {
      console.error('Failed to add workout:', e);
      toast.error('Kon workout niet toevoegen');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (eventId: string, updates: Partial<CalendarEvent>, updateFuture: boolean = false) => {
    // Validation
    if (updates.title !== undefined && !updates.title.trim()) {
      toast.error('Titel mag niet leeg zijn');
      return;
    }
    if (updates.duration_min !== undefined && updates.duration_min < 0) {
      toast.error('Duur mag niet negatief zijn');
      return;
    }

    const event = events.find((e) => e.id === eventId);

    // Check if this is a recurring event
    if (event && (event.recurring_rule || event.parent_event_id) && !showRecurringPrompt) {
      // Store pending edit and show prompt
      setPendingEdit({ eventId, updates });
      setShowRecurringPrompt(true);
      return;
    }

    try {
      setLoading(true);

      if (updateFuture && (event?.recurring_rule || event?.parent_event_id)) {
        // Update this and all future instances
        const { success, error } = await updateRecurringEvent(eventId, updates, true);

        if (error) throw error;
        if (success) {
          // Reload all events
          const { data: allEvents } = await supabase
            .from('planner_events')
            .select('*')
            .eq('user_id', user?.id)
            .order('date', { ascending: true });

          if (allEvents) {
            setEvents(allEvents as CalendarEvent[]);
          }
          toast.success('Recurring workout bijgewerkt');
        }
      } else {
        // Just update this single event
        const { data, error } = await supabase
          .from('planner_events')
          .update(updates)
          .eq('id', eventId)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setEvents((prev) => prev.map((e) => (e.id === eventId ? (data as CalendarEvent) : e)));
          toast.success('Workout bijgewerkt');
        }
      }

      setShowRecurringPrompt(false);
      setPendingEdit(null);
    } catch (e) {
      console.error('Failed to update event:', e);
      toast.error('Kon workout niet bijwerken');
    } finally {
      setLoading(false);
    }
  };

  const currentEditEvent = events.find((e) => e.id === editModal.eventId);

  const generatorSummary = useMemo(() => {
    if (!generatorModal.payload) {
      return null;
    }
    const { muscles, tags, workoutType } = generatorModal.payload;
    return {
      musclesLabel: muscles.length ? muscles.join(', ') : '—',
      tagsLabel: tags.length ? tags.join(', ') : '—',
      workoutType,
    };
  }, [generatorModal.payload]);

  const handleGeneratorFormChange = (field: 'date' | 'time' | 'reminderMinutes', value: string) => {
    setGeneratorForm((prev) => ({
      ...prev,
      [field]: field === 'reminderMinutes' ? Number(value) : value,
    }));
  };

  const handleScheduleGeneratorWorkout = async () => {
    if (!generatorModal.payload || !user) return;

    try {
      setLoading(true);
      const payload = generatorModal.payload;
      const newWorkout = {
        type: 'workout' as const,
        date: generatorForm.date,
        title: payload.name,
        notes: payload.description,
        workout_type: payload.workoutType,
        duration_min: payload.duration,
        time: generatorForm.time || undefined,
        color: WORKOUT_TYPE_COLORS[payload.workoutType] || NEON_ORANGE,
        completed: false,
        reminder_minutes: generatorForm.reminderMinutes || undefined,
        source: 'Manual',
        meta: payload.meta,
      };

      const { data, error} = await createWorkoutEvent(newWorkout);
      if (error) throw error;
      if (data) {
        setEvents((prev) => sortEventsByDate([...prev, data as CalendarEvent]));
        toast.success('Workout ingepland in je planner!');
      }

      setGeneratorModal({ open: false, payload: null });
    } catch (e) {
      console.error('Failed to schedule generator workout:', e);
      toast.error('Kon generator workout niet plannen');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleProgram = async (config: {
    weeks: number;
    startDate: string;
    recurring: boolean;
    reminderMinutes: number;
  }) => {
    if (!programModal.data || !user) return;

    try {
      setIsProgramScheduling(true);
      const { payload, scheduling } = programModal.data;
      const { weeks, startDate, recurring, reminderMinutes } = config;

      console.log('[Planner] Scheduling program:', { weeks, startDate, recurring, days: scheduling.days });

      const eventsToCreate: Array<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>> = [];

      // Generate events for each week
      for (let week = 0; week < weeks; week++) {
        for (const day of scheduling.days) {
          const eventDate = calculateDateForDay(startDate, day, week);
          const time = mapPreferredTimeToActualTime(scheduling.preferredTime);

          eventsToCreate.push({
            user_id: user.id,
            type: 'workout' as const,
            date: eventDate,
            title: payload.name,
            notes: payload.description,
            workout_type: payload.workoutType,
            duration_min: payload.duration,
            time,
            color: WORKOUT_TYPE_COLORS[payload.workoutType] || NEON_ORANGE,
            completed: false,
            reminder_minutes: reminderMinutes || undefined,
            recurring_rule: recurring ? 'weekly' : undefined,
            recurrence_end: recurring ? addWeeks(eventDate, 52) : undefined,
            source: 'Manual',
            meta: {
              ...payload.meta,
              programWeek: week + 1,
              programDay: day,
            },
          });
        }
      }

      console.log(`[Planner] Creating ${eventsToCreate.length} workout events`);

      // Batch insert all events
      const { data, error } = await supabase
        .from('planner_events')
        .insert(eventsToCreate)
        .select();

      if (error) throw error;

      if (data) {
        // If recurring, generate future instances for the first event of each day pattern
        if (recurring) {
          const parentEvents = new Map<string, string>();

          for (const event of data as CalendarEvent[]) {
            const eventMeta = event.meta as any;
            const key = `${eventMeta?.programDay}-week-${eventMeta?.programWeek}`;

            if (!parentEvents.has(eventMeta?.programDay) && eventMeta?.programWeek === 1) {
              parentEvents.set(eventMeta?.programDay, event.id);

              // Generate recurring instances for 1 year
              await generateRecurringEvents(
                event.id,
                event.date,
                addWeeks(event.date, 52)
              );
            }
          }
        }

        setEvents((prev) => sortEventsByDate([...prev, ...(data as CalendarEvent[])]));
        toast.success(`🎉 ${eventsToCreate.length} workouts ingepland!`);
      }

      setProgramModal({ open: false, data: null });
    } catch (e) {
      console.error('Failed to schedule program:', e);
      toast.error('Kon programma niet plannen');
    } finally {
      setIsProgramScheduling(false);
    }
  };

  // Get event color
  const getEventColor = (event: CalendarEvent): string => {
    if (event.color) return event.color;
    if (event.type === 'rest') return NEON_YELLOW;
    if (event.workout_type && WORKOUT_TYPE_COLORS[event.workout_type]) {
      return WORKOUT_TYPE_COLORS[event.workout_type];
    }
    if (event.source && SOURCE_NEON[event.source as WorkoutSource]) {
      return SOURCE_NEON[event.source as WorkoutSource];
    }
    return NEON_ORANGE;
  };

  // --- Render ---
  return (
    <div className="w-full max-w-full px-1 sm:px-4" style={{ position: 'relative', zIndex: 1, background: 'none' }}>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500 rounded-2xl p-8 shadow-2xl">
            <LoadingSpinner />
            <p className="text-cyan-300 text-center mt-4 font-semibold">Bezig...</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 mt-2">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-900/60 to-black/80 border-2 border-cyan-400/20 shadow-xl p-6 flex flex-col items-center animate-pulse">
          <span className="text-4xl font-extrabold text-cyan-200 drop-shadow-neon-cyan" style={{ textShadow: '0 2px 8px #00fff7aa' }}>
            {completedCount}
          </span>
          <span className="text-cyan-100/80 text-base mt-2 font-semibold">Workouts voltooid</span>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-cyan-900/60 to-black/80 border-2 border-cyan-400/20 shadow-xl p-6 flex flex-col items-center animate-pulse delay-100">
          <span className="text-4xl font-extrabold text-cyan-200 drop-shadow-neon-cyan" style={{ textShadow: '0 2px 8px #00fff7aa' }}>
            {futureCount}
          </span>
          <span className="text-cyan-100/80 text-base mt-2 font-semibold">Toekomstig gepland</span>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-yellow-500/30 to-black/80 border-2 border-yellow-400/20 shadow-xl p-6 flex flex-col items-center animate-pulse delay-200">
          <span className="text-4xl font-extrabold text-yellow-200 drop-shadow-neon-cyan" style={{ textShadow: '0 2px 8px #ffe066aa' }}>
            {totalMinutes}
          </span>
          <span className="text-yellow-100/80 text-base mt-2 font-semibold">Minuten getraind</span>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex gap-2 mb-8 flex-wrap justify-center">
        {['Week', 'Month', 'Day'].map((view) => (
          <button
            key={view}
            className={`w-full xs:w-auto px-6 py-3 rounded-full font-extrabold text-lg tracking-wide transition border-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 shadow-lg
              ${
                viewMode === view
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 border-cyan-300 text-white scale-105 shadow-neon-cyan'
                  : 'bg-black/40 border-cyan-700 text-cyan-300 hover:bg-cyan-900/30'
              }`}
            style={{
              minWidth: 110,
              marginBottom: 4,
              textShadow: viewMode === view ? '0 2px 8px #00fff7aa' : '',
            }}
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
              <span className="text-cyan-400 font-normal ml-2">
                Week {weekNumber}
              </span>
            </span>
            <button
              onClick={handleNextWeek}
              className="text-cyan-400 hover:text-cyan-200 text-2xl font-bold px-2"
              aria-label="Next week"
            >
              {'>'}
            </button>
          </div>
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
                            snapshot.isDraggingOver ? 'ring-2 ring-cyan-400 bg-cyan-900/20' : ''
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
                              } bg-transparent hover:bg-cyan-900/30 transition focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                              disabled={loading}
                              aria-label={isRestDay ? `Rustdag verwijderen op ${dateObj.format('dddd D MMMM')}` : `Rustdag instellen op ${dateObj.format('dddd D MMMM')}`}
                            >
                              {isRestDay ? 'Unset Restday' : 'Set Restday'}
                            </button>
                            <button
                              onClick={() => handleAddWorkoutClick(dateStr)}
                              className="text-xs px-2 py-1 rounded-full border border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-900/30 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              disabled={loading}
                              aria-label={`Workout toevoegen op ${dateObj.format('dddd D MMMM')}`}
                            >
                              + Add Workout
                            </button>
                          </div>
                          <div className="flex flex-col gap-2 min-h-[32px]">
                            {/* Rest Day Card */}
                            {isRestDay && dayEvents.filter((e) => e.type === 'rest').map((restEvent) => (
                              <div
                                key={restEvent.id}
                                className="rounded-2xl bg-yellow-500/10 backdrop-blur-md border-2 border-yellow-400 p-4 flex flex-col gap-2 shadow-lg cursor-pointer hover:bg-yellow-500/20 transition"
                                onClick={() => handleRestDayClick(dateStr)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-lg text-yellow-300">😴 Rustdag</span>
                                </div>
                                {restEvent.notes && (
                                  <p className="text-sm text-yellow-100/80">{restEvent.notes}</p>
                                )}
                                <span className="text-xs text-yellow-400/60">Klik om te bewerken</span>
                              </div>
                            ))}

                            {dayEvents.filter((e) => e.type === 'workout').length === 0 &&
                              !isRestDay && (
                                <span className="text-sm text-gray-400">
                                  No workouts planned.
                                </span>
                              )}
                            {dayEvents
                              .filter((e) => e.type === 'workout')
                              .map((event, idx) => {
                                const color = getEventColor(event);
                                return (
                                  <Draggable draggableId={event.id} index={idx} key={event.id}>
                                    {(dragProvided, dragSnapshot) => (
                                      <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        className="rounded-lg border p-3 cursor-pointer bg-opacity-90"
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
                                        <div
                                          className="rounded-2xl bg-black/60 backdrop-blur-md border-2 p-3 flex flex-col gap-2 shadow-lg"
                                          style={{
                                            borderColor: color,
                                            minWidth: 0,
                                          }}
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                              {event.recurring_rule && (
                                                <span className="text-purple-400 text-sm" title="Terugkerende workout">
                                                  🔄
                                                </span>
                                              )}
                                              <span
                                                className="font-bold text-base text-white truncate"
                                                title={event.title || 'Workout'}
                                              >
                                                {event.title || 'Workout'}
                                              </span>
                                            </div>
                                            {event.workout_type && (
                                              <span
                                                className="px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0"
                                                style={{
                                                  borderColor: color,
                                                  color: color,
                                                  background: `${color}22`,
                                                }}
                                              >
                                                {event.workout_type}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex flex-wrap items-center gap-3 text-xs text-cyan-100/80">
                                            <span className="flex items-center gap-1">
                                              📅 {moment(event.date).format('ddd D MMM YYYY')}
                                            </span>
                                            {event.time && (
                                              <span className="flex items-center gap-1">
                                                🕐 {event.time}
                                              </span>
                                            )}
                                            {event.duration_min && (
                                              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                                ⏱️ {event.duration_min} min
                                              </span>
                                            )}
                                            {event.notes && (
                                              <span className="truncate max-w-[180px] text-gray-300">
                                                📝 {event.notes}
                                              </span>
                                            )}
                                            {event.reminder_minutes && (
                                              <span className="flex items-center gap-1 text-purple-300">
                                                🔔 {event.reminder_minutes} min
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex gap-2 mt-2 flex-wrap">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openEditFor(event.id);
                                              }}
                                              className="flex-1 min-w-[44px] py-2 rounded-xl bg-cyan-700 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 text-base shadow-md"
                                              title="Edit"
                                              disabled={loading}
                                            >
                                              <FaRegEdit />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCompleteWorkout(event.id);
                                              }}
                                              className={`flex-1 min-w-[44px] py-2 rounded-xl ${
                                                event.completed ? 'bg-green-600' : 'bg-green-900'
                                              } hover:bg-green-500 text-white font-bold flex items-center justify-center gap-2 text-base shadow-md`}
                                              title="Complete"
                                              disabled={loading}
                                            >
                                              <FaCheckCircle />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteWorkout(event.id);
                                              }}
                                              className="flex-1 min-w-[44px] py-2 rounded-xl bg-red-700 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-2 text-base shadow-md"
                                              title="Delete"
                                              disabled={loading}
                                            >
                                              <FaRegTrashAlt />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                event.workout_id && handleRunWorkout(event.workout_id);
                                              }}
                                              className="flex-1 min-w-[44px] py-2 rounded-xl bg-purple-700 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 text-base shadow-md disabled:opacity-60"
                                              title="Start"
                                              disabled={!event.workout_id || loading}
                                            >
                                              <FaPlay />
                                            </button>
                                          </div>
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
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 bg-black/40 rounded-xl overflow-hidden text-xs sm:text-base">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div
                key={d}
                className="text-cyan-300 text-center py-2 font-semibold bg-black/60"
              >
                {d}
              </div>
            ))}
            {monthDays.map((day) => {
              const dateStr = day.format('YYYY-MM-DD');
              const isCurrentMonth = day.month() === currentMonth.month();
              const isToday = day.isSame(moment(), 'day');
              const events = eventsByDateMonth[dateStr] || [];
              return (
                <Droppable droppableId={dateStr} key={dateStr}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[56px] sm:min-h-[80px] p-0.5 sm:p-1 border border-black/30 flex flex-col rounded-lg cursor-pointer transition group
                          ${isCurrentMonth ? 'bg-black/70' : 'bg-black/30 opacity-60'}
                          ${isToday ? 'ring-2 ring-cyan-400' : ''}
                          ${snapshot.isDraggingOver ? 'ring-2 ring-purple-400 bg-purple-900/20' : ''}`}
                      onClick={() => handleAddWorkoutClick(dateStr)}
                      tabIndex={0}
                      aria-label={`Add or view events for ${day.format('dddd, D MMMM YYYY')}`}
                    >
                      <div className="text-[10px] sm:text-xs text-cyan-200 font-bold mb-0.5 sm:mb-1 text-right pr-0.5 sm:pr-1">
                        {day.date()}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {events.map((event, idx) => {
                          const color = getEventColor(event);
                          return (
                            <Draggable draggableId={event.id} index={idx} key={event.id}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className="rounded-2xl bg-black/60 backdrop-blur-md border-2 p-2 mb-1 flex flex-col gap-1 shadow-lg min-w-0 max-w-full"
                                  style={{
                                    borderColor: color,
                                    background: dragSnapshot.isDragging ? `${color}33` : undefined,
                                    ...dragProvided.draggableProps.style,
                                  }}
                                  title={event.title || 'Workout'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditFor(event.id);
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1 min-w-0 flex-1">
                                      {event.recurring_rule && (
                                        <span className="text-purple-400 text-[10px]" title="Terugkerende workout">
                                          🔄
                                        </span>
                                      )}
                                      <span
                                        className="font-bold text-xs text-white truncate"
                                        title={event.title || 'Workout'}
                                      >
                                        {event.title || event.workout_type || 'Workout'}
                                      </span>
                                    </div>
                                    {event.workout_type && (
                                      <span
                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0"
                                        style={{
                                          borderColor: color,
                                          color: color,
                                          background: `${color}22`,
                                        }}
                                      >
                                        {event.workout_type}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-cyan-100/80">
                                    <span>{moment(event.date).format('D MMM')}</span>
                                    {event.time && <span>🕐 {event.time}</span>}
                                    {event.duration_min && (
                                      <span className="text-yellow-400 font-bold">
                                        ⏱️ {event.duration_min}min
                                      </span>
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
                  )}
                </Droppable>
              );
            })}
            </div>
          </DragDropContext>
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
              onChange={(e) => setCurrentDay(moment(e.target.value))}
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
              <div className="text-gray-400 text-center text-base">
                No workouts or events planned for this day.
              </div>
            ) : (
              eventsForCurrentDay.map((event) => {
                const color = getEventColor(event);
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        openEditFor(event.id);
                      }
                    }}
                  >
                    <div
                      className="rounded-2xl bg-black/60 backdrop-blur-md border-2 p-4 flex flex-col gap-2 shadow-lg min-w-0 max-w-full"
                      style={{ borderColor: color }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {event.recurring_rule && (
                            <span className="text-purple-400 text-base" title="Terugkerende workout">
                              🔄
                            </span>
                          )}
                          <span
                            className="font-bold text-lg text-white truncate"
                            title={event.title || 'Workout'}
                          >
                            {event.title || 'Workout'}
                          </span>
                        </div>
                        {event.workout_type && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0"
                            style={{
                              borderColor: color,
                              color: color,
                              background: `${color}22`,
                            }}
                          >
                            {event.workout_type}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-cyan-100/80">
                        <span className="flex items-center gap-1">
                          📅 {moment(event.date).format('ddd D MMM YYYY')}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            🕐 {event.time}
                          </span>
                        )}
                        {event.duration_min && (
                          <span className="flex items-center gap-1 text-yellow-400 font-bold">
                            ⏱️ {event.duration_min} min
                          </span>
                        )}
                        {event.notes && (
                          <span className="truncate max-w-[180px] text-gray-300">
                            📝 {event.notes}
                          </span>
                        )}
                        {event.reminder_minutes && (
                          <span className="flex items-center gap-1 text-purple-300">
                            🔔 {event.reminder_minutes} min
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditFor(event.id);
                          }}
                          className="flex-1 min-w-[44px] py-2 rounded-xl bg-cyan-700 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 text-base shadow-md"
                          title="Edit"
                          disabled={loading}
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteWorkout(event.id);
                          }}
                          className={`flex-1 min-w-[44px] py-2 rounded-xl ${
                            event.completed ? 'bg-green-600' : 'bg-green-900'
                          } hover:bg-green-500 text-white font-bold flex items-center justify-center gap-2 text-base shadow-md`}
                          title="Complete"
                          disabled={loading}
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkout(event.id);
                          }}
                          className="flex-1 min-w-[44px] py-2 rounded-xl bg-red-700 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-2 text-base shadow-md"
                          title="Delete"
                          disabled={loading}
                        >
                          <FaRegTrashAlt />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            event.workout_id && handleRunWorkout(event.workout_id);
                          }}
                          className="flex-1 min-w-[44px] py-2 rounded-xl bg-purple-700 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 text-base shadow-md disabled:opacity-60"
                          title="Start"
                          disabled={!event.workout_id || loading}
                        >
                          <FaPlay />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Type Selection Modal with Time */}
      <Modal
        isOpen={typeModal.open}
        onClose={() => {
          setTypeModal({ open: false, date: '' });
          setAddWorkoutTime('');
        }}
        title="Workout Toevoegen"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Tijd (optioneel)
            </label>
            <input
              type="time"
              className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={addWorkoutTime}
              onChange={(e) => setAddWorkoutTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Workout Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Run', 'Strength', 'Hybrid', 'Cardio', 'Mobility', 'Stretching'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleAddWorkout(type, typeModal.date)}
                  className="px-4 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-500 text-white font-bold text-sm transition"
                  disabled={loading}
                  style={{
                    borderLeft: `4px solid ${WORKOUT_TYPE_COLORS[type] || NEON_ORANGE}`,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Generator planner modal */}
      <Modal
        isOpen={generatorModal.open && !!generatorModal.payload}
        onClose={() => setGeneratorModal({ open: false, payload: null })}
        title="Plan gegenereerde workout"
      >
        {generatorModal.payload && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2">
                Datum *
              </label>
              <input
                type="date"
                className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={generatorForm.date}
                onChange={(e) => handleGeneratorFormChange('date', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-2">
                  Tijd (optioneel)
                </label>
                <input
                  type="time"
                  className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={generatorForm.time}
                  onChange={(e) => handleGeneratorFormChange('time', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-2">
                  Herinnering
                </label>
                <select
                  className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={generatorForm.reminderMinutes}
                  onChange={(e) => handleGeneratorFormChange('reminderMinutes', e.target.value)}
                >
                  <option value={0}>Geen</option>
                  <option value={15}>15 minuten voor</option>
                  <option value={30}>30 minuten voor</option>
                  <option value={60}>1 uur voor</option>
                  <option value={120}>2 uur voor</option>
                  <option value={1440}>1 dag voor</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-cyan-700 bg-black/50 p-3">
              <p className="text-lg font-bold text-white">{generatorModal.payload.name}</p>
              {generatorModal.payload.description && (
                <p className="text-sm text-cyan-200 mt-1">{generatorModal.payload.description}</p>
              )}
              <div className="mt-3 text-sm text-white/70 space-y-1">
                <div>
                  Type:{' '}
                  <span className="text-cyan-300 font-semibold">
                    {generatorSummary?.workoutType || 'Onbekend'}
                  </span>
                </div>
                <div>
                  Focus:{' '}
                  <span className="text-cyan-300">{generatorSummary?.musclesLabel || '—'}</span>
                </div>
                <div>
                  Tags:{' '}
                  <span className="text-cyan-300">{generatorSummary?.tagsLabel || '—'}</span>
                </div>
                <div>
                  Duur:{' '}
                  <span className="text-cyan-300">{generatorModal.payload.duration} min</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-cyan-900 bg-black/40 p-3 max-h-56 overflow-y-auto">
              <p className="text-sm font-semibold text-cyan-300 mb-2">Workout schema</p>
              <ul className="space-y-2">
                {generatorModal.payload.exercises.map((exercise, index) => (
                  <li key={`${exercise.section}-${exercise.name}-${index}`} className="text-sm text-white/80">
                    <span className="text-cyan-300 uppercase text-xs mr-2">{exercise.section}</span>
                    <span className="font-semibold">{exercise.name}</span>
                    <span className="text-white/60">
                      {exercise.sets ? ` · ${exercise.sets} sets` : ''}
                      {exercise.reps ? ` · ${exercise.reps}` : ''}
                      {exercise.time ? ` · ${exercise.time}` : ''}
                      {exercise.distance ? ` · ${exercise.distance}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleScheduleGeneratorWorkout}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold shadow-lg hover:scale-105 transition"
                disabled={loading}
              >
                {loading ? 'Bezig...' : 'Voeg toe aan planner'}
              </button>
              <button
                onClick={() => setGeneratorModal({ open: false, payload: null })}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold"
                disabled={loading}
              >
                Annuleren
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Program Scheduling Modal */}
      <ProgramSchedulingModal
        isOpen={programModal.open}
        programData={programModal.data}
        onClose={() => setProgramModal({ open: false, data: null })}
        onSchedule={handleScheduleProgram}
        isLoading={isProgramScheduling}
      />

      {/* Edit Modal - Extended */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, eventId: '' })}
        title="Workout Bewerken"
      >
        {currentEditEvent && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2">
                Titel *
              </label>
              <input
                type="text"
                placeholder="Titel"
                className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-2">
                  Type
                </label>
                <select
                  className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={editWorkoutType}
                  onChange={(e) => setEditWorkoutType(e.target.value)}
                >
                  <option value="">Selecteer...</option>
                  {['Run', 'Strength', 'Hybrid', 'Cardio', 'Mobility', 'Stretching', 'Zen'].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-2">
                  Duur (min)
                </label>
                <input
                  type="number"
                  placeholder="Duur (min)"
                  className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={editDuration}
                  onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2">
                Tijd
              </label>
              <input
                type="time"
                className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2">
                Kleur
              </label>
              <div className="flex gap-2 flex-wrap">
                {[NEON_GREEN, NEON_ORANGE, NEON_PURPLE, NEON_BLUE, NEON_YELLOW].map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-full border-2 ${
                      editColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2">
                🔔 Herinnering (optioneel)
              </label>
              <select
                className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={editReminderMinutes}
                onChange={(e) => setEditReminderMinutes(parseInt(e.target.value) || 0)}
              >
                <option value="0">Geen herinnering</option>
                <option value="15">15 minuten voor</option>
                <option value="30">30 minuten voor</option>
                <option value="60">1 uur voor</option>
                <option value="120">2 uur voor</option>
                <option value="1440">1 dag voor</option>
              </select>
              <p className="text-xs text-cyan-400/60 mt-1">
                🚧 Herinnering functionaliteit komt binnenkort
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2">
                🔄 Herhaling (optioneel)
              </label>
              <select
                className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={editRecurringRule}
                onChange={(e) => setEditRecurringRule(e.target.value)}
              >
                <option value="">Geen herhaling</option>
                <option value="daily">Dagelijks</option>
                <option value="weekly">Wekelijks</option>
                <option value="biweekly">Om de 2 weken</option>
                <option value="monthly">Maandelijks</option>
              </select>
              <p className="text-xs text-cyan-400/60 mt-1">
                🚧 Herhalings functionaliteit komt binnenkort
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2">
                Notities
              </label>
              <textarea
                placeholder="Notities"
                className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await handleSaveEdit(editModal.eventId, {
                    title: editTitle,
                    duration_min: editDuration,
                    notes: editNotes,
                    time: editTime || undefined,
                    workout_type: editWorkoutType || undefined,
                    color: editColor || undefined,
                    recurring_rule: editRecurringRule || undefined,
                    reminder_minutes: editReminderMinutes || undefined,
                  });
                  if (!showRecurringPrompt) {
                    setEditModal({ open: false, eventId: '' });
                  }
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-500 text-white font-bold"
                disabled={loading}
              >
                {loading ? 'Bezig...' : 'Opslaan'}
              </button>
              <button
                onClick={() => setEditModal({ open: false, eventId: '' })}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold"
                disabled={loading}
              >
                Annuleren
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rest Day Modal */}
      <Modal
        isOpen={restDayModal.open}
        onClose={() => {
          setRestDayModal({ open: false, date: '', eventId: undefined });
          setRestDayNotes('');
        }}
        title={restDayModal.eventId ? 'Rustdag Bewerken' : 'Rustdag Toevoegen'}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Datum
            </label>
            <input
              type="text"
              className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
              value={moment(restDayModal.date).format('dddd D MMMM YYYY')}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Notities (optioneel)
            </label>
            <textarea
              placeholder="Waarom rust je vandaag? Voeg eventueel notities toe..."
              className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={restDayNotes}
              onChange={(e) => setRestDayNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveRestDay}
              className="flex-1 px-4 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
              disabled={loading}
            >
              {loading ? 'Bezig...' : restDayModal.eventId ? 'Bijwerken' : 'Toevoegen'}
            </button>
            {restDayModal.eventId && (
              <button
                onClick={handleDeleteRestDay}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold"
                disabled={loading}
              >
                Verwijderen
              </button>
            )}
            <button
              onClick={() => {
                setRestDayModal({ open: false, date: '', eventId: undefined });
                setRestDayNotes('');
              }}
              className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold"
              disabled={loading}
            >
              Annuleren
            </button>
          </div>
        </div>
      </Modal>

      {/* Recurring Event Update Prompt */}
      <Modal
        isOpen={showRecurringPrompt}
        onClose={() => {
          setShowRecurringPrompt(false);
          setPendingEdit(null);
        }}
        title="Terugkerende Workout Bijwerken"
      >
        <div className="flex flex-col gap-4">
          <p className="text-cyan-100">
            Dit is een terugkerende workout. Wil je alleen deze instantie bijwerken, of deze en alle toekomstige instanties?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (pendingEdit) {
                  const { success, error } = await updateRecurringEvent(
                    pendingEdit.eventId,
                    pendingEdit.updates,
                    false // Only this instance
                  );
                  if (success) {
                    // Update local state
                    setEvents((prev) =>
                      prev.map((e) =>
                        e.id === pendingEdit.eventId ? { ...e, ...pendingEdit.updates } : e
                      )
                    );
                    toast.success('Workout bijgewerkt! ✅');
                    setEditModal({ open: false, eventId: '' });
                  } else {
                    toast.error('Kon workout niet bijwerken');
                    console.error('Update error:', error);
                  }
                  setShowRecurringPrompt(false);
                  setPendingEdit(null);
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-500 text-white font-bold transition-colors"
            >
              Alleen deze
            </button>
            <button
              onClick={async () => {
                if (pendingEdit) {
                  const { success, error } = await updateRecurringEvent(
                    pendingEdit.eventId,
                    pendingEdit.updates,
                    true // This and all future instances
                  );
                  if (success) {
                    // Reload all events to reflect changes
                    if (user) {
                      const { data } = await supabase
                        .from('planner_events')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('date', { ascending: true });
                      if (data) {
                        setEvents(data as CalendarEvent[]);
                      }
                    }
                    toast.success('Alle toekomstige workouts bijgewerkt! ✅');
                    setEditModal({ open: false, eventId: '' });
                  } else {
                    toast.error('Kon workouts niet bijwerken');
                    console.error('Update error:', error);
                  }
                  setShowRecurringPrompt(false);
                  setPendingEdit(null);
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-500 text-white font-bold transition-colors"
            >
              Deze en toekomstige
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default PlannerCalendar;
