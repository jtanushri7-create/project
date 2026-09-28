import { EmergencyContact, FakeCallSettings, JourneySession } from '../types';

const CONTACTS_KEY = 'security4her_contacts';
const FAKE_CALL_KEY = 'security4her_fake_call';
const JOURNEY_KEY = 'security4her_active_journey';
const SAFETY_PIN_KEY = 'security4her_safety_pin';

export const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-1',
    name: 'Mom',
    relationship: 'Mother',
    phone: '+1 555-0199',
    isPrimary: true,
    enableWhatsApp: true,
  },
  {
    id: 'contact-2',
    name: 'Sister',
    relationship: 'Family',
    phone: '+1 555-0144',
    isPrimary: false,
    enableWhatsApp: true,
  },
  {
    id: 'contact-3',
    name: 'Best Friend',
    relationship: 'Friend',
    phone: '+1 555-0182',
    isPrimary: false,
    enableWhatsApp: true,
  },
];

export const DEFAULT_FAKE_CALL: FakeCallSettings = {
  callerName: 'Mom',
  callerNumber: '+1 (555) 349-2091',
  delaySeconds: 3,
  avatarPreset: 'mom',
  customScript: "Hey! Where are you right now? I'm waiting outside in the car with the hazards on. Come out right away!",
};

export function getStoredContacts(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored contacts:', e);
  }
  return DEFAULT_CONTACTS;
}

export function saveStoredContacts(contacts: EmergencyContact[]): void {
  try {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.warn('Failed to save contacts:', e);
  }
}

export function getStoredFakeCallSettings(): FakeCallSettings {
  try {
    const raw = localStorage.getItem(FAKE_CALL_KEY);
    if (raw) {
      return { ...DEFAULT_FAKE_CALL, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to parse fake call settings:', e);
  }
  return DEFAULT_FAKE_CALL;
}

export function saveStoredFakeCallSettings(settings: FakeCallSettings): void {
  try {
    localStorage.setItem(FAKE_CALL_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save fake call settings:', e);
  }
}

export function getStoredJourney(): JourneySession | null {
  try {
    const raw = localStorage.getItem(JOURNEY_KEY);
    if (raw) {
      const session: JourneySession = JSON.parse(raw);
      if (session.isRunning) {
        const elapsedSeconds = Math.floor((Date.now() - session.startedAt) / 1000);
        const remaining = Math.max(0, session.totalSeconds - elapsedSeconds);
        session.remainingSeconds = remaining;
        if (remaining <= 0) {
          session.isExpired = true;
        }
      }
      return session;
    }
  } catch (e) {
    console.warn('Failed to parse stored journey:', e);
  }
  return null;
}

export function saveStoredJourney(journey: JourneySession | null): void {
  try {
    if (journey) {
      localStorage.setItem(JOURNEY_KEY, JSON.stringify(journey));
    } else {
      localStorage.removeItem(JOURNEY_KEY);
    }
  } catch (e) {
    console.warn('Failed to save journey:', e);
  }
}

export function getStoredSafetyPin(): string {
  try {
    return localStorage.getItem(SAFETY_PIN_KEY) || '1234';
  } catch {
    return '1234';
  }
}