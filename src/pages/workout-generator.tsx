import React, { useState } from 'react';
import manFrontSvg from '../assets/man-front.svg?raw';
import manBackSvg from '../assets/man-back.svg?raw';

// --- MuscleMapSelector code ---
type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abdominals'
  | 'obliques'
  | 'lowerBack'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'serratusAnterior';

const MUSCLE_MAP: Record<MuscleGroup, string[]> = {
  chest: ['muscle-0', 'muscle-24'],
  back: ['bMuscle-0', 'bMuscle-18', 'bMuscle-3', 'bMuscle-19', 'bMuscle-32', 'bMuscle-33'],
  shoulders: ['muscle-3', 'muscle-25', 'bMuscle-18', 'bMuscle-0'],
  biceps: ['muscle-41', 'muscle-19'],
  triceps: ['muscle-5', 'muscle-27', 'bMuscle-15', 'bMuscle-28'],
  forearms: ['muscle-6', 'muscle-28', 'muscle-22', 'muscle-44', 'bMuscle-29', 'bMuscle-16'],
  abdominals: [
    'muscle-10',
    'muscle-32',
    'muscle-33',
    'muscle-34',
    'muscle-35',
    'muscle-11',
    'muscle-12',
    'muscle-13',
  ],
  obliques: ['muscle-9', 'muscle-31', 'muscle-8', 'muscle-30'],
  lowerBack: ['bMuscle-4', 'bMuscle-34'],
  glutes: ['bMuscle-7', 'bMuscle-22', 'bMuscle-21', 'bMuscle-6'],
  quadriceps: [
    'muscle-21',
    'muscle-43',
    'muscle-23',
    'muscle-45',
    'muscle-20',
    'muscle-42',
    'bMuscle-36',
    'bMuscle-35',
    'bMuscle-38',
    'bMuscle-8',
  ],
  hamstrings: ['bMuscle-17', 'bMuscle-37'],
  calves: [
    'muscle-14',
    'muscle-',
    'bMuscle-9',
    'bMuscle-10',
    'muscle-36',
    'bMuscle-24',
    'bMuscle-23',
  ],
  serratusAnterior: ['muscle-7', 'muscle-29'],
};

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abdominals: 'Abdominals',
  obliques: 'Obliques',
  lowerBack: 'Lower Back',
  glutes: 'Glutes',
  quadriceps: 'Quadriceps',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
  serratusAnterior: 'Serratus Anterior',
};

function getMuscleGroupByPathId(pathId: string): MuscleGroup | undefined {
  return (Object.keys(MUSCLE_MAP) as MuscleGroup[]).find((group) =>
    MUSCLE_MAP[group].includes(pathId)
  );
}

const MuscleMapSelector: React.FC<{
  value: MuscleGroup[];
  onChange: (muscles: MuscleGroup[]) => void;
}> = ({ value, onChange }) => {
  function getHighlightedSvg(svg: string) {
    let highlightedSvg = svg;
    Object.entries(MUSCLE_MAP).forEach(([group, ids]) => {
      if (value.includes(group as MuscleGroup)) {
        ids.forEach((id) => {
          const regex = new RegExp(
            `<path([^>]+id=['"]${id}['"][^>]*)fill=['"][^'"]*['"]([^>]*)>`,
            'g'
          );
          highlightedSvg = highlightedSvg.replace(
            regex,
            `<path$1fill="#e53935"$2 style="filter: drop-shadow(0 0 8px #e53935);">`
          );
        });
      }
    });
    return highlightedSvg;
  }

  function handleSvgClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as SVGPathElement;
    if (target && target.tagName === 'path' && target.id) {
      const group = getMuscleGroupByPathId(target.id);
      if (group) {
        onChange(value.includes(group) ? value.filter((g) => g !== group) : [...value, group]);
      }
    }
  }

  function renderButtons() {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
        {(Object.keys(MUSCLE_MAP) as MuscleGroup[]).map((group) => (
          <button
            key={group}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: value.includes(group) ? '#e53935' : '#fff',
              color: value.includes(group) ? '#fff' : '#222',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 4,
            }}
            onClick={() =>
              onChange(value.includes(group) ? value.filter((g) => g !== group) : [...value, group])
            }
          >
            {MUSCLE_LABELS[group]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Front</div>
          <div
            style={{ width: 240, cursor: 'pointer', userSelect: 'none' }}
            onClick={handleSvgClick}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: getHighlightedSvg(manFrontSvg) }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Back</div>
          <div
            style={{ width: 240, cursor: 'pointer', userSelect: 'none' }}
            onClick={handleSvgClick}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: getHighlightedSvg(manBackSvg) }}
          />
        </div>
      </div>
      {renderButtons()}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <strong>Selected:</strong>{' '}
        {value.length ? value.map((g) => MUSCLE_LABELS[g]).join(', ') : 'None'}
      </div>
    </div>
  );
};
// --- End MuscleMapSelector ---

