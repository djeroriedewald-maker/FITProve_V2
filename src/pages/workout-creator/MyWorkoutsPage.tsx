import React, { useEffect, useState, useCallback } from 'react';
import migrateLocalGeneratorWorkoutsToSupabase from '../../lib/migrate-local-generator-workouts';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyGeneratorWorkouts,
  deleteGeneratorWorkout,
} from '../../lib/generator-workout.service';
import { WorkoutCreatorService } from '../../lib/workout-creator.service';
import type { CustomWorkout } from '../../types/workout-creator.types';
import { TRAINING_TYPES } from '../../constants/trainingTypes';

// Grid component for 2-column layout and see more logic
function WorkoutsGrid({
  workouts,
  renderCard,
}: {
  workouts: any[];
  renderCard: (w: any) => React.ReactNode;
}) {
  const containerStyle: React.CSSProperties & {
    WebkitOverflowScrolling?: string;
    scrollbarWidth?: string;
  } = {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    overflowX: 'auto',
    paddingBottom: 12,
    // Non-standard props typed above to avoid TS errors
    scrollbarWidth: 'thin',
    WebkitOverflowScrolling: 'touch',
  };

  const itemStyle: React.CSSProperties = {
    flex: '0 0 280px',
    maxWidth: '80vw',
    minWidth: 0,
  };

  return (
    <div style={containerStyle}>
      {workouts.map((workout, index) => {
        const key = workout?.id ?? workout?.slug ?? workout?.name ?? index;
        return (
          <div key={key} style={itemStyle}>
            {renderCard(workout)}
          </div>
        );
      })}
    </div>
  );
}

// Shared card style for both generator and creator cards
const cardStyle: React.CSSProperties = {
  position: 'relative',
  borderRadius: 18,
  overflow: 'hidden',
  minHeight: 320,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundClip: 'padding-box',
  cursor: 'pointer',
  width: '100%',
  maxWidth: '100%',
  margin: 0,
  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
  backgroundColor: 'rgba(0,0,0,0.10)',
};

// Card for generator workouts (always uses female_pushup.webp)
function WorkoutCardModern({
  workout,
  onDelete,
  onShare,
  deleting,
}: {
  workout: any;
  onDelete: () => void;
  onShare: () => void;
  deleting: boolean;
}) {
  const hero = '/images/female_pushup.webp';
  const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);
  return (
    <div
      style={{
        ...cardStyle,
        background: `url('${hero}') center/cover no-repeat`,
      }}
    >
      {/* Brighten overlay */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.18)', zIndex: 1 }}
      />
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2 }} />
      <div
        style={{
          padding: 20,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
          zIndex: 3,
          justifyContent: 'flex-end',
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 6,
            wordBreak: 'break-word',
            color: '#fff',
            textShadow: '0 2px 8px #000, 0 0 2px #222',
          }}
        >
          {workout?.name ?? 'Untitled workout'}
        </div>
        <div
          style={{
            color: '#fff',
            fontSize: 13,
            marginBottom: 10,
            textShadow: '0 1px 4px #000, 0 0 2px #222',
          }}
        >
          {workout?.created_at ? new Date(workout.created_at).toLocaleDateString() : ''}
        </div>
        <div
          style={{
            color: '#fff',
            fontSize: 15,
            marginBottom: 8,
            wordBreak: 'break-word',
            textShadow: '0 1px 4px #000, 0 0 2px #222',
          }}
        >
          {workout?.description}
        </div>
        <div style={{ color: '#fff', fontSize: 14, textShadow: '0 1px 4px #000, 0 0 2px #222' }}>
          {workout?.total_exercises ?? 0} exercises &middot; {workout?.difficulty ?? '—'}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', rowGap: 10 }}>
          <a
            href={`/modules/workout/community?start=${workout?.id}&type=generator`}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#6a5af9',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 1px 4px #0002',
              display: 'inline-block',
            }}
            onClick={stopPropagation}
          >
            Start
          </a>
          <button
            onClick={(e) => {
              stopPropagation(e);
              onShare();
            }}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#fff',
              color: '#222',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 4px #0002',
            }}
          >
            Share
          </button>
          <button
            onClick={(e) => {
              stopPropagation(e);
              onDelete();
            }}
            disabled={deleting}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              background: deleting ? '#fbb' : '#f44',
              color: '#fff',
              fontWeight: 600,
              cursor: deleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 4px #0002',
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      {/* No animated border */}
    </div>
  );
}

