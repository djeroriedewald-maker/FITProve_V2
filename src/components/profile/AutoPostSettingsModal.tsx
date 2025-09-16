import React, { useState, useEffect } from 'react';
import { Settings, Zap, Target, TrendingUp, Clock, Flame } from 'lucide-react';
import {
  AutoPostSettings,
  getAutoPostSettings,
  updateAutoPostSettings,
} from '../../lib/auto-posts';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';

interface AutoPostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoPostSettingsModal: React.FC<AutoPostSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AutoPostSettings>({
    enabled: true,
    onWorkoutCompletion: true,
    onMilestones: true,
    onStreaks: true,
    minDurationMinutes: 10,
    minCalories: 50,
    cooldownHours: 2,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadSettings();
    }
  }, [isOpen, user]);

  const loadSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userSettings = await getAutoPostSettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading auto-post settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateAutoPostSettings(user.id, settings);
      onClose();
    } catch (error) {
      console.error('Error saving auto-post settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof AutoPostSettings>(key: K, value: AutoPostSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Auto-Post Instellingen">
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Instellingen laden...</p>
          </div>
        ) : (
          <>
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap
                  className={`w-5 h-5 ${settings.enabled ? 'text-green-500' : 'text-gray-400'}`}
                />
                <div>
                  <h3 className="font-medium text-gray-900">Auto-Posts Inschakelen</h3>
                  <p className="text-sm text-gray-600">
                    Automatisch posts maken na training voltooien
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.enabled}
                  onChange={(e) => updateSetting('enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Post Type Settings */}
            {settings.enabled && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Post Types</span>
                </h4>

                {/* Workout Completion Posts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">Training Voltooid</p>
                      <p className="text-sm text-gray-600">Post bij elke voltooide training</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.onWorkoutCompletion}
                    onChange={(e) => updateSetting('onWorkoutCompletion', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {/* Milestone Posts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-900">Mijlpalen</p>
                      <p className="text-sm text-gray-600">
                        Extra posts voor lange/intensieve trainingen
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.onMilestones}
                    onChange={(e) => updateSetting('onMilestones', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {/* Streak Posts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">Streak Posts</p>
                      <p className="text-sm text-gray-600">
                        Posts bij meerdere trainingen per week
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.onStreaks}
                    onChange={(e) => updateSetting('onStreaks', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {/* Minimum Requirements */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Minimum Vereisten</h4>

                  {/* Min Duration */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">Min. Duur</p>
                        <p className="text-sm text-gray-600">Minimale trainingstijd in minuten</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={settings.minDurationMinutes}
                        onChange={(e) =>
                          updateSetting('minDurationMinutes', parseInt(e.target.value) || 1)
                        }
                        className="w-20 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                      <span className="text-sm font-medium text-gray-600">min</span>
                    </div>
                  </div>

                  {/* Min Calories */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900">Min. Calorieën</p>
                        <p className="text-sm text-gray-600">Minimale calorieën verbrand</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        step="10"
                        value={settings.minCalories}
                        onChange={(e) =>
                          updateSetting('minCalories', parseInt(e.target.value) || 10)
                        }
                        className="w-20 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                      <span className="text-sm font-medium text-gray-600">cal</span>
                    </div>
                  </div>

                  {/* Cooldown */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">Cooldown</p>
                        <p className="text-sm text-gray-600">Tijd tussen auto-posts in uren</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0.5"
                        max="24"
                        step="0.5"
                        value={settings.cooldownHours}
                        onChange={(e) =>
                          updateSetting('cooldownHours', parseFloat(e.target.value) || 0.5)
                        }
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500">uur</span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Voorbeeld Auto-Post:</h5>
                  <p className="text-sm text-blue-800 italic">
                    "💪 Net klaar met Full Body Workout! 💪 45 minuten getraind en 320 calorieën
                    verbrand. #FitLife"
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={saving}
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
