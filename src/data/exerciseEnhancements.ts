import { Exercise, ExerciseCategory, EquipmentType, ForceType, MechanicsType } from '../types/exercise.types';

type Enhancement = {
  youtube_id?: string;
  tips?: string[];
  common_mistakes?: string[];
  variations?: string[];
};

const slugEnhancements: Record<string, Enhancement> = {
  '3-4-sit-up': {
    youtube_id: 'uLgcqhQRJ_g',
    tips: [
      'Anchor your feet only lightly so the hip flexors do not dominate the movement.',
      'Initiate each rep by curling the rib cage toward the pelvis instead of yanking the neck forward.',
      'Exhale as you rise and stop just short of sitting fully upright to keep tension on the abs.'
    ],
    common_mistakes: [
      'Pulling on the head or neck to get through the sticking point.',
      'Letting the lower back hyperextend during the lowering phase.',
      'Using momentum and bouncing at the bottom rather than controlling the descent.'
    ],
    variations: [
      'Hold a light plate or medicine ball at the chest for extra load.',
      'Perform the 3/4 sit-up on a decline bench to increase the range.',
      'Slow the eccentric to a 3-count for additional time under tension.'
    ]
  },
  '90-90-hamstring': {
    youtube_id: 'h_yZV27H684',
    tips: [
      'Keep the non-working leg pressed firmly into the floor to stabilise the pelvis.',
      'Flex the foot of the raised leg to tension the posterior chain during the stretch.',
      'Move slowly and stop at the first sign of a firm stretch rather than pain.'
    ],
    common_mistakes: [
      'Allowing the lower back to round off the floor when the leg extends.',
      'Using momentum to swing the leg rather than controlling through the hinge.',
      'Holding the breath instead of breathing calmly to encourage relaxation.'
    ],
    variations: [
      'Add a small ankle weight for gentle loaded stretching.',
      'Perform the movement with a resistance band assisting the leg.',
      'Pause for 3 seconds at the top to focus on end-range control.'
    ]
  },
  'ab-crunch-machine': {
    youtube_id: 'kbGbK7kcXzY',
    tips: [
      'Set the machine so the pivot point lines up with the mid-spine to keep tension on the abs.',
      'Initiate each rep by drawing ribs toward hips before closing the elbows.',
      'Maintain a smooth tempo and squeeze hard at the top for one second.'
    ],
    common_mistakes: [
      'Driving the movement with the hip flexors instead of the abdominals.',
      'Letting the weight stack slam between reps which removes tension.',
      'Using excessive load that forces the lower back to round aggressively.'
    ],
    variations: [
      'Adjust the tempo to 2-1-2 to emphasise the eccentric.',
      'Perform single-arm crunches on the machine to address imbalances.',
      'Superset with hanging knee raises for a complete core finisher.'
    ]
  },
  'ab-roller': {
    youtube_id: 'ndc391RFNUM',
    tips: [
      'Start with the hips slightly tucked and ribs down to engage the core before rolling.',
      'Move only as far as you can while keeping the lower back from sagging.',
      'Squeeze the glutes on the way back to help bring the wheel underneath the shoulders.'
    ],
    common_mistakes: [
      'Arching the lower back and letting the torso collapse during the rollout.',
      'Allowing the shoulders to shrug toward the ears instead of staying packed.',
      'Going too fast and crashing the wheel into the floor on the return.'
    ],
    variations: [
      'Perform rollouts from an elevated surface to reduce the range as you learn.',
      'Use a wall as a hard stop to practise bracing at end range.',
      'Progress to standing rollouts when you can maintain perfect form.'
    ]
  },
  adductor: {
    youtube_id: 'pH0rGQ5qwL8',
    tips: [
      'Support the torso with forearms or hands so the inner thigh can fully relax into the roller.',
      'Roll slowly between the knee and hip, pausing on tender trigger points.',
      'Keep the core lightly braced so the lower back does not sag toward the floor.'
    ],
    common_mistakes: [
      'Rolling too quickly and skipping over tight areas that need attention.',
      'Allowing the hips to rotate excessively, which reduces pressure on the target tissue.',
      'Holding the breath instead of using slow exhales to relax the adductors.'
    ],
    variations: [
      'Switch to a lacrosse ball for a smaller, more intense contact point.',
      'Perform contract-relax by gently squeezing the roller for five seconds before releasing.',
      'Elevate the torso on a bench to increase leverage if more pressure is required.'
    ]
  },
  'adductor-groin': {
    youtube_id: '_RITGdX5mEY',
    tips: [
      'Communicate with your partner so the stretch stays firm but comfortable.',
      'Keep the lower back pressed into the floor to prevent overarching.',
      'Use a steady breathing pattern and sink deeper only on the exhale.'
    ],
    common_mistakes: [
      'Allowing the knees to collapse inward unevenly, creating hip rotation.',
      'Forcing the stretch too aggressively and causing the muscles to guard.',
      'Holding tension in the shoulders and neck instead of relaxing into the stretch.'
    ],
    variations: [
      'Perform a solo version by using a strap or band around the ankles.',
      'Add a gentle contract-relax by pressing the legs together for five seconds before relaxing.',
      'Elevate the hips onto a bolster to change the stretch angle.'
    ]
  },
  'kneeling-hip-flexor': {
    youtube_id: 'DXuStgWuJV8',
    tips: [
      'Posteriorly tilt the pelvis (tuck the tailbone) before shifting forward to target the hip flexor.',
      'Stack the rib cage over the pelvis to avoid arching the lower back.',
      'Squeeze the glute of the rear leg to deepen the stretch while protecting the spine.'
    ],
    common_mistakes: [
      'Leaning too far forward and arching through the lumbar spine instead of the hip.',
      'Letting the front knee collapse inward away from the toes.',
      'Holding the stretch while holding the breath, which encourages tension.'
    ],
    variations: [
      'Raise the rear foot onto a bench or foam roller to intensify the stretch.',
      'Add an overhead reach or side bend to bias different fibres of the hip flexor.',
      'Pulse gently in and out of end range for a dynamic warm-up variation.'
    ]
  }
};

