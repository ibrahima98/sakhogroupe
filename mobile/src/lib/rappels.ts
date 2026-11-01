import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { horairesDuJour, type Lieu, type MethodeCalcul, type NomPriere } from '@/lib/prayer';
import { preferences } from '@/lib/preferences';

// iOS garde au plus 64 notifications programmées : 10 jours × 5 prières = 50.
const NB_JOURS = 10;
const CANAL = 'prieres';

export const rappelsDisponibles = Platform.OS !== 'web';

if (rappelsDisponibles) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Demande l'autorisation (au premier usage). Renvoie true si les rappels sont permis. */
export async function autoriserRappels(): Promise<boolean> {
  if (!rappelsDisponibles) return false;
  const actuel = await Notifications.getPermissionsAsync();
  if (actuel.granted) return true;
  if (!actuel.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Reprogramme les rappels des 10 prochains jours. À rappeler à chaque ouverture de
 * l'app et à chaque changement de lieu, de méthode ou de prière activée.
 */
export async function programmerRappels(
  lieu: Lieu,
  methode: MethodeCalcul,
  actives: Record<NomPriere, boolean>,
): Promise<number> {
  if (!rappelsDisponibles) return 0;
  if (!(await Notifications.getPermissionsAsync()).granted) return 0;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Heures de prière',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  const maintenant = new Date();
  let total = 0;
  for (let j = 0; j < NB_JOURS; j++) {
    const jour = new Date(maintenant);
    jour.setDate(jour.getDate() + j);
    for (const { nom, heure } of horairesDuJour(lieu, jour, methode)) {
      if (!actives[nom] || heure <= maintenant) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: `C’est l’heure de ${nom}`, body: lieu.nom, sound: 'default' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: heure, channelId: CANAL },
      });
      total++;
    }
  }
  return total;
}

/** Garde les rappels à jour (ouverture de l'app, changement de lieu, méthode ou prière). */
export function useSynchroRappels() {
  const { lieu, methodePriere, rappels } = preferences.useValeur();
  useEffect(() => {
    // Attend la lecture des préférences enregistrées avant de reprogrammer.
    preferences.charge.then(() => {
      const p = preferences.get();
      programmerRappels(p.lieu, p.methodePriere, p.rappels).catch(() => {});
    });
  }, [lieu, methodePriere, rappels]);
}
