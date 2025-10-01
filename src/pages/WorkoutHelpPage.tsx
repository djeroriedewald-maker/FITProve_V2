import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scrollToTop } from "../utils/scroll";
import { useAuth } from "../contexts/AuthContext";
import { saveGeneratorWorkout } from "../lib/generator-workout.service";
import { Exercise } from "../types/exercise.types";
import { ExerciseService } from "../lib/exercise.service";
import rawManFrontSvg from "../assets/man-front.svg?raw";
import rawManBackSvg from "../assets/man-back.svg?raw";

// Utility to strip width/height attributes from SVG root
function stripSvgSizeAttributes(svg: string) {
  // Remove width/height on the root <svg ...>
  return svg.replace(
    /(<svg\b[^>]*)(?:(?:\swidth="[^"]*")|(?:\sheight="[^"]*"))+([^>]*>)/gi,
    (_m, p1, p2) => `${p1}${p2}`
  );
}

const manFrontSvg = stripSvgSizeAttributes(rawManFrontSvg);
const manBackSvg = stripSvgSizeAttributes(rawManBackSvg);

// --- MuscleMapSelector code ---
type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abdominals"
  | "obliques"
  | "lowerBack"
  | "glutes"
  | "quadriceps"
  | "hamstrings"
  | "calves"
  | "serratusAnterior";

const MUSCLE_MAP: Record<MuscleGroup, string[]> = {
  chest: ["muscle-0", "muscle-24"],
  back: ["bMuscle-0", "bMuscle-18", "bMuscle-3", "bMuscle-19", "bMuscle-32", "bMuscle-33"],
  shoulders: ["muscle-3", "muscle-25", "bMuscle-18", "bMuscle-0"],
  biceps: ["muscle-41", "muscle-19"],
  triceps: ["muscle-5", "muscle-27", "bMuscle-15", "bMuscle-28"],
  forearms: ["muscle-6", "muscle-28", "muscle-22", "muscle-44", "bMuscle-29", "bMuscle-16"],
  abdominals: ["muscle-10", "muscle-32", "muscle-33", "muscle-34", "muscle-35", "muscle-11", "muscle-12", "muscle-13"],
  obliques: ["muscle-9", "muscle-31", "muscle-8", "muscle-30"],
  lowerBack: ["bMuscle-4", "bMuscle-34"],
  glutes: ["bMuscle-7", "bMuscle-22", "bMuscle-21", "bMuscle-6"],
  quadriceps: ["muscle-21", "muscle-43", "muscle-23", "muscle-45", "muscle-20", "muscle-42", "bMuscle-36", "bMuscle-35", "bMuscle-38", "bMuscle-8"],
  hamstrings: ["bMuscle-17", "bMuscle-37"],
  calves: [
    "muscle-14",
    // FIX: removed invalid "muscle-" entry
    "bMuscle-9",
    "bMuscle-10",
    "muscle-36",
    "bMuscle-24",
    "bMuscle-23",
  ],
  serratusAnterior: ["muscle-7", "muscle-29"],
};

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  abdominals: "Abdominals",
  obliques: "Obliques",
  lowerBack: "Lower Back",
  glutes: "Glutes",
  quadriceps: "Quadriceps",
  hamstrings: "Hamstrings",
  calves: "Calves",
  serratusAnterior: "Serratus Anterior",
};

function getMuscleGroupByPathId(pathId: string): MuscleGroup | undefined {
  return (Object.keys(MUSCLE_MAP) as MuscleGroup[]).find((group) => MUSCLE_MAP[group].includes(pathId));
}

const MuscleMapSelector: React.FC<{
  value: MuscleGroup[];
  onChange: (muscles: MuscleGroup[]) => void;
}> = ({ value, onChange }) => {
  function getHighlightedSvg(svg: string) {
    let highlightedSvg = svg;
    Object.entries(MUSCLE_MAP).forEach(([group, ids]) => {
      if (value.includes(group as MuscleGroup)) {
        ids.forEach((id) => {
          const regex = new RegExp(`<path([^>]*\\bid=['"]${id}['"][^>]*)fill=['"][^'"]*['"]([^>]*)>`, "g");
          highlightedSvg = highlightedSvg.replace(
            regex,
            `<path$1fill="#e53935"$2 style="filter: drop-shadow(0 0 8px #e53935);">`
          );
        });
      }
    });
    return highlightedSvg;
  }

  function handleSvgClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as Element;
    if (target && target.tagName.toLowerCase() === "path") {
      const pathId = (target as SVGPathElement).id;
      if (pathId) {
        const group = getMuscleGroupByPathId(pathId);
        if (group) {
          onChange(value.includes(group) ? value.filter((g) => g !== group) : [...value, group]);
        }
      }
    }
  }

  function renderButtons() {
    return (
      <div className="muscle-tabs-wrapper">
        {(Object.keys(MUSCLE_MAP) as MuscleGroup[]).map((group) => (
          <button
            key={group}
            className={`muscle-tab-btn${value.includes(group) ? " selected" : ""}`}
            onClick={() => onChange(value.includes(group) ? value.filter((g) => g !== group) : [...value, group])}
            type="button"
          >
            {MUSCLE_LABELS[group]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="muscle-maps-responsive">
        <div className="muscle-map-side">
          <div className="muscle-map-label">Front</div>
          <div
            className="muscle-svg-wrapper"
            onClick={handleSvgClick}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: getHighlightedSvg(manFrontSvg) }}
          />
        </div>
        <div className="muscle-map-side">
          <div className="muscle-map-label">Back</div>
          <div
            className="muscle-svg-wrapper"
            onClick={handleSvgClick}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: getHighlightedSvg(manBackSvg) }}
          />
        </div>
      </div>
      {renderButtons()}
      <div className="muscle-selected-label">
        <strong>Selected:</strong> {value.length ? value.map((g) => MUSCLE_LABELS[g]).join(", ") : "None"}
      </div>
    </div>
  );
};
// --- End MuscleMapSelector ---