const getTextColor = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? '#fff' : '#111';

const getGlowColor = (gender: string) =>
  gender === 'female'
    ? '0 0 24px 8px #ff69b4, 0 0 48px 16px #ffb6e6, 0 0 12px 2px #fff'
    : '0 0 24px 8px #2196f3, 0 0 48px 16px #90caf9, 0 0 12px 2px #fff';

const steps = ['Gender', 'Age', 'Goal', 'Level', 'Equipment', 'Muscles', 'Summary'];

const genderImages = [
  { value: 'male', src: '/images/male_selection.webp', label: 'Male' },
  { value: 'female', src: '/images/female_selection.webp', label: 'Female' },
];

const goalImages = [
  {
    value: 'buildmuscle',
    label: 'Build Muscle',
    src: {
      male: '/images/buildmuscle_men.webp',
      female: '/images/buildmuscle_women.webp',
    },
  },
  {
    value: 'endurance',
    label: 'Endurance',
    src: {
      male: '/images/endurance_male.webp',
      female: '/images/endurance_female.webp',
    },
  },
  {
    value: 'getfitter',
    label: 'Get Fitter',
    src: {
      male: '/images/getfitter_male.webp',
      female: '/images/getfitter_female.webp',
    },
  },
  {
    value: 'weightloss',
    label: 'Weight Loss',
    src: {
      male: '/images/losefat_male.webp',
      female: '/images/losefat_female.webp',
    },
  },
];

const levelImages = [
  {
    value: 'beginner',
    label: 'Beginner',
    src: {
      male: '/images/beginner_male.webp',
      female: '/images/beginner_female.webp',
    },
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    src: {
      male: '/images/Intermediate_male.webp',
      female: '/images/Intermediate_female.webp',
    },
  },
  {
    value: 'advanced',
    label: 'Advanced',
    src: {
      male: '/images/Advanced_male.webp',
      female: '/images/Advanced_female.webp',
    },
  },
  {
    value: 'athlete',
    label: 'Athlete',
    src: {
      male: '/images/Athlete_male.webp',
      female: '/images/Athlete_female.webp',
    },
  },
];

const equipmentImages = [
  { value: 'bodyweight', src: '/images/noequipment.webp', label: 'Bodyweight' },
  { value: 'barbell', src: '/images/barbell.webp', label: 'Barbell' },
  { value: 'bench', src: '/images/bench.webp', label: 'Bench' },
  { value: 'dumbbells', src: '/images/dumbbells.webp', label: 'Dumbbells' },
  { value: 'kettlebell', src: '/images/kettlebell.webp', label: 'Kettlebell' },
  { value: 'pullupbar', src: '/images/Pull-up Bar.webp', label: 'Pull-up Bar' },
  { value: 'resistancebands', src: '/images/resistance Bands.webp', label: 'Resistance Bands' },
];

