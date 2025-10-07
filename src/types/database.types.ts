// Type definitions for database tables


// Type definitions for database tables

export type PlannerEvent = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  type: string; // 'workout' | 'rest' | 'note' | ...
  title: string | null;
  notes: string | null;
  workout_id: string | null;
  duration_min: number | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  // Add any new columns here, e.g.:
  time?: string | null;
  color?: string | null;
  reminder_minutes_before?: number | null;
  recurrence_rule?: string | null;
  recurrence_end?: string | null;
};
              )}
              {detailModal.event.completed && <span className="text-green-400">completed</span>}
            </div>

            {detailModal.event.notes && (
              <div className="text-sm" style={{ color: '#fff' }}>
                <b>Notes:</b> {detailModal.event.notes}
              </div>
            )}
            {detailModal.event.workout_id && (
              <div className="text-xs text-cyan-300">workout_id: {detailModal.event.workout_id}</div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

/** -----------------------------
 *  Simple Modal
 *  ----------------------------- */
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
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
