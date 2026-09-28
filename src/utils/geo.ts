import { LocationCoordinates, LocationDetails } from '../types';

export async function getCurrentLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp || Date.now(),
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationDetails> {
  const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Nominatim error: ${res.statusText}`);
    }

    const data = await res.json();
    const address = data.address || {};

    const street = address.road || address.pedestrian || address.street || '';
    const neighborhood = address.neighbourhood || address.suburb || address.quarter || '';
    const city = address.city || address.town || address.village || address.municipality || '';
    const state = address.state || '';
    const postcode = address.postcode || '';

    const parts = [street, neighborhood, city, state, postcode].filter(Boolean);
    const readableAddress = parts.length > 0 ? parts.join(', ') : data.display_name || `${lat}, ${lon}`;

    return {
      coords: {
        latitude: lat,
        longitude: lon,
        timestamp: Date.now(),
      },
      address: readableAddress,
      displayName: data.display_name || readableAddress,
      mapsUrl,
      osmUrl,
    };
  } catch (err) {
    console.warn('Reverse geocode failed or timed out:', err);
    return {
      coords: {
        latitude: lat,
        longitude: lon,
        timestamp: Date.now(),
      },
      address: `Near coordinates ${lat}, ${lon}`,
      displayName: `GPS: ${lat}, ${lon}`,
      mapsUrl,
      osmUrl,
    };
  }
}

export function generateSosMessage(location: LocationDetails | null): string {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  if (!location) {
    return `🚨 EMERGENCY SOS! I need immediate help. Please call me or send assistance now! [Time: ${dateStr} ${timeStr}] - Sent via Security4Her`;
  }

  return `🚨 EMERGENCY SOS ALERT!
I need immediate assistance! Please check on me or dispatch help.

📍 Live Location:
${location.mapsUrl}

🏢 Address / Vicinity:
${location.address}

⏰ Timestamp: ${dateStr}, ${timeStr}
(Sent quickly via Security4Her Safety App)`;
}

export function getWhatsAppShareUrl(message: string, phoneNumber?: string): string {
  const encoded = encodeURIComponent(message);
  if (phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length >= 7) {
      return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`;
    }
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export async function shareContent(data: { title: string; text: string; url?: string }): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share(data);
      return true;
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return false;
      }
    }
  }

  try {
    const fullText = [data.title, data.text, data.url].filter(Boolean).join('\n\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullText);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard fallback failed:', err);
  }
  return false;
}

export function getSmsShareUrl(message: string, phoneNumber?: string): string {
  const encoded = encodeURIComponent(message);
  if (phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    return `sms:${cleanNumber}?body=${encoded}`;
  }
  return `sms:?body=${encoded}`;
}