const WorkoutGenerator: React.FC = () => {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState<number>(25);
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);

  const progress = ((step + 1) / steps.length) * 100;

  const handleEquipmentClick = (value: string) => {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="image-grid tall">
            {genderImages.map((img) => (
              <button
                key={img.value}
                className={`img-btn tall${gender === img.value ? ' selected' : ''}`}
                style={{
                  boxShadow: gender === img.value ? getGlowColor(img.value) : '0 0 0 2px #888',
                }}
                onClick={() => setGender(img.value as 'male' | 'female')}
                aria-label={img.label}
              >
                <img src={img.src} alt={img.label} />
                <span className="img-label">{img.label}</span>
              </button>
            ))}
          </div>
        );
      case 1:
        return (
          <div className="age-slider-step">
            <input
              type="range"
              min={12}
              max={80}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="age-slider"
              style={{ accentColor: gender === 'female' ? '#ff69b4' : '#2196f3' }}
            />
            <div className="age-slider-value" style={{ color: getTextColor() }}>
              {age} years
            </div>
          </div>
        );
      case 2:
        return (
          <div className="image-grid tall">
            {goalImages.map((img) => (
              <button
                key={img.value}
                className={`img-btn tall${goal === img.value ? ' selected' : ''}`}
                style={{
                  boxShadow: goal === img.value ? getGlowColor(gender ?? 'male') : '0 0 0 2px #888',
                }}
                onClick={() => setGoal(img.value)}
                aria-label={img.label}
              >
                <img src={img.src[gender ?? 'male']} alt={img.label} />
                <span className="img-label">{img.label}</span>
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="image-grid tall">
            {levelImages.map((img) => (
              <button
                key={img.value}
                className={`img-btn tall${level === img.value ? ' selected' : ''}`}
                style={{
                  boxShadow:
                    level === img.value ? getGlowColor(gender ?? 'male') : '0 0 0 2px #888',
                }}
                onClick={() => setLevel(img.value)}
                aria-label={img.label}
              >
                <img src={img.src[gender ?? 'male']} alt={img.label} />
                <span className="img-label">{img.label}</span>
              </button>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="image-grid equipment">
            {equipmentImages.map((img) => (
              <button
                key={img.value}
                className={`img-btn equipment${equipment.includes(img.value) ? ' selected' : ''}`}
                style={{
                  boxShadow: equipment.includes(img.value)
                    ? getGlowColor(gender ?? 'male')
                    : '0 0 0 2px #888',
                }}
                onClick={() => handleEquipmentClick(img.value)}
                aria-label={img.label}
              >
                <img src={img.src} alt={img.label} />
                <span className="img-label equipment">{img.label}</span>
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="muscle-step">
            <MuscleMapSelector value={muscles} onChange={setMuscles} />
          </div>
        );
      case 6:
        return (
          <div className="summary-step">
            <h2>Summary</h2>
            <ul>
              <li>
                <b>Gender:</b> {gender}
              </li>
              <li>
                <b>Age:</b> {age}
              </li>
              <li>
                <b>Goal:</b> {goal}
              </li>
              <li>
                <b>Level:</b> {level}
              </li>
              <li>
                <b>Equipment:</b> {equipment.join(', ')}
              </li>
              <li>
                <b>Muscles:</b> {muscles.map((g) => MUSCLE_LABELS[g]).join(', ')}
              </li>
            </ul>
            <button className="primary-btn" onClick={() => alert('Workout generated!')}>
              Generate Workout
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const canContinue = () => {
    switch (step) {
      case 0:
        return !!gender;
      case 1:
        return !!age && age >= 12 && age <= 80;
      case 2:
        return !!goal;
      case 3:
        return !!level;
      case 4:
        return equipment.length > 0;
      case 5:
        return muscles.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="onboarding-root">
      {/* Hero image with overlay text */}
      <div className="hero-image-container">
        <img src="/images/onboarding.webp" alt="Onboarding" className="hero-image" />
        <div className="hero-overlay">
          <span>Onboarding</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-outer">
        <div
          className="progress-bar-inner"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2196f3 0%, #ff69b4 100%)',
          }}
        />
      </div>
      <div className="step-label" style={{ color: getTextColor() }}>
        Step {step + 1} of {steps.length}: {steps[step]}
      </div>

      {/* Step content */}
      <div className="step-content">{renderStep()}</div>

      {/* Navigation */}
      <div className="nav-btns">
        {step > 0 && (
          <button className="secondary-btn" onClick={prevStep}>
            Back
          </button>
        )}
        {step < steps.length - 2 && (
          <button className="primary-btn" onClick={nextStep} disabled={!canContinue()}>
            Next
          </button>
        )}
        {step === steps.length - 2 && (
          <button
            className="primary-btn"
            onClick={nextStep}
            disabled={!canContinue()}
            style={{
              background:
                gender === 'female'
                  ? 'linear-gradient(90deg,#ff69b4 0%,#ffb6e6 100%)'
                  : 'linear-gradient(90deg,#2196f3 0%,#90caf9 100%)',
              fontWeight: 800,
              fontSize: '1.3rem',
            }}
          >
            Generate
          </button>
        )}
      </div>

      {/* Styles */}
      <style>{`
        :root {
          --onboarding-text-light: #111;
          --onboarding-text-dark: #fff;
        }
        .onboarding-root {
          max-width: 700px;
          margin: 0 auto;
          padding: 0 0 48px 0;
          font-family: 'Inter', Arial, sans-serif;
        }
        .hero-image-container {
          position: relative;
          width: 100vw;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          max-width: 100vw;
          overflow: hidden;
          height: 220px;
        }
        .hero-image {
          width: 100vw;
          height: 220px;
          object-fit: cover;
          object-position: top;
          display: block;
          background: transparent;
        }
        .hero-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .hero-overlay span {
          font-size: 2.8rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.1em;
          background: none;
          border-radius: 12px;
          padding: 0.2em 1.2em;
        }
        .progress-bar-outer {
          width: 100%;
          height: 18px;
          background: #2222;
          border-radius: 12px;
          margin: 24px 0 8px 0;
          overflow: hidden;
          box-shadow: 0 2px 12px #0002;
        }
        .progress-bar-inner {
          height: 100%;
          border-radius: 12px;
          background: linear-gradient(90deg, #2196f3 0%, #ff69b4 100%);
          transition: width 0.6s cubic-bezier(.4,2,.6,1);
        }
        .step-label {
          text-align: center;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 18px;
        }
        .step-content {
          margin: 0 auto 24px auto;
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .image-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px 24px;
          width: 100%;
          justify-items: center;
        }
        .image-grid.tall {
          gap: 40px 24px;
        }
        .image-grid.equipment {
          grid-template-columns: repeat(2, 1fr);
          gap: 32px 24px;
        }
        .img-btn {
          border: 3px solid #888;
          border-radius: 18px;
          margin: 0;
          padding: 0;
          background: transparent;
          overflow: hidden;
          width: 220px;
          height: 220px;
          position: relative;
          transition: box-shadow 0.3s, border-color 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .img-btn.tall {
          height: 440px;
        }
        .img-btn.equipment {
          height: 320px;
          max-height: 32vw;
          min-height: 180px;
        }
        .img-btn.selected {
          border-color: transparent;
          animation: glowPulse 1.2s infinite alternate;
        }
        @keyframes glowPulse {
          0% { filter: drop-shadow(0 0 0 #fff); }
          100% { filter: drop-shadow(0 0 24px #ff69b4aa); }
        }
        .img-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          border-radius: 0;
          border: none;
          margin: 0;
          display: block;
          background: transparent;
        }
        .img-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin-top: 0;
          background: linear-gradient(90deg, #222 60%, #444 100%);
          width: 100%;
          text-align: center;
          padding: 0.5em 0;
          border-top: 2px solid #fff3;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          text-shadow: 0 2px 8px #000, 0 0 2px #fff;
          letter-spacing: 0.04em;
        }
        .img-label.equipment {
          font-size: 1.2rem;
          padding: 0.6em 0;
        }
        .img-btn.selected .img-label {
          background: ${
            gender === 'female'
              ? 'linear-gradient(90deg,#ff69b4 0%,#ffb6e6 100%)'
              : 'linear-gradient(90deg,#2196f3 0%,#90caf9 100%)'
          };
          color: #fff;
          text-shadow: 0 2px 8px #000, 0 0 2px #fff;
        }
        .age-slider-step {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .age-slider {
          width: 80%;
          margin: 32px 0 12px 0;
          height: 8px;
        }
        .age-slider-value {
          font-size: 2.2rem;
          font-weight: 700;
          margin-top: 0;
        }
        .muscle-step {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .summary-step {
          width: 100%;
          text-align: center;
        }
        .summary-step ul {
          list-style: none;
          padding: 0;
          margin: 0 0 18px 0;
        }
        .summary-step li {
          font-size: 1.1rem;
          margin-bottom: 6px;
          color: ${getTextColor()};
        }
        .primary-btn, .secondary-btn {
          font-size: 1.3rem;
          font-weight: 800;
          border: none;
          border-radius: 12px;
          padding: 0.7em 2.2em;
          margin: 0 8px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 16px #0003;
        }
        .primary-btn {
          background: ${
            gender === 'female'
              ? 'linear-gradient(90deg,#ff69b4 0%,#ffb6e6 100%)'
              : 'linear-gradient(90deg,#2196f3 0%,#90caf9 100%)'
          };
          color: #fff;
        }
        .primary-btn:disabled {
          background: #aaa;
          color: #fff;
          cursor: not-allowed;
        }
        .secondary-btn {
          background: #fff;
          color: #222;
          border: 2px solid #888;
        }
        .secondary-btn:hover, .primary-btn:hover {
          filter: brightness(1.08);
          box-shadow: 0 4px 24px #0005;
        }
        .nav-btns {
          display: flex;
          justify-content: center;
          gap: 18px;
          margin-top: 18px;
        }
        @media (max-width: 900px) {
          .onboarding-root {
            max-width: 100vw;
            padding: 0;
          }
          .hero-image-container, .hero-image {
            height: 120px;
          }
          .img-btn, .img-btn.tall {
            width: 44vw;
            max-width: 220px;
          }
          .img-btn.tall {
            height: 88vw;
            max-height: 440px;
          }
          .img-btn.equipment {
            height: 38vw;
            min-height: 120px;
            max-height: 240px;
          }
          .image-grid {
            gap: 18px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkoutGenerator;
