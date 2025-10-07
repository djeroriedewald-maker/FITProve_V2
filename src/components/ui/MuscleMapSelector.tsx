import React from 'react';
// @ts-expect-error vite-plugin-svgr enables importing SVG as React component
import ManFront from '../../assets/man-front.svg?react';

// Map SVG region IDs to muscle keys and labels
const MUSCLE_REGIONS = [
  { key: 'chest', label: 'Chest', regionIds: ['muscle-0', 'muscle-24'] },
  { key: 'shoulders', label: 'Shoulders', regionIds: ['muscle-3', 'muscle-25'] },
  { key: 'biceps', label: 'Biceps', regionIds: ['muscle-5', 'muscle-27'] },
  { key: 'triceps', label: 'Triceps', regionIds: ['muscle-4', 'muscle-26'] },
  { key: 'abs', label: 'Abs', regionIds: ['muscle-10', 'muscle-32'] },
  { key: 'quads', label: 'Quads', regionIds: ['muscle-15', 'muscle-37'] },
  { key: 'calves', label: 'Calves', regionIds: ['muscle-16', 'muscle-38'] },
  { key: 'forearms', label: 'Forearms', regionIds: ['muscle-6', 'muscle-28'] },
  { key: 'neck', label: 'Neck', regionIds: ['muscle-17', 'muscle-39'] },
  { key: 'adductors', label: 'Adductors', regionIds: ['muscle-21', 'muscle-43'] },
  // Add more mappings as needed
];

// Color for selected and unselected
const SELECTED_COLOR = '#ff6b6b';
const UNSELECTED_COLOR = '#b0b0b0';

interface Props {
  value: string[];
  onChange: (selected: string[]) => void;
}

export const MuscleMapSelector: React.FC<Props> = ({ value, onChange }) => {
  // Helper to get muscle key by region id
  const getMuscleKeyByRegion = (regionId: string) => {
    for (const m of MUSCLE_REGIONS) {
      if (m.regionIds.includes(regionId)) return m.key;
    }
    return null;
  };

  // Handler for clicking a region
  const handleRegionClick = (regionId: string) => {
    const key = getMuscleKeyByRegion(regionId);
    if (!key) return;
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key));
    } else {
      onChange([...value, key]);
    }
  };

  // Render the SVG with interactive regions
  // We use the imported SVG as a React component and override fill/stroke for regions
  const svgElement = <ManFront />;

  // Clone SVG and inject interactivity
  const renderInteractiveSVG = () => {
    return React.cloneElement(
      svgElement,
      {},
      React.Children.map(svgElement.props.children, (child: React.ReactElement | null) => {
        // Only process <g> with muscle regions
        if (child?.props?.className === 'body_diagram') {
          return React.cloneElement(
            child,
            {},
            React.Children.map(child.props.children, (region: React.ReactElement | null) => {
              if (region?.props?.id && region.props.id.startsWith('muscle-')) {
                const muscleKey = getMuscleKeyByRegion(region.props.id);
                const selected = muscleKey && value.includes(muscleKey);
                // Remove original fill and style to ensure our highlight is visible
                const { fill: _fill, style: _style, ...rest } = region.props;
                return React.cloneElement(region, {
                  ...rest,
                  style: {
                    cursor: muscleKey ? 'pointer' : undefined,
                    opacity: muscleKey ? 1 : 0.5,
                  },
                  fill: selected ? SELECTED_COLOR : UNSELECTED_COLOR,
                  onClick: muscleKey ? () => handleRegionClick(region.props.id) : undefined,
                });
              }
              return region;
            })
          );
        }
        return child;
      })
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: 250, height: 560 }}>{renderInteractiveSVG()}</div>
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {MUSCLE_REGIONS.map((m) => (
          <button
            key={m.key}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
              value.includes(m.key)
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow'
                : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => handleRegionClick(m.regionIds[0])}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};
