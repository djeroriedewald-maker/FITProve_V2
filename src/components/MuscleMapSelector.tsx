import React, { useState } from 'react';

// Import your SVGs as raw strings (adjust paths as needed)
import manFrontSvg from '../assets/man-front.svg?raw';
import manBackSvg from '../assets/man-back.svg?raw';

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
  serratusAnterior: ['muscle-7', 'muscle-29'], // Example IDs, adjust as needed
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

export const MuscleMapSelector: React.FC = () => {
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);

  // Highlight selected muscle paths in the SVG string
  function getHighlightedSvg(svg: string) {
    let highlightedSvg = svg;
    Object.entries(MUSCLE_MAP).forEach(([group, ids]) => {
      if (selectedMuscles.includes(group as MuscleGroup)) {
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

  // Handle clicking on a muscle region in the SVG
  function handleSvgClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as SVGPathElement;
    if (target && target.tagName === 'path' && target.id) {
      const group = getMuscleGroupByPathId(target.id);
      if (group) {
        setSelectedMuscles((prev) =>
          prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
        );
      }
    }
  }

  // Render muscle group buttons
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
              background: selectedMuscles.includes(group) ? '#e53935' : '#fff',
              color: selectedMuscles.includes(group) ? '#fff' : '#222',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 4,
            }}
            onClick={() =>
              setSelectedMuscles((prev) =>
                prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
              )
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
        {selectedMuscles.length ? selectedMuscles.map((g) => MUSCLE_LABELS[g]).join(', ') : 'None'}
      </div>
    </div>
  );
};

export default MuscleMapSelector;