// Card for creator workouts (clickable, glassmorphism, animated border)
function CreatorWorkoutCard({
  workout,
  onDelete,
  onShare,
  deleting,
}: {
  workout: CustomWorkout;
  onDelete: () => void;
  onShare: () => void;
  deleting: boolean;
}) {
  const hero = workout.hero_image_url || '/images/community_workout.webp';
  const workoutUrl = `/workout/${workout.id}?type=creator`;
  const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);
  return (
    <a
      href={workoutUrl}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        height: '100%',
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div
        style={{
          ...cardStyle,
          background: `url('${hero}') center/cover no-repeat`,
        }}
      >
        {/* Brighten overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.18)',
            zIndex: 1,
          }}
        />
        {/* Dark overlay */}
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2 }}
        />
        <div
          style={{
            padding: 20,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 3,
            minHeight: 0,
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: '#fff',
                textShadow: '0 2px 8px #000, 0 0 2px #222',
              }}
            >
              {workout.name}
            </span>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: workout.is_public ? 'rgba(76,175,80,0.18)' : 'rgba(255,82,82,0.18)',
                color: workout.is_public ? '#4caf50' : '#ff5252',
                textShadow: '0 1px 4px #000, 0 0 2px #222',
                border: workout.is_public ? '1px solid #4caf50' : '1px solid #ff5252',
                marginLeft: 4,
              }}
            >
              {workout.is_public ? 'Public' : 'Private'}
            </span>
          </div>
          <div
            style={{
              color: '#fff',
              fontSize: 13,
              marginBottom: 10,
              textShadow: '0 1px 4px #000, 0 0 2px #222',
            }}
          >
            {workout?.created_at ? new Date(workout.created_at).toLocaleDateString() : ''}
          </div>
          <div
            style={{
              color: '#fff',
              fontSize: 15,
              marginBottom: 8,
              textShadow: '0 1px 4px #000, 0 0 2px #222',
            }}
          >
            {workout.description}
          </div>
          {workout.trainingType && (
            <div
              style={{
                background: 'rgba(255,140,0,0.13)',
                borderLeft: '4px solid #ff9800',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: 8,
                marginBottom: 8,
                fontSize: 14,
                textShadow: '0 1px 4px #000, 0 0 2px #222',
              }}
            >
              <b>Trainingsvorm:</b>{' '}
              {TRAINING_TYPES.find((t) => t.value === workout.trainingType)?.label}
              <br />
              <span style={{ color: '#ffd699', fontWeight: 400, fontSize: 13 }}>
                {TRAINING_TYPES.find((t) => t.value === workout.trainingType)?.description}
              </span>
            </div>
          )}
          <div style={{ color: '#fff', fontSize: 14, textShadow: '0 1px 4px #000, 0 0 2px #222' }}>
            {workout.total_exercises} exercises &middot; {workout.difficulty}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', rowGap: 10 }}>
            <a
              href={`/modules/workout/community?start=${workout.id}&type=creator`}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#6a5af9',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: '0 1px 4px #0002',
                display: 'inline-block',
              }}
              onClick={stopPropagation}
            >
              Start
            </a>
            <a
              href={`/modules/workout/workout-creator?edit=${workout.id}`}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#ffa726',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: '0 1px 4px #0002',
                display: 'inline-block',
              }}
              onClick={stopPropagation}
            >
              Edit
            </a>
            <button
              onClick={(e) => {
                stopPropagation(e);
                onShare();
              }}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#fff',
                color: '#222',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 4px #0002',
              }}
            >
              Share
            </button>
            <button
              onClick={(e) => {
                stopPropagation(e);
                onDelete();
              }}
              disabled={deleting}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: 'none',
                background: deleting ? '#fbb' : '#f44',
                color: '#fff',
                fontWeight: 600,
                cursor: deleting ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px #0002',
              }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        {/* No animated border */}
      </div>
    </a>
  );
}

const MyWorkoutsPage: React.FC = () => {
  const [generatorWorkouts, setGeneratorWorkouts] = useState<any[]>([]);
  const [creatorWorkouts, setCreatorWorkouts] = useState<CustomWorkout[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    async function migrateAndFetch(userId: string) {
      await migrateLocalGeneratorWorkoutsToSupabase(userId);
      const generator = await getMyGeneratorWorkouts(userId);
      setGeneratorWorkouts(generator ?? []);
      const creator = await WorkoutCreatorService.getUserWorkouts();
      setCreatorWorkouts(creator ?? []);
    }
    if (!isLoading && user?.id) {
      void migrateAndFetch(user.id);
    } else if (!isLoading && !user?.id) {
      setGeneratorWorkouts([]);
      setCreatorWorkouts([]);
    }
  }, [user, isLoading]);

  // Delete generator workout
  async function handleDeleteGenerator(id: string) {
    if (!user?.id) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete this workout? This action cannot be undone.'
    );
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deleteGeneratorWorkout(id, user.id);
      setGeneratorWorkouts((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // Delete creator workout
  async function handleDeleteCreator(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this workout? This action cannot be undone.'
    );
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await WorkoutCreatorService.deleteWorkout(id);
      setCreatorWorkouts((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // Share handler (copies link to clipboard)
  function handleShare(id: string, type: 'generator' | 'creator') {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/workout/${id}?type=${type}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => alert('Shareable link copied to clipboard!'),
        () => alert(`Share link: ${url}`)
      );
    } else {
      alert(`Share link: ${url}`);
    }
  }

  return (
    <>
      {/* Header Banner */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          overflow: 'hidden',
          marginBottom: 32,
        }}
      >
        <img
          src="/images/gym_banner.webp"
          alt="Gym Banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <h1
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '2.8rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            margin: 0,
            zIndex: 2,
            textShadow: '0 2px 12px rgba(0,0,0,0.10)',
          }}
        >
          My Workouts
        </h1>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
        {/* Generator Workouts Section */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          SAVED FROM GENERATOR
        </h2>
        {generatorWorkouts.length === 0 ? (
          <div style={{ color: '#888', marginBottom: 40 }}>No generator workouts saved yet.</div>
        ) : (
          <WorkoutsGrid
            workouts={generatorWorkouts}
            renderCard={(w: any) => (
              <WorkoutCardModern
                workout={w}
                onDelete={() => handleDeleteGenerator(w.id)}
                onShare={() => handleShare(w.id, 'generator')}
                deleting={deletingId === w.id}
              />
            )}
          />
        )}

        {/* Creator/Public Workouts Section */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Saved from Creator
        </h2>
        {creatorWorkouts.length === 0 ? (
          <div style={{ color: '#888' }}>No creator workouts yet.</div>
        ) : (
          <WorkoutsGrid
            workouts={creatorWorkouts}
            renderCard={(w: any) => (
              <CreatorWorkoutCard
                workout={w}
                onDelete={() => handleDeleteCreator(w.id)}
                onShare={() => handleShare(w.id, 'creator')}
                deleting={deletingId === w.id}
              />
            )}
          />
        )}
      </div>
    </>
  );
};

export { MyWorkoutsPage };
