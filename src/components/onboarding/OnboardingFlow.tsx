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
    <>
      {/* Hero Image Section */}
      <div style={{ width: '100%', position: 'relative', height: '180px', marginBottom: 32 }}>
        <img
          src={heroImg}
          alt="Onboarding Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1,
          }}
        ></div>
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
      </div>

      {/* Progress Bar */}
      <div className="w-full flex flex-col items-center mb-8" style={{boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)', padding: '12px 0', zIndex: 10}}>
        <div className="w-full max-w-4xl flex items-center justify-between relative px-2" style={{ height: 48 }}>
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full z-0" style={{ zIndex: 0 }} />
          {steps.map((s, i) => {
            const isActive = i === stepIdx;
            const isDone = i < stepIdx;
            return (
              <div key={s.key} className="flex-1 flex flex-col items-center z-10">
                <div
                  className={`rounded-full flex items-center justify-center transition-all duration-300 border-4 ${isActive ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white border-orange-400 scale-110 shadow-lg' : isDone ? 'bg-blue-700 text-white border-blue-400' : 'bg-gray-300 dark:bg-gray-600 text-gray-400 border-gray-300 dark:border-gray-600'} `}
                  style={{ width: 40, height: 40, fontSize: 22, marginBottom: 2 }}
                >
                  <span>{s.icon}</span>
                </div>
                <span className={`text-xs mt-1 font-semibold ${isActive ? 'text-orange-500' : isDone ? 'text-blue-700' : 'text-gray-400 dark:text-gray-500'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Onboarding Steps */}
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
        {step === 'gender' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>Let's get started!</h2>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-6" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Select your gender:</p>
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 justify-center items-center my-10">
              <button
                style={{
                  border: form.gender === 'male' ? '4px solid #007bff' : '2px solid #b0b0b0',
                  borderRadius: 28,
                  background: 'none',
                  boxShadow: form.gender === 'male' ? '0 0 24px #007bff33' : 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  width: 'min(90vw, 320px)',
                  height: 'min(60vw, 420px)',
                  maxWidth: 320,
                  maxHeight: 420,
                  minWidth: 180,
                  minHeight: 240,
                  padding: 0,
                }}
                onClick={() => setForm((f) => ({ ...f, gender: 'male' }))}
              >
                <img
                  src={maleImg}
                  alt="Male"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 460,
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
                    color: 'black',
                    textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}
                  >
                  <span className="dark:hidden">Male</span>
                  <span className="hidden dark:inline" style={{ color: 'white' }}>Male</span>
                </div>
              </button>
              <button
                style={{
                  border: form.gender === 'female' ? '4px solid #e91e63' : '2px solid #b0b0b0',
                  borderRadius: 28,
                  background: 'none',
                  boxShadow: form.gender === 'female' ? '0 0 24px #e91e6333' : 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  width: 'min(90vw, 320px)',
                  height: 'min(60vw, 420px)',
                  maxWidth: 320,
                  maxHeight: 420,
                  minWidth: 180,
                  minHeight: 240,
                  padding: 0,
                }}
                onClick={() => setForm((f) => ({ ...f, gender: 'female' }))}
              >
                <img
                  src={femaleImg}
                  alt="Female"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 340,
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
                    color: 'black',
                    textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}
                  >
                  <span className="dark:hidden">Female</span>
                  <span className="hidden dark:inline" style={{ color: 'white' }}>Female</span>
                </div>
              </button>
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
        {step === 'age' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>How old are you?</h2>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-8" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Choose your age:</p>
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative w-full max-w-md flex flex-col items-center">
                <input
                  type="range"
                  min={12}
                  max={100}
                  value={form.age || 25}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  className="w-full accent-orange-500 transition-all duration-300"
                  style={{ accentColor: '#fb923c' }}
                />
                <div className="absolute left-0 top-8 text-sm font-bold text-orange-500 animate-fade-in">12</div>
                <div className="absolute right-0 top-8 text-sm font-bold text-orange-500 animate-fade-in">100</div>
                <div className="mt-8 text-4xl font-extrabold text-orange-500 animate-bounce" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>{form.age || 25}</div>
              </div>
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
                disabled={!form.age}
                onClick={nextStep}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 ${form.age ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                style={{
                  letterSpacing: 1,
                  boxShadow: form.age ? '0 4px 24px 0 rgba(255, 87, 34, 0.18)' : undefined,
                }}
              >
                <span className="inline-block align-middle">Next</span>
                {form.age && (
                  <span className="inline-block align-middle ml-2 animate-bounce">→</span>
                )}
              </button>
            </div>
          </div>
        )}
        {step === 'goal' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>What is your main fitness goal?</h2>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-6" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Select one to personalize your plan:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16 justify-center items-center my-10 place-items-center">
              {[
                { key: 'build_muscle', label: 'Build Muscle', img: form.gender === 'female' ? '/images/buildmuscle_women.webp' : '/images/buildmuscle_men.webp' },
                { key: 'lose_fat', label: 'Lose Fat', img: form.gender === 'female' ? '/images/losefat_female.webp' : form.gender === 'male' ? '/images/losefat_male.webp' : undefined, icon: '🔥' },
                { key: 'get_fitter', label: 'Get Fitter', img: form.gender === 'female' ? '/images/getfitter_female.webp' : form.gender === 'male' ? '/images/getfitter_male.webp' : undefined, icon: '🏃‍♂️' },
                { key: 'endurance', label: 'Endurance', img: form.gender === 'female' ? '/images/endurance_female.webp' : form.gender === 'male' ? '/images/endurance_male.webp' : undefined, icon: '⏱️' },
              ].map((goal) => (
                <button
                  key={goal.key}
                  style={{
                    border: form.goal === goal.key ? '4px solid #fb923c' : '2px solid #b0b0b0',
                    borderRadius: 28,
                    background: 'none',
                    boxShadow: form.goal === goal.key ? '0 0 24px #fb923c33' : 'none',
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
                  onClick={() => setForm((f) => ({ ...f, goal: goal.key }))}
                >
                  {goal.img ? (
                    <img
                      src={goal.img}
                      alt={goal.label}
                      style={{
                        width: '100%',
                        height: 430,
                        objectFit: 'cover',
                        margin: 0,
                        borderRadius: 24,
                        display: 'block',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 72, margin: '32px 0 16px 0', textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{goal.icon}</span>
                  )}
                  <div
                    className="text-center font-extrabold text-lg sm:text-xl mt-2"
                    style={{
                      color: form.goal === goal.key ? '#fb923c' : 'black',
                      textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    }}
                  >
                    <span className="dark:hidden">{goal.label}</span>
                    <span className="hidden dark:inline" style={{ color: form.goal === goal.key ? '#fb923c' : 'white' }}>{goal.label}</span>
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
                disabled={!form.goal}
                onClick={nextStep}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 ${form.goal ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                style={{
                  letterSpacing: 1,
                  boxShadow: form.goal ? '0 4px 24px 0 rgba(255, 87, 34, 0.18)' : undefined,
                }}
              >
                <span className="inline-block align-middle">Next</span>
                {form.goal && (
                  <span className="inline-block align-middle ml-2 animate-bounce">→</span>
                )}
              </button>
            </div>
          </div>
        )}
        {step === 'equipment' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>Welke apparatuur heb je tot je beschikking?</h2>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-6" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Selecteer alles wat je kunt gebruiken voor je workouts:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16 justify-center items-center my-10 place-items-center">
              {[
                { key: 'bodyweight', label: 'Bodyweight', img: '/images/equipment_bodyweight.webp' },
                { key: 'dumbbells', label: 'Dumbbells', img: '/images/equipment_dumbbells.webp' },
                { key: 'resistance_bands', label: 'Resistance Bands', img: '/images/equipment_bands.webp' },
                { key: 'barbell', label: 'Barbell', img: '/images/equipment_barbell.webp' },
                { key: 'kettlebell', label: 'Kettlebell', img: '/images/equipment_kettlebell.webp' },
                { key: 'machines', label: 'Machines', img: '/images/equipment_machines.webp' },
                { key: 'bench', label: 'Bench', img: '/images/equipment_bench.webp' },
                { key: 'pullup_bar', label: 'Pull-up Bar', img: '/images/equipment_pullupbar.webp' },
              ].map((eq) => (
                <button
                  key={eq.key}
                  style={{
                    border: (form.equipment || '').split(',').includes(eq.key) ? '4px solid #fb923c' : '2px solid #b0b0b0',
                    borderRadius: 28,
                    background: 'none',
                    boxShadow: (form.equipment || '').split(',').includes(eq.key) ? '0 0 24px #fb923c33' : 'none',
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
                  onClick={() => {
                    setForm((f) => {
                      const selected = (f.equipment || '').split(',').filter(Boolean);
                      if (selected.includes(eq.key)) {
                        return { ...f, equipment: selected.filter((k) => k !== eq.key).join(',') };
                      } else {
                        return { ...f, equipment: [...selected, eq.key].join(',') };
                      }
                    });
                  }}
                >
                  <img
                    src={eq.img}
                    alt={eq.label}
                    style={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      margin: 0,
                      borderRadius: 24,
                      display: 'block',
                    }}
                  />
                  <div
                    className="text-center font-extrabold text-lg sm:text-xl mt-2"
                    style={{
                      color: (form.equipment || '').split(',').includes(eq.key) ? '#fb923c' : 'black',
                      textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    }}
                  >
                    <span className="dark:hidden">{eq.label}</span>
                    <span className="hidden dark:inline" style={{ color: (form.equipment || '').split(',').includes(eq.key) ? '#fb923c' : 'white' }}>{eq.label}</span>
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
                  <span className="text-2xl animate-bounce">←</span> Terug
                </button>
              )}
              <button
                disabled={!(form.equipment && form.equipment.length > 0)}
                onClick={nextStep}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 ${form.equipment && form.equipment.length > 0 ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                style={{ letterSpacing: 1, boxShadow: form.equipment && form.equipment.length > 0 ? '0 4px 24px 0 rgba(255, 87, 34, 0.18)' : undefined }}
              >
                <span className="inline-block align-middle">Volgende</span>
                {form.equipment && form.equipment.length > 0 && (
                  <span className="inline-block align-middle ml-2 animate-bounce">→</span>
                )}
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>What is your current fitness level?</h2>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-6" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Select the option that best describes you:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16 justify-center items-center my-10 place-items-center">
              {[
                {
                  key: 'beginner',
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
    </>
  );
}