const categoryEnhancements: Partial<Record<ExerciseCategory, Enhancement>> = {
  strength: {
    tips: [
      'Create full-body tension before every rep to protect the spine and transfer force.',
      'Control the eccentric phase for at least two seconds to stay in command of the load.',
      'Move through an honest range of motion that you can stabilise without compensations.'
    ],
    common_mistakes: [
      'Using momentum to sling the weight instead of lifting with muscular control.',
      'Skipping the setup or warm-up sets and jumping straight to heavy loads.',
      'Forgetting to breathe and brace, which leaves the trunk unstable under load.'
    ],
    variations: [
      'Introduce tempo or pause work to address sticking points.',
      'Switch to unilateral variations to expose and fix imbalances.',
      'Use drop sets or mechanical advantage shifts to accumulate time under tension.'
    ]
  },
  cardio: {
    tips: [
      'Establish a rhythm you can maintain for the full block before increasing pace.',
      'Keep posture tall with relaxed shoulders so the lungs can expand freely.',
      'Use nasal or controlled breathing to prevent early fatigue spikes.'
    ],
    common_mistakes: [
      'Starting at an all-out effort that cannot be sustained.',
      'Allowing technique to deteriorate and joints to collapse under fatigue.',
      'Skipping the warm-up or cool-down phases around the main effort.'
    ],
    variations: [
      'Alternate between intervals of hard work and active recovery.',
      'Add light external loading like a weight vest once mechanics are solid.',
      'Combine with mobility or core drills between sets for hybrid conditioning.'
    ]
  },
  flexibility: {
    tips: [
      'Ease into the stretch and stop at the first strong but manageable tension.',
      'Breathe slowly through the nose to encourage the nervous system to relax.',
      'Keep neighbouring joints aligned so the target tissue receives the stretch.'
    ],
    common_mistakes: [
      'Bouncing or forcing the range, which can trigger a protective muscle response.',
      'Holding the breath and letting the shoulders creep toward the ears.',
      'Twisting through the spine instead of isolating the intended area.'
    ],
    variations: [
      'Use contract-relax (PNF) pulses to gradually open the range.',
      'Add props such as yoga blocks or straps for support and leverage.',
      'Flow gently in and out of the end range to build dynamic control.'
    ]
  },
  mobility: {
    tips: [
      'Move deliberately through the range and prioritise quality over amplitude.',
      'Coordinate breath with movement to unlock extra motion at end range.',
      'Maintain light tension through the core to support the working joint.'
    ],
    common_mistakes: [
      'Rushing the drill and skipping the positions that feel restricted.',
      'Letting compensations (like spinal flexion) sneak in to “cheat” the range.',
      'Overworking a cold joint without first preparing it with easier motion.'
    ],
    variations: [
      'Add controlled articular rotations to map the joint through all angles.',
      'Layer light resistance bands to build strength in the new range.',
      'Integrate the movement into a flowing sequence with adjacent joints.'
    ]
  },
  balance: {
    tips: [
      'Focus your gaze on a fixed point to steady the vestibular system.',
      'Engage the core and glutes gently to create a stable pillar.',
      'Move slowly and deliberately, adjusting posture with subtle corrections.'
    ],
    common_mistakes: [
      'Looking down at the feet, which disrupts alignment and balance.',
      'Gripping the toes or tensing the shoulders, creating excess rigidity.',
      'Progressing difficulty before mastering the basic stance.'
    ],
    variations: [
      'Practise on an unstable surface like a foam pad or balance disc.',
      'Add perturbations such as light band pulls while holding position.',
      'Close the eyes or turn the head to challenge the vestibular system.'
    ]
  },
  endurance: {
    tips: [
      'Break the total volume into manageable sets to maintain mechanics.',
      'Fuel and hydrate appropriately before longer sessions.',
      'Monitor effort using RPE or heart rate to stay in the desired zone.'
    ],
    common_mistakes: [
      'Accumulating junk volume with sloppy reps late in the session.',
      'Neglecting recovery strategies between repeated endurance bouts.',
      'Ignoring niggles or pain signals that appear during long sets.'
    ],
    variations: [
      'Use tempo changes such as negative splits within the session.',
      'Alternate between steady-state and threshold intervals week to week.',
      'Introduce cross-training modalities to reduce overuse.'
    ]
  },
  power: {
    tips: [
      'Prime the nervous system with light plyometrics before heavy power work.',
      'Focus on explosive intent while maintaining crisp technique.',
      'Leave 1-2 quality reps in reserve to keep outputs high.'
    ],
    common_mistakes: [
      'Turning power work into slow grinding reps once fatigue sets in.',
      'Skipping adequate rest between sets and losing velocity.',
      'Landing heavily rather than absorbing force softly.'
    ],
    variations: [
      'Contrast pair heavy lifts with a similar plyometric movement.',
      'Manipulate load each set (cluster or wave loading) to stay explosive.',
      'Add accommodating resistance like bands or chains for overspeed intent.'
    ]
  },
  rehabilitation: {
    tips: [
      'Stay within a pain-free range and follow practitioner guidance.',
      'Prioritise slow, controlled tempo to rebuild tissue tolerance.',
      'Track symptoms and adjust volume gradually across sessions.'
    ],
    common_mistakes: [
      'Progressing load or range faster than tissues can adapt.',
      'Comparing the injured side to the healthy side and rushing the process.',
      'Neglecting isometric holds that rebuild tolerance safely.'
    ],
    variations: [
      'Transition from isometrics to slow concentrics before faster movements.',
      'Use support (walls, dowels, straps) to offload the affected area.',
      'Integrate proprioceptive drills to restore joint awareness.'
    ]
  }
};

