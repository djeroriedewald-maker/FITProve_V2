import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { saveWorkoutTemplate } from '../../lib/template.service';
import type { WorkoutTemplatePreferences } from '../../types/template.types';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: WorkoutTemplatePreferences;
  userId: string;
  defaultName?: string;
}

export function SaveTemplateModal({
  isOpen,
  onClose,
  preferences,
  userId,
  defaultName = '',
}: SaveTemplateModalProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Voer een naam in voor de template');
      return;
    }

    setSaving(true);
    try {
      // Extract tags from preferences
      const tags: string[] = [];
      if (preferences.goal) tags.push(preferences.goal);
      if (preferences.equipment) tags.push(...preferences.equipment);
      if (preferences.specificMuscles) tags.push(...preferences.specificMuscles);

      const { data, error } = await saveWorkoutTemplate(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          preferences,
          tags: Array.from(new Set(tags)).slice(0, 10), // Max 10 unique tags
        },
        userId
      );

      if (error) throw error;

      toast.success(`✅ Template "${name}" opgeslagen!`);
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Kon template niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sla op als Template">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-cyan-300 mb-2">
            Template Naam *
          </label>
          <input
            type="text"
            placeholder="Bijv. 'Maandag Chest Day' of '4-Week Strength Program'"
            className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">{name.length}/100 karakters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-cyan-300 mb-2">
            Beschrijving (optioneel)
          </label>
          <textarea
            placeholder="Voeg notities toe over deze template..."
            className="w-full bg-black/60 border border-cyan-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1">{description.length}/500 karakters</p>
        </div>

        {/* Preview preferences */}
        <div className="p-3 rounded-lg bg-black/40 border border-cyan-700/30">
          <p className="text-xs text-cyan-300 font-semibold mb-2">Template bevat:</p>
          <div className="space-y-1 text-xs text-gray-300">
            {preferences.goal && <div>🎯 Doel: {preferences.goal}</div>}
            {preferences.duration && <div>⏱️ Duur: {preferences.duration} min</div>}
            {preferences.frequency?.days && preferences.frequency.days.length > 0 && (
              <div>📅 Dagen: {preferences.frequency.days.join(', ')}</div>
            )}
            {preferences.equipment && preferences.equipment.length > 0 && (
              <div>🏋️ Equipment: {preferences.equipment.join(', ')}</div>
            )}
            {preferences.experience && <div>💪 Level: {preferences.experience}</div>}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold transition disabled:opacity-50"
            disabled={saving || !name.trim()}
          >
            {saving ? 'Opslaan...' : '💾 Opslaan'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition"
            disabled={saving}
          >
            Annuleren
          </button>
        </div>
      </div>
    </Modal>
  );
}
