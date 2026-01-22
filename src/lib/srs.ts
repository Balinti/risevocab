// Lightweight Spaced Repetition System

export interface SrsCard {
  id: string;
  prompt_id?: string;
  phrase_id?: string;
  due_at: string;
  interval_days: number;
  ease: number;
  last_score: number;
  error_tags: string[];
}

// Default ease factor (2.5 is standard SM-2 starting point)
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;

// Grade values: 0-5 (SM-2 style)
// 0: Complete blackout
// 1: Incorrect, remembered when shown answer
// 2: Incorrect, easy to recall with hint
// 3: Correct, with difficulty
// 4: Correct, after hesitation
// 5: Perfect response

export function calculateNextReview(
  currentInterval: number,
  ease: number,
  grade: number
): { interval_days: number; ease: number } {
  // Convert 0-100 score to 0-5 grade
  const g = Math.round((grade / 100) * 5);

  let newInterval: number;
  let newEase = ease;

  if (g < 3) {
    // Failed - reset interval
    newInterval = 1;
    newEase = Math.max(MIN_EASE, ease - 0.2);
  } else if (currentInterval === 0) {
    // First review
    newInterval = 1;
  } else if (currentInterval === 1) {
    // Second review
    newInterval = 6;
  } else {
    // Subsequent reviews
    newInterval = Math.round(currentInterval * ease);

    // Adjust ease based on grade
    if (g === 5) {
      newEase = ease + 0.1;
    } else if (g === 4) {
      // No change
    } else if (g === 3) {
      newEase = Math.max(MIN_EASE, ease - 0.14);
    }
  }

  // Cap interval at 365 days
  newInterval = Math.min(newInterval, 365);

  return {
    interval_days: newInterval,
    ease: newEase,
  };
}

export function createNewSrsItem(promptId?: string, phraseId?: string): SrsCard {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2)}`,
    prompt_id: promptId,
    phrase_id: phraseId,
    due_at: new Date().toISOString(),
    interval_days: 0,
    ease: DEFAULT_EASE,
    last_score: 0,
    error_tags: [],
  };
}

export function gradeCard(card: SrsCard, score: number, errorTags: string[] = []): SrsCard {
  const { interval_days, ease } = calculateNextReview(card.interval_days, card.ease, score);

  const now = new Date();
  const dueAt = new Date(now.getTime() + interval_days * 24 * 60 * 60 * 1000);

  return {
    ...card,
    interval_days,
    ease,
    last_score: score,
    due_at: dueAt.toISOString(),
    error_tags: errorTags,
  };
}

export function isDue(card: SrsCard): boolean {
  return new Date(card.due_at) <= new Date();
}

export function getDueCards(cards: SrsCard[]): SrsCard[] {
  return cards.filter(isDue).sort((a, b) => {
    // Sort by due date, oldest first
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });
}

export function getUpcomingCards(cards: SrsCard[], days: number = 7): SrsCard[] {
  const future = new Date();
  future.setDate(future.getDate() + days);

  return cards
    .filter(card => {
      const due = new Date(card.due_at);
      return due > new Date() && due <= future;
    })
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
}