const forceEnhancements: Partial<Record<ForceType, Enhancement>> = {
  static: {
    tips: [
      'Match your breathing to the hold—steady inhales and long exhales keep tension without bracing too hard.',
      'Focus on gentle co-contraction around the joint so supporting muscles stay engaged.',
      'Use time-based sets and stop before posture breaks down.'
    ],
    common_mistakes: [
      'Holding the breath and creating unnecessary blood pressure spikes.',
      'Letting posture drift as fatigue sets in.',
      'Standing completely relaxed instead of maintaining light tension.'
    ],
    variations: [
      'Accumulate multiple shorter holds with perfect form instead of one long grind.',
      'Add small pulses around end range to prepare for dynamic movement.',
      'Layer light resistance bands to increase the challenge gradually.'
    ]
  }
};

const mechanicsEnhancements: Partial<Record<MechanicsType, Enhancement>> = {
  isolation: {
    tips: [
      'Stabilise the surrounding joints so the prime mover does the work.',
      'Use a moderate tempo and feel the target muscle throughout.',
      'Think about initiating the movement from the muscle you are training.'
    ],
    common_mistakes: [
      'Swinging through the range and turning the isolation into a compound move.',
      'Letting secondary muscles overpower the prime mover.',
      'Loading too heavy and losing the mind-muscle connection.'
    ],
    variations: [
      'Experiment with different grips or angles to hit the muscle fibres differently.',
      'Use drop sets to extend time under tension once form is rock solid.',
      'Add isometric pauses at peak contraction to heighten activation.'
    ]
  }
};

