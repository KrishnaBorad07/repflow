/**
 * Phrase library for the AI trainer's spoken cues.
 *
 * Each event has multiple variations so the same situation doesn't always
 * trigger the exact same line — closer to how a real human coach speaks.
 */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Friendlier display names for exercises in spoken cues.
function speakName(name) {
  if (!name) return 'this set';
  return name.replace(/\bdumbbell\b/i, 'dumbbell').replace(/_/g, ' ');
}

export const TRAINER = {
  setStart: (exercise, reps) =>
    pick([
      `Alright, ${reps} ${speakName(exercise)}. Controlled tempo.`,
      `Let's go. ${reps} reps. Focus on form.`,
      `${reps} good reps coming up. You ready?`,
      `${speakName(exercise)} time. Quality over speed.`,
    ]),

  halfway: (done, total) =>
    pick([
      `Halfway. Keep it steady.`,
      `${done} down, ${total - done} to go.`,
      `Halfway there. Stay tight.`,
      `Nice — half of them done.`,
    ]),

  lastRep: () =>
    pick([
      `Last one. Make it count.`,
      `One more. Give me your best.`,
      `Final rep. Finish strong.`,
      `Last one — own it.`,
    ]),

  setComplete: (formScore) => {
    if (formScore == null) {
      return pick([`Set complete. Take a breath.`, `Done. Nice work.`]);
    }
    if (formScore >= 8) {
      return pick([
        `Set done. Solid form throughout.`,
        `That was clean. Great set.`,
        `Strong work. Form was on point.`,
      ]);
    }
    if (formScore >= 5) {
      return pick([
        `Set complete. Tighten depth next round.`,
        `Done. Watch your form next set.`,
        `Set finished. Clean up the depth.`,
      ]);
    }
    return pick([
      `Set done. Let's clean it up next time.`,
      `Complete. Focus on form before pushing harder.`,
    ]);
  },

  restEnd: () =>
    pick([
      `Time's up. Back to it.`,
      `Rest over. Let's go.`,
      `Up and at it.`,
      `Reset, here we go.`,
    ]),

  badRep: (issue) => {
    const i = issue ? issue.toLowerCase() : 'fix your form';
    return pick([
      `That one didn't count. ${capitalize(i)}.`,
      `Reset. ${capitalize(i)}.`,
      `Doesn't count — ${i}.`,
    ]);
  },
};

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
