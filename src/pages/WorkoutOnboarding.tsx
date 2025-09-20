import React, { useState } from "react";

const heroImg = "/images/onboarding.webp";
const maleImg = "/images/male_selection.webp";
const femaleImg = "/images/female_selection.webp";

const levelImages = {
  male: [
    { key: "beginner", label: "Beginner", img: "/images/beginner_male.webp" },
    { key: "intermediate", label: "Intermediate", img: "/images/Intermediate_male.webp" },
    { key: "advanced", label: "Advanced", img: "/images/Advanced_male.webp" },
    { key: "athlete", label: "Athlete", img: "/images/Athlete_male.webp" }
  ],
  female: [
    { key: "beginner", label: "Beginner", img: "/images/beginner_female.webp" },
    { key: "intermediate", label: "Intermediate", img: "/images/Intermediate_female.webp" },
    { key: "advanced", label: "Advanced", img: "/images/Advanced_female.webp" },
    { key: "athlete", label: "Athlete", img: "/images/Athlete_female.webp" }
  ]
};

const equipmentOptions = [
  { key: "dumbbells", label: "Dumbbells", img: "/images/dumbbells.webp" },
  { key: "barbell", label: "Barbell", img: "/images/barbell.webp" },
  { key: "kettlebell", label: "Kettlebell", img: "/images/kettlebell.webp" },
  { key: "bands", label: "Resistance Bands", img: "/images/resistance Bands.webp" },
  { key: "pullup", label: "Pull-up Bar", img: "/images/Pull-up Bar.webp" },
  { key: "bench", label: "Bench", img: "/images/bench.webp" },
  { key: "bodyweight", label: "Bodyweight", img: "/images/noequipment.webp" }
];

const steps = [
  { key: "gender", label: "Gender" },
  { key: "age", label: "Age" },
  { key: "goal", label: "Goal" },
  { key: "level", label: "Level" },
  { key: "equipment", label: "Equipment" },
  { key: "muscles", label: "Muscle Selection" }
];

const goals = [
  { key: "lose", label: "Lose Weight", img: "/images/losefat_male.webp", img_female: "/images/losefat_female.webp" },
  { key: "strength", label: "Gain Strength", img: "/images/buildmuscle_men.webp", img_female: "/images/buildmuscle_women.webp" },
  { key: "muscle", label: "Gain Muscle", img: "/images/buildmuscle_men.webp", img_female: "/images/buildmuscle_women.webp" },
  { key: "event", label: "Prep for Event", img: "/images/hero-1.webp", img_female: "/images/hero-1.webp" }
];

