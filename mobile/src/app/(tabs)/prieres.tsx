import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoixLieu } from '@/components/choix-lieu';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import {
  formatDuree,
  formatHeure,
  horairesDuJour,
  METHODES,
  NOMS_ARABES,
  type NomPriere,
  prochainePriere,
  useMaintenant,
} from '@/lib/prayer';
import { modifierPreferences, usePreferences } from '@/lib/preferences';
import { autoriserRappels, rappelsDisponibles } from '@/lib/rappels';

const ICONES: Record<NomPriere, ComponentProps<typeof Ionicons>['name']> = {
  Fajr: 'partly-sunny-outline',
  Dhuhr: 'sunny-outline',
  Asr: 'sunny',
  Maghrib: 'moon-outline',
  Isha: 'moon',
};

export default function PrieresScreen() {
  const maintenant = useMaintenant();
  const { lieu, methodePriere, rappels } = usePreferences();
  const prieresDuJour = horairesDuJour(lieu, maintenant, methodePriere);
  const prochaine = prochainePriere(lieu, maintenant, methodePriere);
  // Prière mise en évidence : la prochaine du jour (après Isha, Fajr du lendemain).
  const enEvidence = prochaine.nom;
  const methode = METHODES.find((m) => m.id === methodePriere);
  const date = maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const basculer = async (nom: NomPriere, actif: boolean) => {
    // L'autorisation est demandée au premier rappel activé.
    if (actif && !(await autoriserRappels())) return;
    modifierPreferences({ rappels: { ...rappels, [nom]: actif } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.entete}>
          <Text style={styles.titrePage}>Heures de prière</Text>
          <Pressable onPress={() => router.push('/reglages/notifications')} hitSlop={10} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={22} color={Colors.emerald} />
          </Pressable>
        </View>

        <View style={styles.carte}>
          <ChoixLieu />
          <Text style={styles.titreCarte}>Heures de prière</Text>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.cases}>
            {prieresDuJour.map(({ nom, heure }) => {
              const actif = nom === enEvidence;
              return (
                <View key={nom} style={[styles.case, actif && styles.caseActive]}>
                  <Text style={[styles.caseHeure, actif && { color: Colors.orange }]}>{formatHeure(heure)}</Text>
                  <Ionicons name={ICONES[nom]} size={16} color={actif ? Colors.orange : Colors.emerald} />
                  <Text style={[styles.caseNom, actif && { color: Colors.orange }]}>{nom}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.prochaine}>
          <Text style={styles.prochaineLabel}>Prochaine prière · {prochaine.nom}</Text>
          <Text style={styles.prochaineHeure}>{formatHeure(prochaine.heure)}</Text>
          <Text style={styles.prochaineLabel}>
            Temps restant {formatDuree(prochaine.heure.getTime() - maintenant.getTime())}
          </Text>
        </View>

        <View style={{ gap: Spacing.two }}>
          {prieresDuJour.map(({ nom, heure }) => {
            const actif = nom === enEvidence;
            return (
              <View key={nom} style={[styles.ligne, actif && styles.ligneActive]}>
                <Text style={styles.arabe}>{NOMS_ARABES[nom]}</Text>
                <Text style={styles.ligneNom}>{nom}</Text>
                <Text style={styles.ligneHeure}>{formatHeure(heure)}</Text>
                {rappelsDisponibles && (
                  <Switch
                    value={rappels[nom]}
                    onValueChange={(v) => basculer(nom, v)}
                    trackColor={{ true: actif ? Colors.emerald : Colors.yellow, false: Colors.border }}
                    thumbColor={Colors.card}
                    accessibilityLabel={`Rappel ${nom}`}
                  />
                )}
              </View>
            );
          })}
        </View>
        {!rappelsDisponibles && (
          <Text style={styles.note}>Les rappels de prière sont disponibles dans l’application Android et iOS.</Text>
        )}

        <Pressable style={styles.methode} onPress={() => router.push('/reglages/methode-priere')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.methodeTitre}>Méthode de calcul</Text>
            <Text style={styles.methodeSous}>Choisie par l’utilisateur</Text>
          </View>
          <View style={styles.methodeChoix}>
            <Text style={styles.methodeChoixTexte} numberOfLines={1}>
              {methode?.nom}
            </Text>
            <Ionicons name="chevron-down" size={14} color={Colors.emerald} />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  contenu: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  entete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titrePage: { fontFamily: Fonts.semibold, fontSize: 20, color: Colors.text },

  carte: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.one,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titreCarte: { fontFamily: Fonts.semibold, fontSize: 18, color: Colors.text, marginTop: Spacing.two },
  date: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, textTransform: 'capitalize' },
  cases: { flexDirection: 'row', gap: Spacing.one + 2, marginTop: Spacing.two },
  case: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  caseActive: { borderColor: Colors.yellow, borderWidth: 2, backgroundColor: '#FFF8E6' },
  caseHeure: { fontFamily: Fonts.semibold, fontSize: 11, color: Colors.text },
  caseNom: { fontFamily: Fonts.semibold, fontSize: 10, color: Colors.text },

  prochaine: { alignItems: 'center' },
  prochaineLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary },
  prochaineHeure: { fontFamily: Fonts.bold, fontSize: 40, lineHeight: 48, color: Colors.emerald },

  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ligneActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  arabe: { fontFamily: Fonts.arabic, fontSize: 16, color: Colors.text, width: 52, textAlign: 'right' },
  ligneNom: { flex: 1, fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text },
  ligneHeure: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text },
  note: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },

  methode: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  methodeTitre: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.text },
  methodeSous: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
  methodeChoix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    maxWidth: '55%',
    backgroundColor: Colors.sand,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  methodeChoixTexte: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.emerald, flexShrink: 1 },
});
