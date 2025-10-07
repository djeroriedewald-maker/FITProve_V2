// src/pages/PlannerPage.tsx
import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PlannerCalendar, { PlannerCalendarHandle } from '../components/PlannerCalendar';
import PlannerTodos from '../components/PlannerTodos';

const PlannerPage: React.FC = () => {
  const { profile, isLoading } = useAuth();

  const plannerCalendarRef = useRef<PlannerCalendarHandle>(null);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-900">
        <div className="text-orange-400 font-bold text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#181A1B] to-[#1a183b]">
      {/* Main Content Only - no sidebar or top nav */}
      <main className="flex-1 flex flex-col p-4 md:p-10 gap-4 relative z-0">
        {/* Top utility row: Quick Add only */}
        <div className="flex flex-row gap-2 items-center mb-2">
          <button
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-2xl shadow transition text-xl w-full max-w-xs"
            onClick={() => plannerCalendarRef.current?.openAddModalForToday()}
            style={{ minHeight: 56 }}
          >
            + Quick Add
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1 tracking-tight drop-shadow">
              Plan Your Fitness Journey
            </h1>
            <p className="text-cyan-200 text-base md:text-lg max-w-2xl">
              Organize workouts, track goals, and stay motivated—all in one place. More features
              coming soon!
            </p>
          </div>
        </div>

        {/* To-Do/Goals Section */}
        <PlannerTodos />

        {/* Calendar Area */}
        <section className="bg-black/60 rounded-2xl shadow-xl p-4 md:p-8 flex-1 min-h-[500px] flex flex-col">
          <PlannerCalendar ref={plannerCalendarRef} />
        </section>

        {/* Details Drawer/Modal Placeholder */}
        {/* Example: <PlannerEventDrawer /> */}
      </main>
    </div>
  );
};

export default PlannerPage;
