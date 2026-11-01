import * as Location from 'expo-location';

import type { Lieu } from '@/lib/prayer';

/**
 * Position actuelle pour le calcul des prières. Elle reste sur le téléphone.
 * Lève une erreur lisible si l'autorisation est refusée.
 */
export async function lieuActuel(): Promise<Lieu> {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  if (!granted) throw new Error('Autorisation de localisation refusée. Choisissez une ville.');

  const position =
    (await Location.getLastKnownPositionAsync({ maxAge: 60 * 60_000 })) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  const { latitude, longitude } = position.coords;

  let nom = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  try {
    const [adresse] = await Location.reverseGeocodeAsync({ latitude, longitude });
    const ville = adresse?.city ?? adresse?.subregion ?? adresse?.region;
    if (ville) nom = adresse?.country ? `${ville}, ${adresse.country}` : ville;
  } catch {
    // Pas de nom de ville (hors ligne, web…) : on garde les coordonnées.
  }
  return { nom, latitude, longitude };
}
