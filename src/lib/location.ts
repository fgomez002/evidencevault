import * as Location from 'expo-location';

export interface CapturedLocation {
  latitude: number;
  longitude: number;
  label?: string;
}

/**
 * Request permission and capture the current GPS position. Returns null if the
 * user declines — location is always optional and user-initiated.
 */
export async function captureLocation(): Promise<CapturedLocation | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const result: CapturedLocation = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  };

  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude: result.latitude,
      longitude: result.longitude,
    });
    if (place) {
      result.label = [place.name, place.city, place.region]
        .filter(Boolean)
        .join(', ');
    }
  } catch {
    // reverse geocode is best-effort; coordinates are what matter
  }
  return result;
}
