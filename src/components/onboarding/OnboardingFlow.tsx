import React, { useState } from 'react';

const maleImg = '/images/male_selection.webp';
const femaleImg = '/images/female_selection.webp';

export type OnboardingStep =
  | 'gender'
  | 'age'
  | 'goal'
  | 'level'
  | 'equipment'
  | 'muscles'
  | 'generate';

const steps: { key: OnboardingStep; icon: string; label: string }[] = [
  { key: 'gender', icon: '♂️', label: 'Gender' },
  { key: 'age', icon: '🎂', label: 'Age' },
  { key: 'goal', icon: '🎯', label: 'Goal' },
  { key: 'level', icon: '⚡', label: 'Level' },
  { key: 'equipment', icon: '🏋️', label: 'Equipment' },
  { key: 'muscles', icon: '💪', label: 'Muscles' },
  { key: 'generate', icon: '✅', label: 'Finish' },
];

const heroImg = '/images/onboarding.webp';

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<OnboardingStep>('gender');
  const [form, setForm] = useState({
    gender: '',
    age: '',
    goal: '',
    level: '',
    equipment: '',
    muscles: [] as string[],
  });

  // Helper to get current step index
  const stepIdx = steps.findIndex((s) => s.key === step);

  // Navigation handlers
  const nextStep = () => {
  const idx = steps.findIndex((s) => s.key === step);
    if (idx < steps.length - 1) setStep(steps[idx + 1].key);
    else onComplete();
  };
  const prevStep = () => {
  const idx = steps.findIndex((s) => s.key === step);
    if (idx > 0) setStep(steps[idx - 1].key);
  };

  return (
    <div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <span
          className="text-4xl md:text-5xl font-extrabold text-white text-center"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
        >
          Onboarding
        </span>
      </div>

      {/* Onboarding Steps */}
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
        {step === 'gender' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>What is your gender?</h2>
            <div className="grid grid-cols-2 gap-8 my-10 place-items-center">
              {[
                { key: 'male', label: 'Male', img: maleImg },
                { key: 'female', label: 'Female', img: femaleImg }
              ].map((gender) => (
                <button
                  key={gender.key}
                  style={{
                    border: form.gender === gender.key ? '4px solid #fb923c' : '2px solid #b0b0b0',
                    borderRadius: 28,
                    background: 'none',
                    boxShadow: form.gender === gender.key ? '0 0 24px #fb923c33' : 'none',
                    transition: 'border 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    width: 'min(90vw, 220px)',
                    height: 320,
                    maxWidth: 220,
                    minWidth: 120,
                    padding: 0,
                    margin: '0 0 24px 0',
                  }}
                  onClick={() => setForm((f) => ({ ...f, gender: gender.key }))}
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>What is your current fitness level?</h2>
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-6" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Select the option that best describes you:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16 justify-center items-center my-10 place-items-center">
                      {[
                        { key: 'beginner', label: 'Beginner', img: form.gender === 'female' ? '/images/beginner_female.webp' : '/images/beginner_male.webp' },
                        { key: 'intermediate', label: 'Intermediate', img: form.gender === 'female' ? '/images/Intermediate_female.webp' : '/images/Intermediate_male.webp' },
                        { key: 'advanced', label: 'Advanced', img: form.gender === 'female' ? '/images/Advanced_female.webp' : '/images/Advanced_male.webp' },
                        { key: 'athlete', label: 'Athlete', img: form.gender === 'female' ? '/images/Athlete_female.webp' : '/images/Athlete_male.webp' }
                      ].map((level) => (
                      display: 'block',
                    {step === 'gender' && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>What is your gender?</h2>
                        <div className="grid grid-cols-2 gap-8 my-10 place-items-center">
                          {[{ key: 'male', label: 'Male', img: maleImg }, { key: 'female', label: 'Female', img: femaleImg }].map((gender) => (
                            <button
                              key={gender.key}
                              style={{
                                border: form.gender === gender.key ? '4px solid #fb923c' : '2px solid #b0b0b0',
                                borderRadius: 28,
                                background: 'none',
                                boxShadow: form.gender === gender.key ? '0 0 24px #fb923c33' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                outline: 'none',
                                width: 'min(90vw, 220px)',
                                height: 320,
                                maxWidth: 220,
                                minWidth: 120,
                                padding: 0,
                                margin: '0 0 24px 0',
                              }}
                              onClick={() => setForm((f) => ({ ...f, gender: gender.key }))}
                            >
                              <img
                                src={gender.img}
                                alt={gender.label}
                                style={{
                                  width: '100%',
                                  height: 200,
                                  objectFit: 'contain',
                                  background: 'none',
                                  borderRadius: 24,
                                  margin: '24px 0 12px 0',
                                  display: 'block',
                                }}
                              />
                              <div
                                className="text-center font-extrabold text-3xl sm:text-4xl mt-2"
                                style={{
                                  color: form.gender === gender.key ? '#fb923c' : 'black',
                                  textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                }}
                              >
                                <span className="dark:hidden">{gender.label}</span>
                                <span className="hidden dark:inline" style={{ color: form.gender === gender.key ? '#fb923c' : 'white' }}>{gender.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-row gap-4 mt-8">
                          {stepIdx > 0 && (
                            <button
                              onClick={prevStep}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 bg-gray-200 dark:bg-gray-700 text-orange-500 hover:text-pink-500 hover:bg-gray-300 dark:hover:bg-gray-600 shadow"
                              style={{ fontSize: 18 }}
                            >
                              <span className="text-2xl animate-bounce">←</span> Back
                            </button>
                          )}
                          <button
                            disabled={!form.gender}
                            onClick={nextStep}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 ${form.gender ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                            style={{
                              letterSpacing: 1,
                              boxShadow: form.gender ? '0 4px 24px 0 rgba(255, 87, 34, 0.18)' : undefined,
                            }}
                          >
                            <span className="inline-block align-middle">Next</span>
                            {form.gender && (
                              <span className="inline-block align-middle ml-2 animate-bounce">→</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    : '/images/Intermediate_male.webp', },
                { key: 'advanced', label: 'Advanced', img:
                  form.gender === 'female'
                    {step === 'equipment' && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>What equipment do you have access to?</h2>
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-6" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Select all that apply:</p>
                        <div className="grid grid-cols-2 gap-8 my-10 place-items-center">
                          {[
                            { key: 'dumbbells', label: 'Dumbbells', img: '/images/equipment_dumbbells.webp' },
                            { key: 'barbell', label: 'Barbell', img: '/images/equipment_barbell.webp' },
                            { key: 'kettlebell', label: 'Kettlebell', img: '/images/equipment_kettlebell.webp' },
                            { key: 'bands', label: 'Resistance Bands', img: '/images/equipment_bands.webp' },
                            { key: 'bodyweight', label: 'Bodyweight', img: '/images/equipment_bodyweight.webp' },
                            { key: 'machines', label: 'Machines', img: '/images/equipment_machines.webp' }
                          ].map((eq) => (
                            <button
                              key={eq.key}
                              style={{
                                border: form.equipment.includes(eq.key) ? '4px solid #fb923c' : '2px solid #b0b0b0',
                                borderRadius: 28,
                                background: 'none',
                                boxShadow: form.equipment.includes(eq.key) ? '0 0 24px #fb923c33' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                outline: 'none',
                                width: 'min(90vw, 180px)',
                                height: 220,
                                maxWidth: 180,
                                minWidth: 100,
                                padding: 0,
                                margin: '0 0 24px 0',
                              }}
                              onClick={() => setForm((f) => ({ ...f, equipment: f.equipment.includes(eq.key) ? f.equipment.filter((k: string) => k !== eq.key) : [...f.equipment, eq.key] }))}
                            >
                              <img
                                src={eq.img}
                                alt={eq.label}
                                style={{
                                  width: '100%',
                                  height: 120,
                                  objectFit: 'contain',
                                  background: 'none',
                                  borderRadius: 18,
                                  margin: '16px 0 8px 0',
                                  display: 'block',
                                }}
                              />
                              <div
                                className="text-center font-extrabold text-lg sm:text-xl mt-2"
                                style={{
                                  color: form.equipment.includes(eq.key) ? '#fb923c' : 'black',
                                  textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                }}
                              >
                                <span className="dark:hidden">{eq.label}</span>
                                <span className="hidden dark:inline" style={{ color: form.equipment.includes(eq.key) ? '#fb923c' : 'white' }}>{eq.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-row gap-4 mt-8">
                          {stepIdx > 0 && (
                            <button
                              onClick={prevStep}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 bg-gray-200 dark:bg-gray-700 text-orange-500 hover:text-pink-500 hover:bg-gray-300 dark:hover:bg-gray-600 shadow"
                              style={{ fontSize: 18 }}
                            >
                              <span className="text-2xl animate-bounce">←</span> Back
                            </button>
                          )}
                          <button
                            disabled={form.equipment.length === 0}
                            onClick={nextStep}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 ${form.equipment.length > 0 ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                            style={{letterSpacing: 1, boxShadow: form.equipment.length > 0 ? '0 4px 24px 0 rgba(255, 87, 34, 0.18)' : undefined}}
                          >
                            <span className="inline-block align-middle">Next</span>
                            {form.equipment.length > 0 && (
                              <span className="inline-block align-middle ml-2 animate-bounce">→</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  label: 'Beginner',
                  img:
                    form.gender === 'female'
                      ? '/images/beginner_female.webp'
                      : '/images/beginner_male.webp',
                },
                {
                  key: 'intermediate',
                  label: 'Intermediate',
                  img:
                    form.gender === 'female'
                      ? '/images/Intermediate_female.webp'
                      : '/images/Intermediate_male.webp',
                },
                {
                  key: 'advanced',
                  label: 'Advanced',
                  img:
                    form.gender === 'female'
                      ? '/images/Advanced_female.webp'
                      : '/images/Advanced_male.webp',
                },
                {
                  key: 'athlete',
                  label: 'Athlete',
                  img:
                    form.gender === 'female'
                      ? '/images/Athlete_female.webp'
                      : '/images/Athlete_male.webp',
                },
              ].map((level) => (
                <button
                  key={level.key}
                  style={{
                    border: form.level === level.key ? '4px solid #fb923c' : '2px solid #b0b0b0',
                    borderRadius: 28,
                    background: 'none',
                    boxShadow: form.level === level.key ? '0 0 24px #fb923c33' : 'none',
                    transition: 'border 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    width: 'min(90vw, 260px)',
                    height: 470,
                    maxWidth: 260,
                    minWidth: 160,
                    padding: 0,
                    margin: '0 0 24px 0',
                  }}
                  onClick={() => setForm((f) => ({ ...f, level: level.key }))}
                >
                  <img
                    src={level.img}
                    alt={level.label}
                    style={{
                      width: '100%',
                      height: 430,
                      objectFit: 'cover',
                      margin: 0,
                      borderRadius: 24,
                      display: 'block',
                    }}
                  />
                  <div
                    className="text-center font-extrabold text-lg sm:text-xl mt-2"
                    style={{
                      color: form.level === level.key ? '#fb923c' : 'black',
                      textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    }}
                  >
                    <span className="dark:hidden">{level.label}</span>
                    <span className="hidden dark:inline" style={{ color: form.level === level.key ? '#fb923c' : 'white' }}>{level.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex flex-row gap-4 mt-8">
              {stepIdx > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 bg-gray-200 dark:bg-gray-700 text-orange-500 hover:text-pink-500 hover:bg-gray-300 dark:hover:bg-gray-600 shadow"
                  style={{ fontSize: 18 }}
                >
                  <span className="text-2xl animate-bounce">←</span> Back
                </button>
              )}
              <button
                disabled={!form.level}
                onClick={nextStep}
                className={
                  `flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300
                  ${form.level ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`
                }
                style={{letterSpacing: 1, boxShadow: form.level ? '0 4px 24px 0 rgba(255, 87, 34, 0.18)' : undefined}}
              >
                <span className="inline-block align-middle">Next</span>
                {form.level && (
                  <span className="inline-block align-middle ml-2 animate-bounce">→</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

