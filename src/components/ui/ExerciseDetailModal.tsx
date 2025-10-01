// src/components/ui/ExerciseDetailModal.tsx
import React, { useState } from "react";
import {
  X,
  Play,
  Clock,
  Target,
  Dumbbell,
  AlertTriangle,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronUp,
  Youtube,
  Flag,
} from "lucide-react";
import { Exercise } from "../../types/exercise.types";
import { EnhancedYouTubePlayer } from "./YouTubePlayer";
import { ExerciseImage } from "./ProgressiveImage";
import { YouTubeSearchModal } from "./YouTubeSearchModal";

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onWatchVideo: (exercise: Exercise) => void;
  isYouTubeModalOpen: boolean;
  setIsYouTubeModalOpen: (open: boolean) => void;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  isExpandable?: boolean;
}

export function ExerciseDetailModal({
  exercise,
  isOpen,
  onClose,
  onWatchVideo,
  isYouTubeModalOpen,
  setIsYouTubeModalOpen,
}: ExerciseDetailModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["description", "instructions"])
  );
  const [activeMediaTab, setActiveMediaTab] = useState<"image" | "gif" | "video">("image");

  if (!isOpen || !exercise) return null;

  const toggleSection = (sectionId: string) => {
    const next = new Set(expandedSections);
    next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
    setExpandedSections(next);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getMechanicsColor = (mechanics: string) =>
    mechanics === "compound"
      ? "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"
      : "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";

  const sections: Section[] = [];

  if (exercise.description && exercise.description.trim().length > 0) {
    sections.push({
      id: "description",
      title: "Description",
      icon: <Target className="w-5 h-5" />,
      content: (
        <p className="text-gray-700 dark:text-gray-300 leading-snug text-sm">{exercise.description}</p>
      ),
    });
  }

  if (exercise.instructions && exercise.instructions.length > 0) {
    sections.push({
      id: "instructions",
      title: "Instructions",
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <ol className="space-y-2">
          {exercise.instructions.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <span className="text-gray-700 dark:text-gray-300 leading-snug text-sm">{step}</span>
            </li>
          ))}
        </ol>
      ),
    });
  }

  if (exercise.tips && exercise.tips.length > 0) {
    sections.push({
      id: "tips",
      title: "Tips & Form Cues",
      icon: <Zap className="w-5 h-5" />,
      content: (
        <ul className="space-y-1">
          {exercise.tips.map((tip, index) => (
            <li key={index} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      ),
      isExpandable: true,
    });
  }

  if (exercise.common_mistakes && exercise.common_mistakes.length > 0) {
    sections.push({
      id: "common-mistakes",
      title: "Common Mistakes",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <ul className="space-y-1">
          {exercise.common_mistakes.map((mistake, index) => (
            <li key={index} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">{mistake}</span>
            </li>
          ))}
        </ul>
      ),
      isExpandable: true,
    });
  }

  if (exercise.variations && exercise.variations.length > 0) {
    sections.push({
      id: "variations",
      title: "Variations",
      icon: <Target className="w-5 h-5" />,
      content: (
        <ul className="space-y-1">
          {exercise.variations.map((variation, index) => (
            <li key={index} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">{variation}</span>
            </li>
          ))}
        </ul>
      ),
      isExpandable: true,
    });
  }

  if (exercise.contraindications && exercise.contraindications.length > 0) {
    sections.push({
      id: "contraindications",
      title: "Contraindications",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <ul className="space-y-1">
          {exercise.contraindications.map((item, index) => (
            <li key={index} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      ),
      isExpandable: true,
    });
  }

  // Generic race standards block (brand-neutral)
  const eventMeta = (exercise as any).event_metadata;
  if (eventMeta?.station) {
    const station = eventMeta.station;
    const divisionEntries = Object.entries(station.divisions ?? {});
    sections.push({
      id: "race-standards",
      title: "Race Standards",
      icon: <Flag className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
              Station {station.order}
            </p>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {station.name}
            </h4>
            {station.description ? (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                {station.description}
              </p>
            ) : null}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
              {"runDistanceBefore" in station && station.runDistanceBefore ? (
                <div className="bg-white/80 dark:bg-gray-800/60 rounded-md px-2 py-1">
                  <span className="font-medium text-gray-900 dark:text-white block">Run In</span>
                  {station.runDistanceBefore}
                </div>
              ) : null}
              {"stationWork" in station && station.stationWork ? (
                <div className="bg-white/80 dark:bg-gray-800/60 rounded-md px-2 py-1">
                  <span className="font-medium text-gray-900 dark:text-white block">Work</span>
                  {station.stationWork}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
              Division Standards
            </h5>
            {divisionEntries.map(([divisionKey, division]) => {
              const load = (division as any)?.loadKg as
                | { male?: number; female?: number; mixed?: number }
                | undefined;
              const target = (division as any)?.targetHeightMeters as
                | { male?: number; female?: number }
                | undefined;

              const loadParts: string[] = [];
              if (typeof load?.male === "number") loadParts.push(`Men ${load.male} kg`);
              if (typeof load?.female === "number") loadParts.push(`Women ${load.female} kg`);
              if (typeof load?.mixed === "number") loadParts.push(`Mixed ${load.mixed} kg`);

              const targetParts: string[] = [];
              if (typeof target?.male === "number") targetParts.push(`Men ${target.male} m`);
              if (typeof target?.female === "number") targetParts.push(`Women ${target.female} m`);

              return (
                <div
                  key={divisionKey}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-600 dark:text-gray-300"
                >
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {divisionKey}
                  </p>
                  {"work" in (division as any) && (division as any).work ? (
                    <p className="mt-1 text-gray-700 dark:text-gray-200">
                      {(division as any).work}
                    </p>
                  ) : null}
                  {loadParts.length > 0 && <p className="mt-1">Load: {loadParts.join(" / ")}</p>}
                  {targetParts.length > 0 && (
                    <p className="mt-1">Target: {targetParts.join(" / ")}</p>
                  )}
                  {Array.isArray((division as any).notes) && (division as any).notes.length ? (
                    <ul className="mt-1 space-y-1">
                      {(division as any).notes.map((note: string, noteIndex: number) => (
                        <li key={noteIndex} className="leading-relaxed">
                          • {note}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>

          {(Array.isArray(station.transitionNotes) && station.transitionNotes.length > 0) ||
          (Array.isArray(station.officialResources) && station.officialResources.length > 0) ? (
            <div className="space-y-2 text-xs">
              {Array.isArray(station.transitionNotes) && station.transitionNotes.length ? (
                <div>
                  <h5 className="font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                    Transition Notes
                  </h5>
                  <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                    {station.transitionNotes.map((note: string, idx: number) => (
                      <li key={idx}>• {note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {Array.isArray(station.officialResources) && station.officialResources.length ? (
                <div>
                  <h5 className="font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                    Official Resources
                  </h5>
                  <ul className="mt-1 space-y-1">
                    {station.officialResources.map(
                      (resource: { url: string; label: string }, idx: number) => (
                        <li key={idx}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-orange-600 dark:text-orange-400 hover:underline break-words"
                          >
                            {resource.label}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ),
      isExpandable: true,
    });
  }

  if (sections.length === 0) {
    sections.push({
      id: "details-unavailable",
      title: "Details",
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <p className="text-gray-500 dark:text-gray-400 italic">
          No additional details available for this exercise yet.
        </p>
      ),
    });
  }

  const availableMedia = [
    { type: "image" as const, available: !!exercise.image_url, label: "Image" },
    { type: "gif" as const, available: !!exercise.gif_url, label: "GIF" },
    { type: "video" as const, available: !!exercise.youtube_id, label: "Video" },
  ].filter((m) => m.available);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-lg shadow-xl flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {exercise.name}
            </h2>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                  exercise.difficulty
                )}`}
              >
                {exercise.difficulty}
              </span>
              {exercise.mechanics && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getMechanicsColor(
                    exercise.mechanics
                  )}`}
                >
                  {exercise.mechanics}
                </span>
              )}
              {exercise.force_type && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {exercise.force_type}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onWatchVideo(exercise)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 group"
              title="Search YouTube videos"
            >
              <Youtube className="w-5 h-5 text-red-600 group-hover:text-red-700" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Media Section */}
            <div className="lg:w-1/2 p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 lg:max-h-screen">
              {/* Media Tabs */}
              {availableMedia.length > 1 && (
                <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {availableMedia.map((media) => (
                    <button
                      key={media.type}
                      onClick={() => setActiveMediaTab(media.type)}
                      className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                        activeMediaTab === media.type
                          ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {media.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Media Display */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video max-h-80 flex items-center justify-center">
                {activeMediaTab === "image" && exercise.image_url ? (
                  <ExerciseImage exercise={exercise} className="w-full h-full" priority={true} />
                ) : activeMediaTab === "gif" && exercise.gif_url ? (
                  <ExerciseImage
                    exercise={exercise}
                    className="w-full h-full"
                    showGif={true}
                    priority={true}
                  />
                ) : activeMediaTab === "video" && exercise.youtube_id ? (
                  <EnhancedYouTubePlayer
                    videoId={exercise.youtube_id}
                    title={`${exercise.name} - Exercise Demonstration`}
                    className="w-full h-full"
                    showTitle={false}
                    showControls={false}
                    fallbackContent={
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.youtube.com/watch?v=${exercise.youtube_id}`,
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Play className="w-5 h-5" />
                          Watch on YouTube
                        </button>
                      </div>
                    }
                  />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500">
                    <Dumbbell className="w-16 h-16 mx-auto mb-2" />
                    <p>No media available</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <div className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded text-center">
                  <div className="flex items-center gap-1 mb-0.5 justify-center">
                    <Target className="w-3 h-3 text-orange-600" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Primary
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {exercise.primary_muscles?.[0] || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded text-center">
                  <div className="flex items-center gap-1 mb-0.5 justify-center">
                    <Dumbbell className="w-3 h-3 text-orange-600" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Equipment
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {Array.isArray(exercise.equipment)
                      ? exercise.equipment.join(", ")
                      : exercise.equipment || "None"}
                  </p>
                </div>

                {exercise.recommended_sets && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded text-center">
                    <div className="flex items-center gap-1 mb-0.5 justify-center">
                      <Target className="w-3 h-3 text-orange-600" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Sets
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {exercise.recommended_sets}
                    </p>
                  </div>
                )}

                {exercise.recommended_reps && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded text-center">
                    <div className="flex items-center gap-1 mb-0.5 justify-center">
                      <Clock className="w-3 h-3 text-orange-600" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Reps
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {exercise.recommended_reps}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="lg:w-1/2 lg:max-h-screen lg:overflow-y-auto">
              <div className="p-4 space-y-2">
                {sections.length > 0 ? sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);

                  return (
                    <div
                      key={section.id}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-2 last:pb-0"
                    >
                      <button
                        onClick={() => section.isExpandable && toggleSection(section.id)}
                        className={`flex items-center gap-2 w-full text-left ${
                          section.isExpandable ? "hover:text-orange-600 dark:hover:text-orange-400" : ""
                        }`}
                      >
                        <span className="text-orange-600 dark:text-orange-400">
                          {section.icon}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                          {section.title}
                        </h3>
                        {section.isExpandable && (
                          <span className="text-gray-400">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </button>

                      {(!section.isExpandable || isExpanded) && (
                        <div className="mt-1 ml-6 text-sm text-gray-700 dark:text-gray-300">
                          {section.content}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                    <p className="text-sm">No additional details available for this exercise.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex-shrink-0 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-center text-sm"
            >
              Close
            </button>
            <button
              onClick={() => onWatchVideo(exercise)}
              className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
            >
              <Youtube className="w-5 h-5" />
              Watch video
            </button>
          </div>
        </div>
      </div>

      <YouTubeSearchModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        exerciseName={exercise.name}
        exercise={exercise}
      />
    </div>
  );
}