const isBrowser = typeof window !== "undefined";
const getTextColor = () => {
  if (!isBrowser) return "#111";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "#fff" : "#111";
};

const getGlowColor = (gender: string) =>
  gender === "female"
    ? "0 0 24px 8px #ff69b4, 0 0 48px 16px #ffb6e6, 0 0 12px 2px #fff"
    : "0 0 24px 8px #2196f3, 0 0 48px 16px #90caf9, 0 0 12px 2px #fff";

const steps = ["Gender", "Age", "Goal", "Level", "Equipment", "Muscles", "Summary"] as const;

const genderImages = [
  { value: "male", src: "/images/male_selection.webp", label: "Male" },
  { value: "female", src: "/images/female_selection.webp", label: "Female" },
] as const;

const goalImages = [
  {
    value: "buildmuscle",
    label: "Build Muscle",
    src: {
      male: "/images/buildmuscle_men.webp",
      female: "/images/buildmuscle_women.webp",
    },
  },
  {
    value: "endurance",
    label: "Endurance",
    src: {
      male: "/images/endurance_male.webp",
      female: "/images/endurance_female.webp",
    },
  },
  {
    value: "getfitter",
    label: "Get Fitter",
    src: {
      male: "/images/getfitter_male.webp",
      female: "/images/getfitter_female.webp",
    },
  },
  {
    value: "weightloss",
    label: "Weight Loss",
    src: {
      male: "/images/losefat_male.webp",
      female: "/images/losefat_female.webp",
    },
  },
] as const;

const levelImages = [
  {
    value: "beginner",
    label: "Beginner",
    src: {
      male: "/images/beginner_male.webp",
      female: "/images/beginner_female.webp",
    },
  },
  {
    value: "intermediate",
    label: "Intermediate",
    src: {
      male: "/images/Intermediate_male.webp",
      female: "/images/Intermediate_female.webp",
    },
  },
  {
    value: "advanced",
    label: "Advanced",
    src: {
      male: "/images/Advanced_male.webp",
      female: "/images/Advanced_female.webp",
    },
  },
] as const;

const equipmentImages = [
  { value: "bodyweight", src: "/images/noequipment.webp", label: "Bodyweight" },
  { value: "barbell", src: "/images/barbell.webp", label: "Barbell" },
  { value: "bench", src: "/images/bench.webp", label: "Bench" },
  { value: "dumbbells", src: "/images/dumbbells.webp", label: "Dumbbells" },
  { value: "kettlebell", src: "/images/kettlebell.webp", label: "Kettlebell" },
  { value: "pullupbar", src: "/images/Pull-up Bar.webp", label: "Pull-up Bar" },
  { value: "resistancebands", src: "/images/resistance Bands.webp", label: "Resistance Bands" },
] as const;

