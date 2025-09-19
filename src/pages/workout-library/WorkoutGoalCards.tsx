import { FaFire, FaDumbbell, FaHeartbeat, FaUserFriends, FaStar } from 'react-icons/fa';

const workoutCards = [
  {
    title: "Body Composition Goals",
    icon: <FaFire className="text-3xl text-orange-500" />,
    color: "from-orange-400 to-pink-500",
    items: [
      "Lose weight / fat loss",
      "Build muscle (hypertrophy)",
      "Body recomposition",
      "Tone up / get lean"
    ]
  },
  {
    title: "Performance Goals",
    icon: <FaDumbbell className="text-3xl text-blue-500" />,
    color: "from-blue-400 to-purple-500",
    items: [
      "Strength gains",
      "Endurance improvement",
      "Speed / agility",
      "Skill development"
    ]
  },
  {
    title: "Health & Wellness Goals",
    icon: <FaHeartbeat className="text-3xl text-red-500" />,
    color: "from-red-400 to-amber-500",
    items: [
      "Improve cardiovascular health",
      "Boost energy levels",
      "Support healthy aging",
      "Rehabilitation / injury prevention",
      "Better mental health"
    ]
  },
  {
    title: "Lifestyle & Confidence Goals",
    icon: <FaStar className="text-3xl text-yellow-400" />,
    color: "from-yellow-400 to-lime-400",
    items: [
      "Look and feel better",
      "Prepare for an event",
      "Sports performance",
      "Daily functionality"
    ]
  },
  {
    title: "Community & Consistency Goals",
    icon: <FaUserFriends className="text-3xl text-teal-500" />,
    color: "from-teal-400 to-cyan-500",
    items: [
      "Accountability / routine",
      "Social interaction",
      "Competition"
    ]
  }
];

export default function WorkoutGoalCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto px-4 py-8">
      {workoutCards.map((card, idx) => (
        <div
          key={card.title}
          className={
            `group relative rounded-3xl shadow-xl overflow-hidden ` +
            `bg-gradient-to-br ${card.color} ` +
            `transition-transform transform hover:scale-105 active:scale-100 ` +
            `border-2 border-white/10`
          }
        >
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-white pointer-events-none" />
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-2">
              {card.icon}
              <h3 className="text-xl font-bold text-white drop-shadow">{card.title}</h3>
            </div>
            <ul className="mt-2 space-y-1 text-white/90 text-sm font-medium">
              {card.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-white/80 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
