// localStorage utilities for anonymous progress tracking

const KEYS = {
  ATTEMPTS: 'risevocab_attempts',
  SRS: 'risevocab_srs',
  PHRASEBOOK: 'risevocab_phrasebook',
  MESSAGE_REPAIR: 'risevocab_message_repair',
  BACKUP: 'risevocab_backup',
  DRILL_SUBMITTED: 'risevocab_drill_submitted',
};

export interface LocalAttempt {
  id: string;
  prompt_id: string;
  input_text: string;
  feedback_json: Record<string, unknown>;
  score: number;
  created_at: string;
}

export interface LocalSrsItem {
  id: string;
  prompt_id?: string;
  phrase_id?: string;
  due_at: string;
  interval_days: number;
  ease: number;
  last_score: number;
  error_tags: string[];
}

export interface LocalPhrase {
  id: string;
  phrase_text: string;
  tone: string;
  tags: string[];
  source_attempt_id?: string;
  created_at: string;
}

export interface LocalMessageRepair {
  date: string;
  count: number;
}

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled
  }
}

// Attempts
export function getLocalAttempts(): LocalAttempt[] {
  return getItem<LocalAttempt[]>(KEYS.ATTEMPTS, []);
}

export function addLocalAttempt(attempt: LocalAttempt): void {
  const attempts = getLocalAttempts();
  attempts.push(attempt);
  setItem(KEYS.ATTEMPTS, attempts);
}

// SRS Items
export function getLocalSrsItems(): LocalSrsItem[] {
  return getItem<LocalSrsItem[]>(KEYS.SRS, []);
}

export function setLocalSrsItems(items: LocalSrsItem[]): void {
  setItem(KEYS.SRS, items);
}

export function updateLocalSrsItem(id: string, updates: Partial<LocalSrsItem>): void {
  const items = getLocalSrsItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    setLocalSrsItems(items);
  }
}

export function addLocalSrsItem(item: LocalSrsItem): void {
  const items = getLocalSrsItems();
  items.push(item);
  setLocalSrsItems(items);
}

// Phrasebook
export function getLocalPhrasebook(): LocalPhrase[] {
  return getItem<LocalPhrase[]>(KEYS.PHRASEBOOK, []);
}

export function addLocalPhrase(phrase: LocalPhrase): void {
  const phrases = getLocalPhrasebook();
  phrases.push(phrase);
  setItem(KEYS.PHRASEBOOK, phrases);
}

export function removeLocalPhrase(id: string): void {
  const phrases = getLocalPhrasebook();
  setItem(KEYS.PHRASEBOOK, phrases.filter(p => p.id !== id));
}

// Message Repair Counter
export function getMessageRepairCount(): number {
  const today = new Date().toISOString().split('T')[0];
  const data = getItem<LocalMessageRepair>(KEYS.MESSAGE_REPAIR, { date: today, count: 0 });

  if (data.date !== today) {
    // Reset for new day
    return 0;
  }
  return data.count;
}

export function incrementMessageRepairCount(): void {
  const today = new Date().toISOString().split('T')[0];
  const data = getItem<LocalMessageRepair>(KEYS.MESSAGE_REPAIR, { date: today, count: 0 });

  if (data.date !== today) {
    setItem(KEYS.MESSAGE_REPAIR, { date: today, count: 1 });
  } else {
    setItem(KEYS.MESSAGE_REPAIR, { date: today, count: data.count + 1 });
  }
}

// Drill submission tracking
export function hasDrillBeenSubmitted(): boolean {
  return getItem<boolean>(KEYS.DRILL_SUBMITTED, false);
}

export function markDrillSubmitted(): void {
  setItem(KEYS.DRILL_SUBMITTED, true);
}

// Migration - Get all local data for syncing to server
export function getAllLocalData() {
  return {
    attempts: getLocalAttempts(),
    srs: getLocalSrsItems(),
    phrasebook: getLocalPhrasebook(),
    messageRepair: getItem<LocalMessageRepair>(KEYS.MESSAGE_REPAIR, { date: '', count: 0 }),
  };
}

// Backup before clearing
export function backupLocalData(): void {
  const data = getAllLocalData();
  setItem(KEYS.BACKUP, data);
}

// Clear local data after migration (keeps backup)
export function clearLocalData(): void {
  backupLocalData();
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.ATTEMPTS);
  localStorage.removeItem(KEYS.SRS);
  localStorage.removeItem(KEYS.PHRASEBOOK);
  localStorage.removeItem(KEYS.MESSAGE_REPAIR);
  localStorage.removeItem(KEYS.DRILL_SUBMITTED);
}

// Generate UUID for local items
export function generateLocalId(): string {
  return 'local_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
