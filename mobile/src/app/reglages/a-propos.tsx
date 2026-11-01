import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/logo';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { SITES } from '@/lib/sites';

export default function AProposScreen() {
  return (
    <ScrollView contentContainerStyle={styles.contenu}>
      <View style={styles.entete}>
        <Logo />
        <Text style={styles.texte}>
          L’application de SAKHO GROUP SARL regroupe les actualités, cours et offres de ses sites, avec le Coran,
          les heures de prière et le tasbih.
        </Text>
      </View>

      <Text style={styles.titre}>Nos sites</Text>
      <View style={styles.carte}>
        {SITES.map((s) => (
          <Pressable
            key={s.slug}
            style={({ pressed }) => [styles.ligne, pressed && { backgroundColor: Colors.background }]}
            onPress={() => WebBrowser.openBrowserAsync(s.url)}
            accessibilityRole="link">
            <Ionicons name={s.icon} size={22} color={Colors.emerald} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nom}>{s.nom}</Text>
              <Text style={styles.description}>{s.description}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.version}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: Spacing.three, gap: Spacing.three },
  entete: { backgroundColor: Colors.sand, borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.three },
  texte: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, color: Colors.text },
  titre: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.textSecondary },
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
  nom: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  description: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
  version: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
});
