export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  enableWhatsApp: boolean;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationDetails {
  coords: LocationCoordinates;
  address: string;
  displayName: string;
  mapsUrl: string;
  osmUrl: string;
}

export interface JourneySession {
  id: string;
  title: string;
  destination: string;
  durationMinutes: number;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isExpired: boolean;
  startedAt: number;
  lastKnownLocation?: LocationDetails | null;
  notes?: string;
  pin: string;
}

export interface FakeCallSettings {
  callerName: string;
  callerNumber: string;
  delaySeconds: number;
  avatarPreset: 'mom' | 'dad' | 'boss' | 'police' | 'friend';
  customScript: string;
}

export type ActiveTab = 'sos' | 'checkin' | 'fakecall' | 'contacts' | 'tools';