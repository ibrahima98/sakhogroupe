import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { OptionRow } from '@/components/option-row';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { METHODES } from '@/lib/prayer';
import { modifierPreferences, usePreferences } from '@/lib/preferences';

export default function MethodePriereScreen() {
  const { methodePriere } = usePreferences();
  return (
    <ScrollView contentContainerStyle={styles.contenu}>
      <Text style={styles.intro}>
        La méthode fixe l’angle du soleil utilisé pour Fajr et Isha. Les horaires de l’accueil se mettent à jour
        aussitôt.
      </Text>
      <View style={styles.carte}>
        {METHODES.map((m) => (
          <OptionRow
            key={m.id}
            titre={m.nom}
            details={m.details}
            choisi={m.id === methodePriere}
            onPress={() => modifierPreferences({ methodePriere: m.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: Spacing.three, gap: Spacing.three },
  intro: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, color: Colors.textSecondary },
  carte: { backgroundColor: Colors.card, borderRadius: Radius.md, overflow: 'hidden' },
});
