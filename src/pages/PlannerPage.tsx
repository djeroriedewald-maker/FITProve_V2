

import React from 'react';
import { Typography } from '@mui/material';
import PlannerCalendar from '../components/PlannerCalendar';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const PlannerPage: React.FC = () => {
  const location = useLocation();
  const { profile, isLoading } = useAuth();
  const bg = '/images/workout_office_1.webp';

  if (isLoading || !profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#181A1B',
        }}
      >
        <div style={{ color: '#FF9100', fontWeight: 700, fontSize: 24 }}>Loading...</div>
      </div>
    );
  }
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          backgroundImage: `url('${bg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          background: 'rgba(10,10,20,0.75)',
        }}
      />
      <div style={{ padding: '2rem 1rem', maxWidth: 900, width: '100%', position: 'relative', zIndex: 2 }}>
        <Typography variant="subtitle1" gutterBottom style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          Plan je workouts, afspraken en meer. Deze planner wordt jouw centrale plek voor alles rondom je fitness journey!
        </Typography>
        <div style={{ margin: '2rem 0', width: '100%' }}>
          <PlannerCalendar plannerAddWorkout={location.state?.plannerAddWorkout} />
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
