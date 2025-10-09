import { useState, useEffect } from 'react';
import { FaTrash, FaClock, FaDumbbell, FaCalendar, FaTimes, FaStar } from 'react-icons/fa';
import moment from 'moment';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { getUserTemplates, deleteWorkoutTemplate, markTemplateAsUsed } from '../../lib/template.service';
import type { WorkoutTemplate } from '../../types/template.types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
  userId: string;
}

export function TemplateModal({ isOpen, onClose, onSelectTemplate, userId }: TemplateModalProps) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadTemplates();
    }
  }, [isOpen, userId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUserTemplates(userId);
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Kon templates niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template: WorkoutTemplate) => {
    try {
      // Mark template as used
      await markTemplateAsUsed(template.id, userId);
      onSelectTemplate(template);
      onClose();
      toast.success(`Template "${template.name}" geladen!`);
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Kon template niet laden');
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (deleteConfirm !== templateId) {
      setDeleteConfirm(templateId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const { error } = await deleteWorkoutTemplate(templateId, userId);
      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success(`Template "${templateName}" verwijderd`);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Kon template niet verwijderen');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Laad Template">
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-cyan-300">
            <div className="animate-spin text-3xl mb-2">⚙️</div>
            <p>Templates laden...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-lg">Geen templates gevonden</p>
            <p className="text-sm mt-2">Genereer een workout en sla deze op als template!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {templates.map((template) => {
              const prefs = template.preferences;
              const isDeleting = deleteConfirm === template.id;

              return (
                <div
                  key={template.id}
                  className="relative p-4 rounded-xl bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border border-cyan-700/50 backdrop-blur-sm hover:border-cyan-500 transition-all cursor-pointer group"
                  onClick={() => !isDeleting && handleSelectTemplate(template)}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id, template.name);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
                      isDeleting
                        ? 'bg-red-600 text-white scale-110'
                        : 'bg-black/40 text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                    }`}
                    title={isDeleting ? 'Klik nogmaals om te bevestigen' : 'Verwijder template'}
                  >
                    {isDeleting ? <FaTimes /> : <FaTrash />}
                  </button>

                  {/* Template info */}
                  <div className="pr-10">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{template.name}</h3>
                      {template.use_count > 0 && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <FaStar /> {template.use_count}
                        </span>
                      )}
                    </div>

                    {template.description && (
                      <p className="text-sm text-gray-300 mb-3">{template.description}</p>
                    )}

                    {/* Preference details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-cyan-300">
                        <FaDumbbell />
                        <span>{prefs.goal || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-300">
                        <FaClock />
                        <span>{prefs.duration || 30} min</span>
                      </div>
                      {prefs.frequency?.days && prefs.frequency.days.length > 0 && (
                        <div className="flex items-center gap-2 text-orange-300 col-span-2">
                          <FaCalendar />
                          <span>{prefs.frequency.days.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full text-xs bg-cyan-700/40 text-cyan-200 border border-cyan-600/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex gap-3 mt-3 text-xs text-gray-500">
                      <span>Aangemaakt: {moment(template.created_at).format('D MMM YYYY')}</span>
                      {template.last_used_at && (
                        <span>Laatst gebruikt: {moment(template.last_used_at).fromNow()}</span>
                      )}
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute inset-0 rounded-xl border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-cyan-700/30">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition"
          >
            Annuleren
          </button>
        </div>
      </div>
    </Modal>
  );
}
