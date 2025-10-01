import React, { useRef } from "react";

const mockEvents = [
  {
    title: "Trail Run 75km",
    date: "Oct 12, 2025",
    description: "Join the epic mountain trail run!",
    image: "/images/community_workout.webp",
  },
  {
    title: "Nutrition Seminar",
    date: "Oct 18, 2025",
    description: "Learn about sports nutrition from experts.",
    image: "/images/community_workout1.webp",
  },
  {
    title: "Yoga in the Park",
    date: "Oct 22, 2025",
    description: "Outdoor yoga session for all levels.",
    image: "/images/community_challenge.webp",
  },
  {
    title: "HIIT Challenge",
    date: "Oct 28, 2025",
    description: "Test your limits in our HIIT event.",
    image: "/images/community.webp",
  },
  {
    title: "Cycling Meetup",
    date: "Nov 2, 2025",
    description: "Group ride through scenic routes.",
    image: "/images/hero_1.webp",
  },
];

export const UpcomingEventsSlider: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 260;
      scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-2 px-2">
        <h2 className="text-lg font-bold text-white">Upcoming Events</h2>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {mockEvents.map((event, idx) => (
          <div
            key={idx}
            className="min-w-[240px] max-w-[240px] rounded-xl shadow-lg flex-shrink-0 scroll-snap-align-start border border-gray-800 relative overflow-hidden"
            style={{ background: `url(${event.image}) center/cover`, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          >
            <div className="absolute inset-0 bg-black/60 rounded-xl" />
            <div className="relative z-10 p-4">
              <div className="text-purple-400 font-semibold text-base mb-1">{event.title}</div>
              <div className="text-gray-400 text-sm mb-2">{event.date}</div>
              <div className="text-gray-200 text-xs">{event.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