export default function WorkoutOnboarding() {
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState({
    gender: "",
    age: 18,
    goal: "",
    level: "",
    equipment: [] as string[],
    muscles: [] as string[]
  });

  const step = steps[stepIdx].key;
  const progress = ((stepIdx + 1) / steps.length) * 100;
  const levels = form.gender === "female" ? levelImages.female : levelImages.male;
  const goalImages = goals.map(g => ({ ...g, img: form.gender === "female" ? g.img_female : g.img }));

  // 2 by 2 grid
  const gridClass = "grid grid-cols-2 gap-8 w-full max-w-2xl mx-auto";

  const nextStep = () => setStepIdx(i => Math.min(i + 1, steps.length - 1));
  const prevStep = () => setStepIdx(i => Math.max(i - 1, 0));

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Hero */}
      <div className="relative w-full h-48 sm:h-64 md:h-72 flex items-center justify-center">
        <img
          src={heroImg}
          alt="Onboarding Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" style={{ zIndex: 2 }} />
        <h1
          className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg"
          style={{ zIndex: 3 }}
        >
          Onboarding
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto mt-6 mb-2 px-4">
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-300 mt-2">
          {steps.map((s, i) => (
            <span key={s.key} className={i === stepIdx ? "font-bold text-orange-400" : ""}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-4">
        {/* Gender */}
        {step === "gender" && (
          <div className={gridClass}>
            {[{ key: "male", label: "Male", img: maleImg }, { key: "female", label: "Female", img: femaleImg }].map((g) => (
              <button
                key={g.key}
                onClick={() => setForm((f) => ({ ...f, gender: g.key }))}
                className="flex flex-col items-center group transition-all"
                style={{ outline: "none" }}
              >
                <div
                  className={`transition-all duration-200 rounded-2xl w-full aspect-[3/4] flex items-center justify-center border-4 ${
                    form.gender === g.key
                      ? "border-orange-400 shadow-lg scale-105 animate-pulse"
                      : "border-gray-400"
                  }`}
                  style={{
                    overflow: "hidden",
                    boxSizing: "border-box",
                    marginBottom: 0
                  }}
                >
                  <img
                    src={g.img}
                    alt={g.label}
                    className="w-full h-full object-cover"
                    style={{ display: "block" }}
                  />
                </div>
                <div className="mt-3 text-lg sm:text-xl font-bold text-white text-center">{g.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Age */}
        {step === "age" && (
          <div className="flex flex-col items-center w-full max-w-xs mx-auto">
            <label className="text-white text-xl font-bold mb-4 text-center">How old are you?</label>
            <input
              type="range"
              min={12}
              max={100}
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))}
              className="w-full accent-orange-500"
            />
            <div className="text-3xl font-extrabold text-orange-400 mt-2">{form.age}</div>
          </div>
        )}

        {/* Goal */}
        {step === "goal" && (
          <div className={gridClass}>
            {goalImages.map((g) => (
              <button
                key={g.key}
                onClick={() => setForm((f) => ({ ...f, goal: g.key }))}
                className="flex flex-col items-center group transition-all"
                style={{ outline: "none" }}
              >
                <div
                  className={`transition-all duration-200 rounded-2xl w-full aspect-[3/4] flex items-center justify-center border-4 ${
                    form.goal === g.key
                      ? "border-orange-400 shadow-lg scale-105 animate-pulse"
                      : "border-gray-400"
                  }`}
                  style={{
                    overflow: "hidden",
                    boxSizing: "border-box",
                    marginBottom: 0
                  }}
                >
                  <img
                    src={g.img}
                    alt={g.label}
                    className="w-full h-full object-cover"
                    style={{ display: "block" }}
                  />
                </div>
                <div className="mt-3 text-lg sm:text-xl font-bold text-white text-center">{g.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Level */}
        {step === "level" && (
          <div className={gridClass}>
            {levels.map((l) => (
              <button
                key={l.key}
                onClick={() => setForm((f) => ({ ...f, level: l.key }))}
                className="flex flex-col items-center group transition-all"
                style={{ outline: "none" }}
              >
                <div
                  className={`transition-all duration-200 rounded-2xl w-full aspect-[3/4] flex items-center justify-center border-4 ${
                    form.level === l.key
                      ? "border-orange-400 shadow-lg scale-105 animate-pulse"
                      : "border-gray-400"
                  }`}
                  style={{
                    overflow: "hidden",
                    boxSizing: "border-box",
                    marginBottom: 0
                  }}
                >
                  <img
                    src={l.img}
                    alt={l.label}
                    className="w-full h-full object-cover"
                    style={{ display: "block" }}
                  />
                </div>
                <div className="mt-3 text-lg sm:text-xl font-bold text-white text-center">{l.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Equipment */}
        {step === "equipment" && (
          <div className={gridClass}>
            {equipmentOptions.map((eq) => (
              <button
                key={eq.key}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    equipment: f.equipment.includes(eq.key)
                      ? f.equipment.filter((k) => k !== eq.key)
                      : [...f.equipment, eq.key]
                  }))
                }
                className="flex flex-col items-center group transition-all"
                style={{ outline: "none" }}
              >
                <div
                  className={`transition-all duration-200 rounded-2xl w-full aspect-square flex items-center justify-center border-4 ${
                    form.equipment.includes(eq.key)
                      ? "border-orange-400 shadow-lg scale-105 animate-pulse"
                      : "border-gray-400"
                  }`}
                  style={{
                    overflow: "hidden",
                    boxSizing: "border-box",
                    marginBottom: 0,
                    background: "#222"
                  }}
                >
                  <img
                    src={eq.img}
                    alt={eq.label}
                    className="w-full h-full object-cover"
                    style={{ display: "block" }}
                  />
                </div>
                <div className="mt-3 text-lg sm:text-xl font-bold text-white text-center">{eq.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Muscles (placeholder) */}
        {step === "muscles" && (
          <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            <div className="text-white text-xl font-bold mb-4 text-center">Select the muscles you want to focus on</div>
            <div className="w-full h-64 bg-gray-700 rounded-2xl flex items-center justify-center text-white">
              {/* Replace with interactive SVG or image map */}
              <span>Muscle map coming soon...</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-row gap-4 mt-10 w-full max-w-md mx-auto">
          <button
            onClick={prevStep}
            disabled={stepIdx === 0}
            className={`flex-1 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 ${
              stepIdx === 0
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 dark:bg-gray-700 text-orange-500 hover:text-pink-500 hover:bg-gray-300 dark:hover:bg-gray-600 shadow"
            }`}
            style={{ fontSize: 18 }}
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={
              (step === "gender" && !form.gender) ||
              (step === "goal" && !form.goal) ||
              (step === "level" && !form.level) ||
              (step === "equipment" && form.equipment.length === 0)
            }
            className={`flex-1 py-3 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 ${
              ((step === "gender" && !form.gender) ||
                (step === "goal" && !form.goal) ||
                (step === "level" && !form.level) ||
                (step === "equipment" && form.equipment.length === 0))
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl animate-pulse"
            }`}
            style={{ fontSize: 18 }}
          >
            {step === "muscles" ? "Generate Workout" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
