import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { NOMS_ARABES, ORDRE, type NomPriere } from '@/lib/prayer';
import { modifierPreferences, usePreferences } from '@/lib/preferences';
import { autoriserRappels, rappelsDisponibles } from '@/lib/rappels';

export default function NotificationsScreen() {
  const { rappels, lieu } = usePreferences();

  const basculer = async (nom: NomPriere, actif: boolean) => {
    if (actif && !(await autoriserRappels())) return;
    modifierPreferences({ rappels: { ...rappels, [nom]: actif } });
  };

  return (
    <ScrollView contentContainerStyle={styles.contenu}>
      <Text style={styles.intro}>
        {rappelsDisponibles
          ? `Un rappel à l’heure de chaque prière activée, calculée pour ${lieu.nom}. Les rappels fonctionnent sans connexion.`
          : 'Les rappels de prière sont disponibles dans l’application Android et iOS.'}
      </Text>
      <View style={styles.carte}>
        {ORDRE.map((nom) => (
          <View key={nom} style={styles.ligne}>
            <Text style={styles.nom}>{nom}</Text>
            <Text style={styles.arabe}>{NOMS_ARABES[nom]}</Text>
            <Switch
              value={rappels[nom]}
              disabled={!rappelsDisponibles}
              onValueChange={(v) => basculer(nom, v)}
              trackColor={{ true: Colors.yellow, false: Colors.border }}
              thumbColor={Colors.card}
              accessibilityLabel={`Rappel ${nom}`}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: Spacing.three, gap: Spacing.three },
  intro: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, color: Colors.textSecondary },
  carte: { backgroundColor: Colors.card, borderRadius: Radius.md, overflow: 'hidden' },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  nom: { flex: 1, fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  arabe: { fontFamily: Fonts.arabic, fontSize: 16, color: Colors.textSecondary },
});
