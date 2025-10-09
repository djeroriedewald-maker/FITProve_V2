// Program Scheduling Modal Component
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalendarIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ProgramSchedulingData } from '../../lib/planner-payload';
import { generateProgramDates, formatDate, getNextOccurrence } from '../../lib/date-utils';
import moment from 'moment';

interface ProgramSchedulingModalProps {
  isOpen: boolean;
  programData: ProgramSchedulingData | null;
  onClose: () => void;
  onSchedule: (config: {
    weeks: number;
    startDate: string;
    recurring: boolean;
    reminderMinutes: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const ProgramSchedulingModal: React.FC<ProgramSchedulingModalProps> = ({
  isOpen,
  programData,
  onClose,
  onSchedule,
  isLoading = false,
}) => {
  const [weeks, setWeeks] = useState(4);
  const [startDate, setStartDate] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(15);

  // Initialize start date when modal opens
  React.useEffect(() => {
    if (isOpen && programData && !startDate) {
      const firstDay = programData.scheduling.days[0];
      const nextOccurrence = getNextOccurrence(new Date(), firstDay);
      setStartDate(nextOccurrence);
    }
  }, [isOpen, programData, startDate]);

  const previewDates = useMemo(() => {
    if (!programData || !startDate) return [];

    return generateProgramDates(
      programData.scheduling.days,
      startDate,
      weeks
    );
  }, [programData, startDate, weeks]);

  const totalWorkouts = useMemo(() => {
    return programData ? programData.scheduling.days.length * weeks : 0;
  }, [programData, weeks]);

  const handleSubmit = async () => {
    if (!startDate) return;

    await onSchedule({
      weeks,
      startDate,
      recurring,
      reminderMinutes,
    });

    // Reset and close
    setWeeks(4);
    setStartDate('');
    setRecurring(false);
    setReminderMinutes(15);
  };

  if (!programData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-cyan-500/30 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-900/90 to-purple-900/90 backdrop-blur-sm px-6 py-4 border-b border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-7 h-7 text-cyan-400" />
                    Plan Je Programma
                  </h2>
                  <p className="text-sm text-cyan-200 mt-1">{programData.payload.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  disabled={isLoading}
                >
                  <XMarkIcon className="w-6 h-6 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
              {/* Week Selection */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <label className="block text-lg font-semibold text-white mb-4">
                  Hoeveel weken wil je plannen?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={weeks}
                    onChange={(e) => setWeeks(Number(e.target.value))}
                    className="flex-1 accent-cyan-500"
                  />
                  <div className="flex items-center gap-2 bg-cyan-500/20 rounded-lg px-4 py-2 border border-cyan-500/30">
                    <span className="text-3xl font-bold text-cyan-400">{weeks}</span>
                    <span className="text-sm text-cyan-200">weken</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Totaal: <strong className="text-white">{totalWorkouts} workouts</strong> ({programData.scheduling.days.length} dagen/week × {weeks} weken)
                </p>
              </div>

              {/* Start Date */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <label className="block text-lg font-semibold text-white mb-4">
                  Startdatum (eerste {programData.scheduling.days[0]})
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={formatDate(new Date())}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Recurring Option */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="w-5 h-5 rounded accent-cyan-500"
                  />
                  <div>
                    <div className="text-lg font-semibold text-white flex items-center gap-2">
                      <ArrowPathIcon className="w-5 h-5 text-cyan-400" />
                      Doorgaan na {weeks} weken
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Workouts blijven automatisch herhalen volgens je schema
                    </p>
                  </div>
                </label>
              </div>

              {/* Reminder */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-cyan-400" />
                  Herinnering
                </label>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={0}>Geen herinnering</option>
                  <option value={15}>15 minuten voor</option>
                  <option value={30}>30 minuten voor</option>
                  <option value={60}>1 uur voor</option>
                  <option value={120}>2 uur voor</option>
                  <option value={1440}>1 dag voor</option>
                </select>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-lg font-semibold text-white mb-4">Voorbeeldschema (Week 1)</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map((day) => (
                    <div key={day} className="text-center text-xs text-gray-400 font-semibold">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {previewDates.slice(0, 7).map((item, idx) => {
                    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(item.date).getDay()];
                    const isScheduled = programData.scheduling.days.some(d => d === dayName);

                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                          isScheduled
                            ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                            : 'bg-gray-800/30 text-gray-500'
                        }`}
                      >
                        {moment(item.date).format('D')}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  {totalWorkouts} workouts worden aangemaakt op je geselecteerde dagen
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-sm px-6 py-4 border-t border-gray-700/50">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !startDate}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Plannen...' : `Plan ${totalWorkouts} Workouts`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
