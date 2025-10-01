// @ts-nocheck
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type {
  DifficultyLevel,
  EquipmentType,
  ForceType,
  MechanicsType,
  MuscleGroup,
  ExerciseDB,
} from "../../src/types/exercise.types";

dotenv.config();

const RAPID_API_HOST = "exercise-db-fitness-workout-gym.p.rapidapi.com";
const BASE_URL = `https://${RAPID_API_HOST}`;

const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.EXERCISEDB_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!rapidApiKey) {
  console.error("Missing RAPIDAPI_KEY or EXERCISEDB_API_KEY in environment. Please add it to your .env file.");
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. These are required for inserts/updates.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

type RapidExercise = {
  id: string;
  name: string;
  force?: string | null;
  level?: string | null;
  mechanic?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  category?: string | null;
  images?: string[];
};

const muscleMap: Record<string, MuscleGroup> = {
  abdominals: "abs",
  abductors: "glutes",
  adductors: "glutes",
  biceps: "biceps",
  calves: "calves",
  chest: "chest",
  forearms: "forearms",
  glutes: "glutes",
  hamstrings: "hamstrings",
  lats: "back",
  "lower back": "lower_back",
  "middle back": "back",
  neck: "shoulders",
  obliques: "obliques",
  quadriceps: "quadriceps",
  shoulders: "shoulders",
  traps: "back",
  triceps: "triceps",
  "upper back": "back",
};

const equipmentMap: Record<string, EquipmentType> = {
  "body only": "bodyweight",
  "body weight": "bodyweight",
  barbell: "barbell",
  dumbbell: "dumbbells",
  dumbbells: "dumbbells",
  kettlebell: "kettlebell",
  kettlebells: "kettlebell",
  cable: "cable_machine",
  band: "resistance_bands",
  bands: "resistance_bands",
  "resistance band": "resistance_bands",
  "resistance bands": "resistance_bands",
  machine: "cable_machine",
  "leverage machine": "cable_machine",
  "ez barbell": "barbell",
  "ez bar": "barbell",
  "e-z curl bar": "barbell",
  "smith machine": "cable_machine",
  bench: "bench",
  "exercise ball": "exercise_ball",
  "stability ball": "exercise_ball",
  "medicine ball": "medicine_ball",
  treadmill: "treadmill",
  bike: "stationary_bike",
  "stationary bike": "stationary_bike",
  "rowing machine": "rowing_machine",
  "pull-up bar": "pull_up_bar",
  "pullup bar": "pull_up_bar",
  "foam roll": "foam_roller",
  "foam roller": "foam_roller",
  other: "none",
  none: "none",
  "no equipment": "none",
};

const categoryMap: Record<string, string> = {
  strength: "strength",
  stretching: "flexibility",
  cardio: "cardio",
  plyometrics: "power",
  olympic: "strength",
  "olympic weightlifting": "strength",
  powerlifting: "strength",
  strongman: "strength",
  mobility: "mobility",
  yoga: "flexibility",
};

const unknownMuscles = new Set<string>();
const unknownEquipment = new Set<string>();
const unknownCategories = new Set<string>();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapMuscles(muscles?: string[]): MuscleGroup[] {
  if (!muscles || muscles.length === 0) return [];
  const mapped: MuscleGroup[] = [];
  for (const muscle of muscles) {
    const normalized = muscle.toLowerCase();
    const value = muscleMap[normalized];
    if (value) {
      if (!mapped.includes(value)) mapped.push(value);
    } else {
      unknownMuscles.add(muscle);
    }
  }
  return mapped;
}

function mapEquipmentValue(equipment?: string | null): EquipmentType | null {
  if (!equipment) return null;
  const normalized = equipment.toLowerCase();
  const mapped = equipmentMap[normalized];
  if (!mapped) unknownEquipment.add(equipment);
  return mapped || null;
}

function mapDifficulty(level?: string | null): DifficultyLevel {
  const normalized = level?.toLowerCase();
  if (normalized === "intermediate") return "intermediate";
  if (normalized === "expert" || normalized === "advanced") return "advanced";
  return "beginner";
}

function mapForce(force?: string | null): ForceType | null {
  const normalized = force?.toLowerCase();
  if (!normalized) return null;
  if (normalized === "push" || normalized === "pull" || normalized === "static" || normalized === "explosive") {
    return normalized as ForceType;
  }
  return null;
}

function mapMechanic(mechanic?: string | null): MechanicsType | null {
  const normalized = mechanic?.toLowerCase();
  if (!normalized) return null;
  if (normalized === "compound" || normalized === "isolation") {
    return normalized as MechanicsType;
  }
  return null;
}

function mapCategoryValue(category?: string | null): string {
  if (!category) return "strength";
  const normalized = category.toLowerCase();
  const mapped = categoryMap[normalized];
  if (!mapped) unknownCategories.add(category);
  return mapped || "strength";
}

function buildTags(raw: RapidExercise): string[] {
  const tags = new Set<string>();
  raw.name?.toLowerCase().split(/\s+/).forEach((word) => {
    if (word.length > 2) tags.add(word);
  });
  raw.primaryMuscles?.forEach((muscle) => tags.add(muscle.toLowerCase()));
  raw.secondaryMuscles?.forEach((muscle) => tags.add(muscle.toLowerCase()));
  if (raw.equipment) tags.add(raw.equipment.toLowerCase());
  if (raw.category) tags.add(raw.category.toLowerCase());
  if (raw.force) tags.add(raw.force.toLowerCase());
  return Array.from(tags);
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchExerciseDetail(id: string): Promise<RapidExercise | null> {
  const response = await fetch(`${BASE_URL}/exercise/${encodeURIComponent(id)}`, {
    headers: {
      "x-rapidapi-host": RAPID_API_HOST,
      "x-rapidapi-key": rapidApiKey as string,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.warn(`Failed to fetch exercise ${id} -> ${response.status} ${response.statusText}: ${text}`);
    return null;
  }

  return (await response.json()) as RapidExercise;
}

async function fetchAllExercises(): Promise<RapidExercise[]> {
  const response = await fetch(`${BASE_URL}/exercises`, {
    headers: {
      "x-rapidapi-host": RAPID_API_HOST,
      "x-rapidapi-key": rapidApiKey as string,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText} -> ${text}`);
  }

  const payload = await response.json();

  if (Array.isArray(payload)) {
    return payload as RapidExercise[];
  }

  const ids = (payload?.excercises_ids || payload?.exercise_ids || payload?.ids) as string[] | undefined;
  if (!ids || !Array.isArray(ids)) {
    console.error("Unexpected response payload from RapidAPI while fetching exercise ids:", payload);
    throw new Error("RapidAPI response did not contain exercise identifiers");
  }

  const results: RapidExercise[] = [];
  const batchSize = 10;

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const details = await Promise.all(batch.map((id) => fetchExerciseDetail(id)));
    for (const exercise of details) {
      if (exercise) {
        results.push(exercise);
      }
    }
    await delay(500);
  }

  return results;
}

interface UpsertResult {
  inserted: number;
  updated: number;
  skipped: number;
}

async function upsertExercises(exercises: RapidExercise[]): Promise<UpsertResult> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of exercises) {
    const slug = slugify(raw.name || raw.id);
    const primaryMuscles = mapMuscles(raw.primaryMuscles);
    if (primaryMuscles.length === 0) {
      skipped++;
      continue;
    }

    const secondaryMuscles = mapMuscles(raw.secondaryMuscles);
    const equipmentValue = mapEquipmentValue(raw.equipment);
    const equipmentArray = equipmentValue ? [equipmentValue] : ["none"];
    const difficulty = mapDifficulty(raw.level);
    const forceType = mapForce(raw.force);
    const mechanic = mapMechanic(raw.mechanic);
    const description = raw.instructions?.[0] || `${raw.name} exercise focusing on ${raw.primaryMuscles?.join(", ")}`;
    const instructions = raw.instructions?.length ? raw.instructions : [];
    const imageUrl = raw.images?.[0] || null;
    const gifUrl = raw.images?.[1] || null;
    const categoryId = mapCategoryValue(raw.category);
    const tags = buildTags(raw);

    const { data: existing, error: fetchError } = await supabase
      .from("exercises")
      .select(
        "id, description, instructions, image_url, gif_url, primary_muscles, secondary_muscles, equipment, difficulty, force_type, mechanics, youtube_id, tags"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (fetchError) {
      console.error(`Failed to check existing record for ${slug}:`, fetchError.message || fetchError);
      skipped++;
      continue;
    }

    const basePayload = {
      name: raw.name,
      slug,
      description,
      instructions,
      primary_muscles: primaryMuscles,
      secondary_muscles: secondaryMuscles,
      equipment: equipmentArray,
      difficulty,
      category_id: categoryId,
      force_type: forceType,
      mechanics: mechanic,
      image_url: imageUrl,
      gif_url: gifUrl,
      tags,
      is_active: true,
      is_featured: false,
      approval_status: "approved" as ExerciseDB["approval_status"],
      popularity_score: 0,
      tips: [],
      common_mistakes: [],
      variations: [],
      contraindications: [],
      environment: [],
    } satisfies Partial<ExerciseDB> & { slug: string; name: string };

    if (!existing) {
      const { error: insertError } = await supabase.from("exercises").insert(basePayload);
      if (insertError) {
        console.error(`Failed to insert ${slug}:`, insertError.message || insertError);
        skipped++;
      } else {
        inserted++;
        console.log(`Inserted exercise ${raw.name}`);
      }
      continue;
    }

    const updatePayload: Record<string, unknown> = {};
    let needsUpdate = false;

    if (!existing.description && basePayload.description) {
      updatePayload.description = basePayload.description;
      needsUpdate = true;
    }

    if ((!existing.instructions || existing.instructions.length === 0) && basePayload.instructions.length) {
      updatePayload.instructions = basePayload.instructions;
      needsUpdate = true;
    }

    if (!existing.image_url && basePayload.image_url) {
      updatePayload.image_url = basePayload.image_url;
      needsUpdate = true;
    }

    if (!existing.gif_url && basePayload.gif_url) {
      updatePayload.gif_url = basePayload.gif_url;
      needsUpdate = true;
    }

    if ((!existing.primary_muscles || existing.primary_muscles.length === 0) && basePayload.primary_muscles.length) {
      updatePayload.primary_muscles = basePayload.primary_muscles;
      needsUpdate = true;
    }

    if ((!existing.secondary_muscles || existing.secondary_muscles.length === 0) && basePayload.secondary_muscles.length) {
      updatePayload.secondary_muscles = basePayload.secondary_muscles;
      needsUpdate = true;
    }

    if ((!existing.equipment || existing.equipment.length === 0) && basePayload.equipment.length) {
      updatePayload.equipment = basePayload.equipment;
      needsUpdate = true;
    }

    if (!existing.force_type && basePayload.force_type) {
      updatePayload.force_type = basePayload.force_type;
      needsUpdate = true;
    }

    if (!existing.mechanics && basePayload.mechanics) {
      updatePayload.mechanics = basePayload.mechanics;
      needsUpdate = true;
    }

    if (!existing.tags || existing.tags.length === 0) {
      updatePayload.tags = basePayload.tags;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updatePayload.updated_at = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("exercises")
        .update(updatePayload)
        .eq("id", existing.id);

      if (updateError) {
        console.error(`Failed to update ${slug}:`, updateError.message || updateError);
        skipped++;
      } else {
        updated++;
        console.log(`Updated exercise ${raw.name}`);
      }
    } else {
      skipped++;
    }
  }

  return { inserted, updated, skipped };
}

async function main() {
  console.log("Fetching exercises from RapidAPI Exercise DB...");
  const exercises = await fetchAllExercises();
  console.log(`Fetched ${exercises.length} exercises.`);

  const result = await upsertExercises(exercises);
  console.log("Sync complete:", result);

  if (unknownMuscles.size) {
    console.log("Unknown muscle mappings:", Array.from(unknownMuscles));
  }
  if (unknownEquipment.size) {
    console.log("Unknown equipment mappings:", Array.from(unknownEquipment));
  }
  if (unknownCategories.size) {
    console.log("Unknown category mappings:", Array.from(unknownCategories));
  }

  console.log("RapidAPI does not provide exercise videos; only still images/gifs were synchronized.");
}

main().catch((error) => {
  console.error("RapidAPI sync failed:", error);
  process.exit(1);
});



