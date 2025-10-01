// src/pages/ExerciseDetailPage.tsx
import React, { useEffect, useState } from "react";
import { Exercise } from "../types/exercise.types";
import { useNavigate, useParams } from "react-router-dom";
import { ExerciseService } from "../lib/exercise.service";
import { Clock, Dumbbell, Target, ChevronLeft } from "lucide-react";
import { YouTubeSearch } from "../components/ui/YouTubeSearch";

export default function ExerciseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected YouTube video (shown below the search box if chosen)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Fetch exercise
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        if (!id) return;
        const data = await ExerciseService.getExercise(id);
        if (isMounted) {
          setExercise(data as Exercise);
          // Start at the top of the page
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Derived optional fields (typed safely)
  const instructions = (exercise as any)?.instructions as string[] | undefined;
  const tips = (exercise as any)?.tips as string[] | undefined;
  const variations = (exercise as any)?.variations as string[] | undefined;
  const commonMistakes = (exercise as any)?.common_mistakes as string[] | undefined;
  const recommendedSets = (exercise as any)?.recommended_sets as string | number | undefined;
  const recommendedReps = (exercise as any)?.recommended_reps as string | number | undefined;

  // Detect “event” metadata (formerly HYROX), but keep UI label generic per content preference
  const isEventExercise = Array.isArray(exercise?.tags) && exercise!.tags.includes("hyrox");
  const eventMeta = isEventExercise ? (exercise as any).event_metadata : null;

  function EventMetaSection({ meta }: { meta: any }) {
    if (!meta) return null;
    const station = meta.station ?? {};
    return (
      <div className="mt-8 border-t-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 rounded-b-2xl p-5">
        <h2 className="text-2xl font-bold text-yellow-600 mb-2">Event Details</h2>
        {station.name && <div className="font-semibold text-yellow-700">Station: {station.name}</div>}
        {station.description && <div className="text-sm text-yellow-800 mb-2">{station.description}</div>}
        {station.runDistanceBefore && (
          <div className="text-xs text-yellow-700">Run Before: {station.runDistanceBefore}</div>
        )}
        {station.stationWork && <div className="text-xs text-yellow-700">Work: {station.stationWork}</div>}
        {Array.isArray(station.primaryFocus) && station.primaryFocus.length > 0 && (
          <div className="text-xs text-yellow-700">Focus: {station.primaryFocus.join(", ")}</div>
        )}
        {Array.isArray(station.officialResources) && station.officialResources.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold text-yellow-700 mb-1">Official Resources:</div>
            <ul className="list-disc ml-4 text-xs text-yellow-700">
              {station.officialResources.map((r: any) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-yellow-700"
                  >
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {Array.isArray(station.transitionNotes) && station.transitionNotes.length > 0 && (
          <div className="mt-2 text-xs text-yellow-700">Transition: {station.transitionNotes.join(" ")}</div>
        )}
      </div>
    );
  }

  if (loading || !exercise) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
        Loading exercise details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900 text-white flex flex-col items-center px-2 py-4 sm:px-6 md:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex gap-3 items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-900/90 backdrop-blur-lg">
          {/* Top image holder with YouTube jump button */}
          <div className="w-full flex flex-col items-center justify-center bg-black py-4">
            <img
              src={exercise.image_url || "/default-exercise.png"}
              alt={exercise.name}
              className="max-h-64 w-auto rounded-lg shadow-md object-contain"
            />
            <button
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={() => {
                const videoSection = document.getElementById("video-section");
                if (videoSection) videoSection.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Watch exercise on YouTube
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-orange-400 drop-shadow-lg">
              {exercise.name}
            </h1>

            <div className="flex flex-wrap gap-4 mb-4">
              {exercise.difficulty && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-medium text-sm">
                  <Clock className="w-4 h-4" /> {exercise.difficulty}
                </span>
              )}

              {Array.isArray(exercise.primary_muscles) && exercise.primary_muscles.length > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 text-orange-200 font-medium text-sm">
                  <Target className="w-4 h-4" /> {exercise.primary_muscles.join(", ")}
                </span>
              )}

              {Array.isArray(exercise.equipment) && exercise.equipment.length > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 text-orange-200 font-medium text-sm">
                  <Dumbbell className="w-4 h-4" /> {exercise.equipment.join(", ")}
                </span>
              )}
            </div>

            {exercise.description && (
              <p className="text-lg text-gray-200 mb-6 leading-relaxed">{exercise.description}</p>
            )}

            {Array.isArray(instructions) && instructions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-orange-300">Instructions</h2>
                <ul className="list-decimal list-inside space-y-2 text-gray-100">
                  {instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(tips) && tips.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-orange-300">Tips</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-100">
                  {tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(variations) && variations.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-orange-300">Variations</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-100">
                  {variations.map((variation, idx) => (
                    <li key={idx}>{variation}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(commonMistakes) && commonMistakes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-orange-300">Common Mistakes</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-100">
                  {commonMistakes.map((mistake, idx) => (
                    <li key={idx}>{mistake}</li>
                  ))}
                </ul>
              </div>
            )}

            {typeof recommendedSets !== "undefined" && (
              <div className="mb-2 text-lg text-orange-200">
                <strong>Recommended Sets:</strong> {recommendedSets}
              </div>
            )}
            {typeof recommendedReps !== "undefined" && (
              <div className="mb-2 text-lg text-orange-200">
                <strong>Recommended Reps:</strong> {recommendedReps}
              </div>
            )}

            {/* Hyrox event details above video section */}
            {isEventExercise && <EventMetaSection meta={eventMeta} />}

            {/* Video section at bottom */}
            <div id="video-section" className="mt-8">
              <h2 className="text-xl font-bold mb-2 text-orange-300">Video</h2>
              <YouTubeSearch
                query={exercise.name}
                onSelect={(video) => {
                  // Accept either a plain string id or an object with id
                  const id = typeof video === "string" ? video : (video?.id as string | undefined);
                  if (id) setSelectedVideoId(id);
                }}
              />

              {selectedVideoId && (
                <div className="mt-4 aspect-video w-full">
                  <iframe
                    className="w-full h-full rounded-xl"
                    src={`https://www.youtube.com/embed/${selectedVideoId}`}
                    title="Exercise video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>

          {/* Event section (formerly HYROX) — shown only when metadata exists, with neutral labeling */}
          {isEventExercise && <EventMetaSection meta={eventMeta} />}
        </div>
      </div>
    </div>
  );
}
