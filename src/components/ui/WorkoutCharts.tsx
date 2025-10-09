// Workout Charts Component
// Displays workout statistics with beautiful visualizations

import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import moment from 'moment';

interface DailyData {
  date: string;
  completed: number;
  planned: number;
  minutes: number;
}

interface WeeklyData {
  week: string;
  completed: number;
  total: number;
  minutes: number;
}

interface WorkoutChartsProps {
  dailyData?: DailyData[];
  weeklyData?: WeeklyData[];
  type?: 'daily' | 'weekly';
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gradient-to-br from-gray-900/95 to-black/95 p-4 rounded-xl border-2 border-cyan-400/30 shadow-xl backdrop-blur-md">
        <p className="text-cyan-200 font-bold mb-2">
          {moment(label).format('ddd, MMM D')}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const WorkoutDailyChart: React.FC<{ data: DailyData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-cyan-100/60">
        Geen workout data beschikbaar
      </div>
    );
  }

  const chartData = data.map(d => ({
    date: d.date,
    Voltooid: d.completed,
    Gepland: d.planned,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B400FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#B400FF" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => moment(date).format('ddd')}
            stroke="#00E5FF"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#00E5FF" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#00E5FF', fontSize: '14px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="Voltooid"
            stroke="#00E5FF"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCompleted)"
          />
          <Area
            type="monotone"
            dataKey="Gepland"
            stroke="#B400FF"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPlanned)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export const WorkoutMinutesChart: React.FC<{ data: DailyData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-cyan-100/60">
        Geen minuten data beschikbaar
      </div>
    );
  }

  const chartData = data.map(d => ({
    date: d.date,
    Minuten: d.minutes,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6700" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#FF6700" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 103, 0, 0.1)" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => moment(date).format('ddd')}
            stroke="#FF6700"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#FF6700" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#FF6700', fontSize: '14px' }}
            iconType="circle"
          />
          <Bar
            dataKey="Minuten"
            fill="url(#colorMinutes)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export const WorkoutWeeklyChart: React.FC<{ data: WeeklyData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-cyan-100/60">
        Geen wekelijkse data beschikbaar
      </div>
    );
  }

  const chartData = data.map(d => ({
    week: moment(d.week).format('MMM D'),
    Voltooid: d.completed,
    Totaal: d.total,
    Minuten: d.minutes,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="colorWeekCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="colorWeekTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B400FF" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#B400FF" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
          <XAxis
            dataKey="week"
            stroke="#00E5FF"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#00E5FF" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#00E5FF', fontSize: '14px' }}
            iconType="circle"
          />
          <Bar
            dataKey="Voltooid"
            fill="url(#colorWeekCompleted)"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="Totaal"
            fill="url(#colorWeekTotal)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default { WorkoutDailyChart, WorkoutMinutesChart, WorkoutWeeklyChart };