const equipmentEnhancements: Partial<Record<EquipmentType, Enhancement>> = {
  bodyweight: {
    tips: [
      'Create tension through the whole body even when no external load is present.',
      'Adjust leverage or tempo to scale difficulty without compromising form.',
      'Use deliberate breathing to support the movement under fatigue.'
    ],
    common_mistakes: [
      'Relying on momentum rather than muscular control.',
      'Ignoring progressive overload by keeping the exact same variation for too long.',
      'Letting alignment slip because the load feels light.'
    ],
    variations: [
      'Elevate hands or feet to change leverage.',
      'Add pauses or slow eccentrics to increase difficulty.',
      'Pair with light external resistance like mini-bands or weighted vests.'
    ]
  }
};

function sanitizeList(values?: string[] | null): string[] {
  if (!values) return [];
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);
}

function mergeUnique(...lists: string[][]): string[] {
  const merged: string[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    }
  }
  return merged;
}

export function applyExerciseEnhancements(exercise: Exercise): Exercise {
  const baseTips = sanitizeList(exercise.tips);
  const baseMistakes = sanitizeList(exercise.common_mistakes);
  const baseVariations = sanitizeList(exercise.variations);

  const slugEnhancement = slugEnhancements[exercise.slug] ?? slugEnhancements[exercise.id];
  const categoryEnhancement = exercise.category ? categoryEnhancements[exercise.category] : undefined;
  const forceEnhancement = exercise.force_type ? forceEnhancements[exercise.force_type] : undefined;
  const mechanicsEnhancement = exercise.mechanics ? mechanicsEnhancements[exercise.mechanics] : undefined;
  const equipmentEnhancementLists = (exercise.equipment || [])
    .map((eq) => equipmentEnhancements[eq as EquipmentType])
    .filter((value): value is Enhancement => Boolean(value));

  const shouldApplyCategory = baseTips.length === 0;

  const extraTips: string[] = [];
  const extraMistakes: string[] = [];
  const extraVariations: string[] = [];

  if (shouldApplyCategory) {
    if (categoryEnhancement?.tips) extraTips.push(...categoryEnhancement.tips);
    if (categoryEnhancement?.common_mistakes) extraMistakes.push(...categoryEnhancement.common_mistakes);
    if (categoryEnhancement?.variations) extraVariations.push(...categoryEnhancement.variations);
    if (forceEnhancement?.tips) extraTips.push(...forceEnhancement.tips);
    if (forceEnhancement?.common_mistakes) extraMistakes.push(...forceEnhancement.common_mistakes ?? []);
    if (forceEnhancement?.variations) extraVariations.push(...forceEnhancement.variations ?? []);
    if (mechanicsEnhancement?.tips) extraTips.push(...mechanicsEnhancement.tips);
    if (mechanicsEnhancement?.common_mistakes) extraMistakes.push(...mechanicsEnhancement.common_mistakes ?? []);
    if (mechanicsEnhancement?.variations) extraVariations.push(...mechanicsEnhancement.variations ?? []);
    for (const enhancement of equipmentEnhancementLists) {
      if (enhancement.tips) extraTips.push(...enhancement.tips);
      if (enhancement.common_mistakes) extraMistakes.push(...enhancement.common_mistakes);
      if (enhancement.variations) extraVariations.push(...enhancement.variations);
    }
  }

  if (slugEnhancement?.tips) {
    extraTips.push(...slugEnhancement.tips);
  }
  if (slugEnhancement?.common_mistakes) {
    extraMistakes.push(...slugEnhancement.common_mistakes);
  }
  if (slugEnhancement?.variations) {
    extraVariations.push(...slugEnhancement.variations);
  }

  const finalTips = mergeUnique(baseTips, extraTips);
  const finalMistakes = mergeUnique(baseMistakes, extraMistakes);
  const finalVariations = mergeUnique(baseVariations, extraVariations);

  const youtubeId = exercise.youtube_id
    || slugEnhancement?.youtube_id
    || categoryEnhancement?.youtube_id
    || forceEnhancement?.youtube_id
    || mechanicsEnhancement?.youtube_id;

  return {
    ...exercise,
    youtube_id: youtubeId ?? exercise.youtube_id ?? null,
    video_url: youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : exercise.video_url,
    tips: finalTips.length ? finalTips : undefined,
    common_mistakes: finalMistakes.length ? finalMistakes : undefined,
    variations: finalVariations.length ? finalVariations : undefined,
  };
}