const WorkoutGenerator: React.FC = () => {
  // Background image + overlay (SSR-safe in useEffect)
  useEffect(() => {
    if (!isBrowser || !document?.body) return;
    const bgId = "workout-generator-bg";
    const overlayId = "workout-generator-bg-overlay";
    let bgDiv = document.getElementById(bgId) as HTMLDivElement | null;
    let overlayDiv = document.getElementById(overlayId) as HTMLDivElement | null;

    if (!bgDiv) {
      bgDiv = document.createElement("div");
      bgDiv.id = bgId;
      Object.assign(bgDiv.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "0",
        backgroundImage: "url('/images/workout_office_2.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      });
      document.body.appendChild(bgDiv);
    }
    if (!overlayDiv) {
      overlayDiv = document.createElement("div");
      overlayDiv.id = overlayId;
      Object.assign(overlayDiv.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "1",
        background: "rgba(0,0,0,0.22)",
        pointerEvents: "none",
      });
      document.body.appendChild(overlayDiv);
    }
    return () => {
      const bg = document.getElementById(bgId);
      if (bg) bg.remove();
      const ov = document.getElementById(overlayId);
      if (ov) ov.remove();
    };
  }, []);

  const { user, isLoading } = useAuth();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const navigate = useNavigate();

  // Handler voor Save in planner
  const handleSaveToPlanner = () => {
    if (!workout.length) return;
    const plannerAddWorkout = {
      name: `Generated Workout (${goal || "Custom"})`,
      description: "",
      trainingType: goal || "Other",
      hero_image_url: "",
      tags: [] as string[],
      exercises: workout,
      duration: 0,
    };
    navigate("/modules/workout/planner", { state: { plannerAddWorkout } });
  };

  // Save workout handler
  const handleSaveWorkout = async () => {
    if (!workout.length) return;
    if (isLoading) {
      // eslint-disable-next-line no-alert
      alert("Checking login status, please wait...");
      return;
    }
    if (!user) {
      // eslint-disable-next-line no-alert
      alert("You must be logged in to save workouts.");
      setSaveStatus("idle");
      return;
    }
    setSaveStatus("saving");
    const workoutName = `Generated Workout (${goal || "Custom"})`;
    const meta = { gender, age, goal, level, equipment, muscles };
    try {
      await saveGeneratorWorkout({
        name: workoutName,
        exercises: workout,
        meta,
        user_id: (user as any).id ?? user, // fallback if context supplies id directly
      });
      setSaveStatus("saved");
    } catch (_e) {
      // eslint-disable-next-line no-alert
      alert("Failed to save workout.");
      setSaveStatus("idle");
    }
  };

  const [step, setStep] = useState(0);
  const prevStepRef = useRef(0);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [age, setAge] = useState<number>(25);
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [workout, setWorkout] = useState<Exercise[]>([]);
  const [hasTriedGenerate, setHasTriedGenerate] = useState(false);
  const workoutListRef = useRef<HTMLDivElement | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState<boolean>(true);

  // Fetch all exercises on mount
  useEffect(() => {
    let mounted = true;
    setLoadingExercises(true);
    const fetchAllExercises = async () => {
      let all: Exercise[] = [];
      let page = 1;
      const pageSize = 500;
      let keepGoing = true;
      try {
        while (keepGoing) {
          const result = await (ExerciseService as any).getExercises?.({ page, pageSize });
          const exercises: Exercise[] = result?.exercises ?? [];
          all = all.concat(exercises);
          if (exercises.length < pageSize) {
            keepGoing = false;
          } else {
            page++;
          }
        }
        if (mounted) setAllExercises(all);
      } catch {
        if (mounted) setAllExercises([]);
      } finally {
        if (mounted) setLoadingExercises(false);
      }
    };
    fetchAllExercises();
    return () => {
      mounted = false;
    };
  }, []);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const handleEquipmentClick = (value: string) => {
    setEquipment((prev) => (prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]));
  };

  // Main workout generation logic
  const generateWorkout = () => {
    // 1. Filter by selected muscles (primary or secondary)
    let filtered = allExercises.filter((ex) => {
      const primary = (ex as any).primary_muscles as string[] | undefined;
      const secondary = (ex as any).secondary_muscles as string[] | undefined;
      return muscles.some(
        (muscle) => primary?.includes(muscle) || secondary?.includes(muscle)
      );
    });

    // 2. Filter by selected equipment (if any)
    if (equipment.length > 0) {
      filtered = filtered.filter((ex) => {
        const eq = (ex as any).equipment as string[] | undefined;
        return Array.isArray(eq) && eq.some((e) => equipment.includes(e));
      });
    }

    // 3. Filter by difficulty/level (if selected)
    if (level) {
      filtered = filtered.filter((ex) => (ex as any).difficulty === level);
    }

    // 4. Filter by goal/category (simple heuristic)
    if (goal) {
      filtered = filtered.filter((ex) => {
        const cat = ((ex as any).category || "").toString().toLowerCase();
        if (goal === "buildmuscle") return cat === "strength";
        // other goals allow cardio/endurance/strength
        return cat === "cardio" || cat === "endurance" || cat === "strength";
      });
    }

    // 5. Shuffle and pick up to 6
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(6, shuffled.length));
    setWorkout(selected);

    // Scroll to workout list
    setTimeout(() => {
      if (workoutListRef.current) {
        workoutListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 200);
  };

  const nextStep = () => {
    setStep((s) => {
      const next = Math.min(s + 1, steps.length - 1);
      prevStepRef.current = s;
      return next;
    });
  };
  const prevStep = () => {
    setStep((s) => {
      const prev = Math.max(s - 1, 0);
      prevStepRef.current = s;
      return prev;
    });
  };

  // Scroll to top on step change
  useEffect(() => {
    scrollToTop("smooth");
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <div className="onboarding-instruction">Select your gender to personalize your workout plan.</div>
            <div className="image-grid tall">
              {genderImages.map((img) => (
                <button
                  key={img.value}
                  className={`img-btn tall${gender === img.value ? " selected" : ""}`}
                  style={{
                    boxShadow: gender === img.value ? getGlowColor(img.value) : "0 0 0 2px #888",
                  }}
                  onClick={() => setGender(img.value)}
                  aria-label={img.label}
                  type="button"
                >
                  <img src={img.src} alt={img.label} />
                  <span className="img-label">{img.label}</span>
                </button>
              ))}
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="onboarding-instruction">How old are you? Use the slider to select your age.</div>
            <div className="age-slider-step">
              <input
                type="range"
                min={12}
                max={80}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="age-slider"
                style={{ accentColor: gender === "female" ? "#ff69b4" : "#2196f3" }}
              />
              <div className="age-slider-value age-slider-value-white">{age} years</div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="onboarding-instruction">What is your main fitness goal?</div>
            <div className="image-grid tall">
              {goalImages.map((img) => (
                <button
                  key={img.value}
                  className={`img-btn tall${goal === img.value ? " selected" : ""}`}
                  style={{
                    boxShadow: goal === img.value ? getGlowColor(gender ?? "male") : "0 0 0 2px #888",
                  }}
                  onClick={() => setGoal(img.value)}
                  aria-label={img.label}
                  type="button"
                >
                  <img src={img.src[gender ?? "male"]} alt={img.label} />
                  <span className="img-label">{img.label}</span>
                </button>
              ))}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="onboarding-instruction">Choose your current fitness level.</div>
            <div className="image-grid tall">
              {levelImages.map((img) => (
                <button
                  key={img.value}
                  className={`img-btn tall${level === img.value ? " selected" : ""}`}
                  style={{
                    boxShadow: level === img.value ? getGlowColor(gender ?? "male") : "0 0 0 2px #888",
                  }}
                  onClick={() => setLevel(img.value)}
                  aria-label={img.label}
                  type="button"
                >
                  <img src={img.src[gender ?? "male"]} alt={img.label} />
                  <span className="img-label">{img.label}</span>
                </button>
              ))}
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="onboarding-instruction">Select all equipment you have access to.</div>
            <div className="image-grid equipment">
              {equipmentImages.map((img) => (
                <button
                  key={img.value}
                  className={`img-btn equipment${equipment.includes(img.value) ? " selected" : ""}`}
                  style={{
                    boxShadow: equipment.includes(img.value)
                      ? getGlowColor(gender ?? "male")
                      : "0 0 0 2px #888",
                  }}
                  onClick={() => handleEquipmentClick(img.value)}
                  aria-label={img.label}
                  type="button"
                >
                  <img src={img.src} alt={img.label} />
                  <span className="img-label equipment">{img.label}</span>
                </button>
              ))}
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div className="onboarding-instruction">Select the muscle groups you want to focus on.</div>
            <div className="muscle-step">
              <MuscleMapSelector value={muscles} onChange={setMuscles} />
            </div>
          </>
        );
      case 6: {
        // --- MuscleMapPreview for summary ---
        const MuscleMapPreview = ({ selected }: { selected: MuscleGroup[] }) => {
          function getHighlightedSvg(svg: string) {
            let highlightedSvg = svg;
            Object.entries(MUSCLE_MAP).forEach(([group, ids]) => {
              if (selected.includes(group as MuscleGroup)) {
                ids.forEach((id) => {
                  const regex = new RegExp(
                    `<path([^>]*\\bid=['"]${id}['"][^>]*)fill=['"][^'"]*['"]([^>]*)>`,
                    "g"
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
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-end",
                gap: 40,
                marginBottom: 24,
                width: "100%",
              }}
            >
              <div
                style={{ maxWidth: 160, width: "100%", display: "flex", justifyContent: "center" }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: getHighlightedSvg(manFrontSvg) }}
              />
              <div
                style={{ maxWidth: 160, width: "100%", display: "flex", justifyContent: "center" }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: getHighlightedSvg(manBackSvg) }}
              />
            </div>
          );
        };
        return (
          <div className="summary-step">
            <h2>Summary</h2>
            <MuscleMapPreview selected={muscles} />
            <ul>
              <li>
                <b>Gender:</b> {gender}
              </li>
              <li>
                <b>Age:</b> {age}
              </li>
              <li>
                <b>Goal:</b> {goal}
              </li>
              <li>
                <b>Level:</b> {level}
              </li>
              <li>
                <b>Equipment:</b> {equipment.join(", ")}
              </li>
              <li>
                <b>Muscles:</b> {muscles.map((g) => MUSCLE_LABELS[g]).join(", ")}
              </li>
            </ul>
            <button
              className="primary-btn animated-generate"
              onClick={() => {
                setHasTriedGenerate(true);
                generateWorkout();
              }}
              type="button"
            >
              Generate Workout
            </button>

            {/* Loading state for exercises */}
            {loadingExercises ? (
              <div
                style={{
                  marginTop: 32,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 20,
                  textAlign: "center",
                }}
              >
                Loading exercises...
              </div>
            ) : workout.length > 0 ? (
              <>
                <div ref={workoutListRef} style={{ marginTop: 32, width: "100%" }}>
                  <h3 style={{ marginBottom: 12 }}>Generated Workout</h3>
                  <ol
                    style={{
                      textAlign: "left",
                      maxWidth: 900,
                      margin: "0 auto",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      gap: 32,
                    }}
                  >
                    {workout.map((ex) => (
                      <li
                        key={(ex as any).id ?? `${(ex as any).name}-${(ex as any).youtube_id ?? ""}`}
                        style={{
                          background: "rgba(34, 40, 52, 0.45)",
                          borderRadius: 22,
                          padding: 28,
                          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minHeight: 340,
                          position: "relative",
                          overflow: "hidden",
                          transition: "box-shadow 0.2s",
                          border: "1.5px solid rgba(255,255,255,0.18)",
                          backdropFilter: "blur(14px) saturate(160%)",
                          WebkitBackdropFilter: "blur(14px) saturate(160%)",
                        }}
                      >
                        {(ex as any).image_url ? (
                          <img
                            src={(ex as any).image_url}
                            alt={(ex as any).name}
                            style={{
                              width: 200,
                              height: 200,
                              objectFit: "cover",
                              borderRadius: 14,
                              background: "#111",
                              marginBottom: 18,
                              border: "3px solid #444",
                              boxShadow: "0 2px 16px #0006",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 200,
                              height: 200,
                              borderRadius: 14,
                              background: "linear-gradient(135deg,#222 60%,#444 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#888",
                              fontSize: 64,
                              marginBottom: 18,
                              border: "3px solid #444",
                              boxShadow: "0 2px 16px #0006",
                            }}
                          >
                            <span role="img" aria-label="No image">
                              🏋️
                            </span>
                          </div>
                        )}
                        <b style={{ fontSize: 22, marginBottom: 4 }}>{(ex as any).name}</b>
                        <span style={{ fontSize: 15, color: "#aaa", marginBottom: 8 }}>
                          ({(ex as any).difficulty})
                        </span>
                        <div style={{ fontSize: 16, color: "#eee", marginBottom: 6, textAlign: "center" }}>
                          <span>{((ex as any).primary_muscles ?? []).join(", ")}</span>
                          {((ex as any).secondary_muscles ?? []).length ? (
                            <span style={{ color: "#aaa" }}>
                              {" "}
                              | {((ex as any).secondary_muscles ?? []).join(", ")}
                            </span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: 15, color: "#b3e5fc", marginBottom: 2 }}>
                          Equipment: {((ex as any).equipment ?? []).join(", ")}
                        </div>
                        <div style={{ fontSize: 15, color: "#b9f6ca", marginBottom: 2 }}>
                          Sets: {(ex as any).recommended_sets ?? 3} &nbsp; Reps:{" "}
                          {(ex as any).recommended_reps ?? "8-12"}
                        </div>
                        {(ex as any).youtube_id && (
                          <div style={{ marginTop: 10 }}>
                            <a
                              href={`https://youtube.com/watch?v=${(ex as any).youtube_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#4f8cff", fontSize: 15, textDecoration: "underline" }}
                            >
                              Video Demo
                            </a>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
                {/* Save Workout Button - below the generated workout */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 32,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <button
                    className="primary-btn"
                    style={{
                      fontSize: "1.2rem",
                      padding: "0.7em 2.8em",
                      borderRadius: 16,
                      margin: "0 auto",
                      background: "linear-gradient(90deg,#4f8cff 0%,#6ee7b7 100%)",
                      fontWeight: 800,
                      boxShadow: "0 2px 16px #0003",
                      opacity: saveStatus === "saved" ? 0.7 : 1,
                      pointerEvents: saveStatus === "saving" ? "none" : "auto",
                    }}
                    onClick={handleSaveWorkout}
                    disabled={saveStatus === "saving" || saveStatus === "saved"}
                    type="button"
                  >
                    {saveStatus === "idle" && "Save Workout"}
                    {saveStatus === "saving" && "Saving..."}
                    {saveStatus === "saved" && "Saved!"}
                  </button>
                  <button
                    className="primary-btn"
                    style={{
                      fontSize: "1.2rem",
                      padding: "0.7em 2.8em",
                      borderRadius: 16,
                      margin: "0 auto",
                      background: "linear-gradient(90deg,#00eaff 0%,#39ff14 100%)",
                      fontWeight: 800,
                      boxShadow: "0 2px 16px #0003",
                      color: "#222",
                      border: "none",
                      transition: "background 0.2s",
                    }}
                    onClick={handleSaveToPlanner}
                    type="button"
                  >
                    Save in planner
                  </button>
                  {saveStatus === "saved" && (
                    <div style={{ color: "#b9f6ca", fontWeight: 600, marginTop: 8 }}>
                      Workout saved to My Workouts
                    </div>
                  )}
                </div>
              </>
            ) : hasTriedGenerate ? (
              <div
                style={{
                  marginTop: 32,
                  color: "#ffb6b6",
                  fontWeight: 600,
                  fontSize: 20,
                  textAlign: "center",
                }}
              >
                <span>
                  No exercises found for your selection.
                  <br />
                  Try adjusting your equipment, level, or muscle choices.
                </span>
              </div>
            ) : null}
            <button className="secondary-btn summary-back-btn" onClick={prevStep} style={{ marginTop: 16 }} type="button">
              Back
            </button>
            <style>{`
              .animated-generate {
                background: linear-gradient(90deg, #4f8cff, #6ee7b7, #4f8cff);
                background-size: 200% 200%;
                animation: glow 2s linear infinite;
                box-shadow: 0 4px 20px rgba(79,140,255,0.2);
                transition: transform 0.2s;
              }
              @keyframes glow {
                0% { box-shadow: 0 0 8px #4f8cff, 0 0 16px #6ee7b7; }
                50% { box-shadow: 0 0 24px #4f8cff, 0 0 32px #6ee7b7; }
                100% { box-shadow: 0 0 8px #4f8cff, 0 0 16px #6ee7b7; }
              }
              .animated-generate:active { transform: scale(0.97); }
            `}</style>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const canContinue = () => {
    switch (step) {
      case 0:
        return !!gender;
      case 1:
        return !!age && age >= 12 && age <= 80;
      case 2:
        return !!goal;
      case 3:
        return !!level;
      case 4:
        return equipment.length > 0;
      case 5:
        return muscles.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="onboarding-root" style={{ zIndex: 10, position: "relative" }}>
      {/* Hero image with overlay text */}
      <div className="hero-image-container">
        <img src="/images/onboarding.webp" alt="Onboarding" className="hero-image" />
        <div className="hero-overlay">
          <span>Onboarding</span>
        </div>
      </div>

      {/* Everything below hero image gets background image */}
      <div className="onboarding-bg-wrapper">
        {/* Progress bar */}
        <div className="progress-bar-outer" style={{ position: "relative" }}>
          <div
            className="progress-bar-inner"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #2196f3 0%, #ff69b4 100%)",
            }}
          />
          {/* Percentage label */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#fff",
              textShadow: "0 2px 8px #000a",
              fontSize: 14,
              pointerEvents: "none",
              letterSpacing: 1,
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>
        <div className="step-label" style={{ color: getTextColor() }}>
          Step {step + 1} of {steps.length}: {steps[step]}
        </div>

        {/* Step content */}
        <div className="step-content">{renderStep()}</div>
      </div>

      {/* Navigation (not shown on summary step) */}
      {step < steps.length - 1 && (
        <div className="nav-btns">
          {step > 0 && (
            <button className="secondary-btn" onClick={prevStep} type="button">
              Back
            </button>
          )}
          {step < steps.length - 2 && (
            <button className="primary-btn" onClick={nextStep} disabled={!canContinue()} type="button">
              Next
            </button>
          )}
          {step === steps.length - 2 && (
            <button
              className="primary-btn"
              onClick={nextStep}
              disabled={!canContinue()}
              style={{
                background:
                  gender === "female"
                    ? "linear-gradient(90deg,#ff69b4 0%,#ffb6e6 100%)"
                    : "linear-gradient(90deg,#2196f3 0%,#90caf9 100%)",
                fontWeight: 800,
                fontSize: "1.3rem",
              }}
              type="button"
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* Styles */}
      <style>{`
        /* Only force white text for onboarding instructions, muscle tabs, and labels, not for nav buttons */
        .onboarding-instruction {
          color: #fff !important;
          background: linear-gradient(90deg, #222b, #444b);
        }
        .muscle-tabs-wrapper { color: #fff !important; }
        .muscle-tab-btn { color: #fff !important; background: #222 !important; border-color: #444 !important; }
        .muscle-tab-btn.selected {
          background: linear-gradient(90deg, #ff69b4 0%, #2196f3 100%) !important;
          color: #fff !important;
          border-color: #ff69b4 !important;
        }
        .muscle-map-label { color: #fff !important; }
        .muscle-selected-label { color: #fff !important; }

        .muscle-selected-label {
          margin-top: 16px;
          text-align: center;
          color: #222;
          font-size: 1.08rem;
        }
        @media (prefers-color-scheme: dark) { .muscle-selected-label { color: #eee; } }

        .muscle-tabs-wrapper {
          display: flex; flex-wrap: wrap; justify-content: center; align-items: center;
          gap: 10px 12px; margin: 18px auto 8px auto; width: 100%; max-width: 900px; padding: 0 4vw; box-sizing: border-box;
        }
        @media (max-width: 700px) { .muscle-tabs-wrapper { gap: 8px 6px; max-width: 100vw; padding: 0 2vw; } }
        @media (max-width: 480px) { .muscle-tabs-wrapper { gap: 6px 2px; padding: 0 1vw; } }

        .muscle-maps-responsive { display: flex; flex-direction: row; justify-content: center; align-items: flex-end; gap: 24px; margin-bottom: 16px; width: 100%; max-width: 420px; margin-left: auto; margin-right: auto; }
        .muscle-map-side { text-align: center; flex: 1 1 0; min-width: 0; }
        .muscle-svg-wrapper { width: 100%; max-width: 100%; min-width: 0; margin: 0 auto; cursor: pointer; user-select: none; display: block; }
        @media (max-width: 700px) { .muscle-svg-wrapper { width: 100%; max-width: 100%; min-width: 0; margin: 0 0; } }
        @media (max-width: 480px) { .muscle-svg-wrapper { width: 100%; max-width: 100%; min-width: 0; margin: 0 0; } }
        @media (max-width: 700px) { .muscle-maps-responsive { gap: 1vw; max-width: 98vw; } }
        @media (max-width: 480px) { .muscle-maps-responsive { gap: 0.4vw; max-width: 98vw; } }

        .muscle-tab-btn {
          padding: 8px 18px; border-radius: 8px; border: 2px solid #bbb; background: #f8f8f8; color: #222;
          font-weight: 700; font-size: 1.08rem; cursor: pointer; transition: background 0.2s, color 0.2s, border 0.2s; margin-bottom: 4px; box-shadow: 0 1px 6px #0001;
        }
        .muscle-tab-btn.selected { background: linear-gradient(90deg, #ff69b4 0%, #2196f3 100%); color: #fff; border-color: #ff69b4; box-shadow: 0 2px 12px #ff69b488; }
        @media (max-width: 700px) { .muscle-tab-btn { font-size: 0.98rem; padding: 7px 10px; } }
        @media (max-width: 480px) { .muscle-tab-btn { font-size: 0.92rem; padding: 6px 6px; } }

        .muscle-map-label { font-weight: 600; margin-bottom: 8px; color: #222; font-size: 1.1rem; }
        @media (prefers-color-scheme: dark) {
          .muscle-tab-btn { background: #222; color: #eee; border-color: #444; }
          .muscle-tab-btn.selected { background: linear-gradient(90deg, #ff69b4 0%, #2196f3 100%); color: #fff; border-color: #ff69b4; }
          .muscle-map-label { color: #eee; }
        }

        .onboarding-instruction {
          font-size: 1.25rem; font-weight: 700; margin-bottom: 18px; text-align: center;
          color: var(--onboarding-text-light); background: linear-gradient(90deg, #fff8, #eee8);
          border-radius: 10px; padding: 0.7em 1.2em; box-shadow: 0 2px 12px #0001; transition: color 0.2s, background 0.2s;
        }
        @media (prefers-color-scheme: dark) {
          .onboarding-instruction { color: var(--onboarding-text-dark); background: linear-gradient(90deg, #222b, #444b); }
        }

        .onboarding-bg-wrapper { position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; max-width: 100vw; overflow-x: hidden; box-sizing: border-box; z-index: 0; }
        .onboarding-bg-wrapper > * { position: relative; z-index: 1; }
        .onboarding-bg-wrapper:before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10,10,20,0.72); z-index: 0; }
        .summary-step, .summary-step * { color: #fff !important; }
        .summary-step { display: flex; flex-direction: column; align-items: center; }

        .nav-btns { display: flex; justify-content: center; gap: 16px; margin: 40px 0 0 0; position: static; background: none; }
        .summary-back-btn {
          min-width: 160px; background: #fff !important; color: #222 !important; font-weight: 700; font-size: 1.1rem;
          border: 2px solid #fff3; box-shadow: 0 2px 12px #0003; transition: background 0.2s, color 0.2s; margin: 32px auto 0 auto; display: block; position: static;
        }
        .summary-back-btn:hover { background: #f3f3f3 !important; color: #111 !important; }

        .onboarding-bg-wrapper {
          position: relative; min-height: calc(100vh - 220px); width: 100vw; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw;
          max-width: 100vw; overflow-x: hidden; box-sizing: border-box; padding-bottom: 0;
        }

        :root { --onboarding-text-light: #111; --onboarding-text-dark: #fff; }
        .onboarding-root { max-width: 700px; margin: 0 auto; padding: 0 0 48px 0; font-family: 'Inter', Arial, sans-serif; overflow-x: hidden; }

        .hero-image-container { position: relative; width: 100vw; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; max-width: 100vw; overflow: hidden; height: 220px; }
        .hero-image { width: 100vw; height: 220px; object-fit: cover; object-position: top; display: block; background: transparent; }
        .hero-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .hero-overlay span { font-size: 2.8rem; font-weight: 800; color: #fff; letter-spacing: 0.1em; background: none; border-radius: 12px; padding: 0.2em 1.2em; }

        .progress-bar-outer { width: 100%; height: 18px; background: #2222; border-radius: 12px; margin: 24px 0 8px 0; overflow: hidden; box-shadow: 0 2px 12px #0002; }
        .progress-bar-inner { height: 100%; border-radius: 12px; background: linear-gradient(90deg, #2196f3 0%, #ff69b4 100%); transition: width 0.6s cubic-bezier(.4,2,.6,1); }
        .step-label { text-align: center; font-size: 1.1rem; font-weight: 600; margin-bottom: 18px; }
        .step-content { margin: 0 auto 24px auto; min-height: 260px; display: flex; flex-direction: column; align-items: center; }

        .image-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px 24px; width: 100%; justify-items: center; }
        .image-grid.tall { gap: 40px 24px; }
        .image-grid.equipment { grid-template-columns: repeat(2, 1fr); gap: 32px 24px; }

        .img-btn {
          border: 3px solid #888; border-radius: 18px; margin: 0; padding: 0; background: transparent; overflow: hidden;
          width: 220px; height: 220px; position: relative; transition: box-shadow 0.3s, border-color 0.3s; display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .img-btn.tall { height: 440px; }
        .img-btn.equipment { height: 420px; max-height: 40vw; min-height: 220px; }
        @media (max-width: 900px) {
          .img-btn.equipment { height: 60vw; min-height: 180px; max-height: 420px; }
        }
        .img-btn.selected { border-color: transparent; animation: glowPulse 1.2s infinite alternate; }
        @keyframes glowPulse { 0% { filter: drop-shadow(0 0 0 #fff); } 100% { filter: drop-shadow(0 0 24px #ff69b4aa); } }

        .img-btn img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 0; border: none; margin: 0; display: block; background: transparent; }

        .img-label {
          font-size: 1.25rem; font-weight: 700; color: #fff; margin-top: 0; background: linear-gradient(90deg, #222 60%, #444 100%);
          width: 100%; text-align: center; padding: 0.5em 0; border-top: 2px solid #fff3; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; text-shadow: 0 2px 8px #000, 0 0 2px #fff; letter-spacing: 0.04em;
        }
        .img-label.equipment {
          font-size: 1.2rem; padding: 0.6em 0; background: rgba(20, 20, 30, 0.55) !important;
          backdrop-filter: blur(8px) saturate(160%); -webkit-backdrop-filter: blur(8px) saturate(160%); box-shadow: 0 2px 12px #0004;
        }

        .age-slider-step { width: 100%; display: flex; flex-direction: column; align-items: center; }
        .age-slider { width: 80%; margin: 32px 0 12px 0; height: 8px; }
        .age-slider-value { font-size: 2.2rem; font-weight: 700; margin-top: 0; }
        .age-slider-value-white { color: #fff !important; text-shadow: 0 2px 8px #000a; }

        .muscle-step { width: 100%; display: flex; flex-direction: column; align-items: center; }
        .summary-step { width: 100%; text-align: center; }
        .summary-step ul { list-style: none; padding: 0; margin: 0 0 18px 0; }
        .summary-step li { font-size: 1.1rem; margin-bottom: 6px; color: ${getTextColor()}; }

        .primary-btn, .secondary-btn {
          font-size: 1.3rem; font-weight: 800; border: none; border-radius: 12px; padding: 0.7em 2.2em; margin: 0 8px; cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s; box-shadow: 0 2px 16px #0003; position: relative; z-index: 2;
        }
        .primary-btn {
          background: ${
            (typeof gender !== "string" || gender === null)
              ? "linear-gradient(90deg,#2196f3 0%,#90caf9 100%)"
              : gender === "female"
                ? "linear-gradient(90deg,#ff69b4 0%,#ffb6e6 100%)"
                : "linear-gradient(90deg,#2196f3 0%,#90caf9 100%)"
          };
          color: #fff;
        }
        .primary-btn:disabled { background: #aaa; color: #fff; cursor: not-allowed; }
        .secondary-btn { background: #fff; color: #222; border: 2px solid #888; }
        .secondary-btn:hover, .primary-btn:hover { filter: brightness(1.08); box-shadow: 0 4px 24px #0005; }

        .nav-btns { display: flex; justify-content: center; gap: 18px; margin-top: 18px; position: relative; z-index: 2; }

        @media (max-width: 900px) {
          .onboarding-root { max-width: 100vw; padding: 0; }
          .hero-image-container, .hero-image { height: 120px; }
          .img-btn, .img-btn.tall { width: 44vw; max-width: 220px; }
          .img-btn.tall { height: 88vw; max-height: 440px; }
          .img-btn.equipment { height: 38vw; min-height: 120px; max-height: 240px; }
          .image-grid { gap: 18px 8px; }
        }
      `}</style>
    </div>
  );
};

export default WorkoutGenerator;

