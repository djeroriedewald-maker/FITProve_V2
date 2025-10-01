import { Heart, Dumbbell, Flame, Trophy, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, ScaleIn } from "../components/ui/Animations";
import { ProgressiveImage } from "../components/ui/ProgressiveImage";
import { FloatingActionButton } from "../components/ui/FloatingActionButton";
import { StatCard } from "../components/ui/StatCard";
import { FeaturedCommunityWorkoutsSlider } from "../components/community/FeaturedCommunityWorkoutsSlider";
import { UpcomingEventsSlider } from "../components/ui/UpcomingEventsSlider";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { WorkoutCreatorService } from "../lib/workout-creator.service";

export const HomePage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const { user, profile } = useAuth();
  const [createdWorkouts, setCreatedWorkouts] = useState<number>(0);
  const [completedWorkouts, setCompletedWorkouts] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Unmounted guard to avoid setting state after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Badges/achievements from profile
  const badgesEarned =
    profile?.achievements?.filter((a: { unlockedAt?: string | Date | null }) => a?.unlockedAt)?.length || 0;

  // Personal records: placeholder (implement real logic if available)
  const personalRecords = 0;

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Created workouts
        const workouts = (await WorkoutCreatorService.getUserWorkouts?.()) ?? [];
        if (isMountedRef.current) setCreatedWorkouts(Array.isArray(workouts) ? workouts.length : 0);

        // Completed workouts
        const sessions = (await WorkoutCreatorService.getUserWorkoutSessions?.()) ?? [];
        const completed = Array.isArray(sessions)
          ? sessions.filter((s: { status?: string }) => s?.status === "completed").length
          : 0;
        if (isMountedRef.current) setCompletedWorkouts(completed);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    }

    if (user) {
      fetchStats();
    } else {
      // Reset when user logs out
      setCreatedWorkouts(0);
      setCompletedWorkouts(0);
      setLoading(false);
    }
  }, [user]);

  return (
  <div className="min-h-screen bg-black pt-4 pb-16">
      {/* Hero Section */}
      <section className="relative m-0 overflow-hidden p-0">
        <div className="relative w-full">
          <ProgressiveImage
            src="/images/hero_1.webp"
            alt="Hero background"
            className="h-[40vh] w-full object-cover sm:h-[60vh]"
          />
          {/* Subtle dark overlay */}
          <div className="pointer-events-none absolute inset-0 bg-black/30 dark:bg-black/50" />
        </div>

        <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center">
          <div className="pointer-events-auto mx-auto max-w-3xl text-center">
            <FadeIn delay={0.2}>
              <h2 className="mb-4 text-4xl font-extrabold leading-tight text-gray-900 dark:text-white sm:mb-6 sm:text-5xl md:text-7xl">
                Your Progress,
                <br />
                <span className="bg-gradient-to-r from-[#B400FF] to-white bg-clip-text text-transparent dark:from-[#B400FF] dark:to-white">
                  Proven.
                </span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="mb-6 px-4 text-lg text-gray-700 dark:text-gray-200 sm:mb-8 sm:text-xl">
                Track, analyze, and improve your workouts with intelligent insights
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="flex flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href="/signin"
                    className="group flex min-h-[44px] w-full items-center justify-center rounded-full bg-black px-6 py-4 font-medium text-white shadow-[0_0_32px_0_#B400FF55,0_0_16px_0_#00f0ff55]"
                    style={{
                      boxShadow: '0 0 32px 0 #B400FF55, 0 0 16px 0 #00f0ff55',
                    }}
                    aria-label="Get Started"
                  >
                    Get Started
                    <ArrowRight className="ml-2 inline transition-transform group-hover:translate-x-1" />
                  </a>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="relative -mt-12 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
              Your Fitness Journey in Real Time
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ScaleIn delay={0.2}>
              <StatCard
                icon={Dumbbell}
                title="Workouts Completed"
                value={loading ? "..." : completedWorkouts}
                animate
                description="All time"
                iconClassName="text-neon-yellow"
                bgImage="/images/workouts_completed.webp"
              />
            </ScaleIn>

            <ScaleIn delay={0.3}>
              <StatCard
                icon={Flame}
                title="Workouts Created"
                value={loading ? "..." : createdWorkouts}
                animate
                description="All time"
                iconClassName="text-neon-yellow"
                bgImage="/images/workouts_created.webp"
              />
            </ScaleIn>

            <ScaleIn delay={0.4}>
              <StatCard
                icon={Trophy}
                title="Badges Earned"
                value={loading ? "..." : badgesEarned}
                animate
                description="All time"
                iconClassName="text-neon-yellow"
                bgImage="/images/badges_earned.webp"
              />
            </ScaleIn>

            <ScaleIn delay={0.5}>
              <StatCard
                icon={Heart}
                title="Personal Records"
                value={loading ? "..." : personalRecords}
                animate
                description="All time"
                iconClassName="text-neon-yellow"
                bgImage="/images/personal_records.webp"
              />
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* Featured Community Workouts + Upcoming Events */}
      <div className="mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturedCommunityWorkoutsSlider />
        <UpcomingEventsSlider />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};
