import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ListePublications } from '@/components/liste-publications';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { usePublications } from '@/lib/publications';
import { SITES } from '@/lib/sites';

/** Un bouton par site ; les 3 dernières publications du site choisi. */
export default function SitesScreen() {
  const [slug, setSlug] = useState(SITES[0].slug);
  const site = SITES.find((s) => s.slug === slug) ?? SITES[0];
  const etat = usePublications({ site: slug, limite: 3 });

  return (
    <ListePublications
      etat={etat}
      vide="Pas encore de publication récupérée pour ce site."
      entete={
        <View style={styles.entete}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.puces}>
            {SITES.map((s) => {
              const actif = s.slug === slug;
              return (
                <Pressable
                  key={s.slug}
                  onPress={() => setSlug(s.slug)}
                  style={[styles.puce, actif && styles.puceActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: actif }}>
                  <Ionicons name={s.icon} size={16} color={actif ? Colors.card : Colors.emerald} />
                  <Text style={[styles.puceTexte, actif && { color: Colors.card }]}>{s.nom}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.carte}>
            <Text style={styles.nom}>{site.nom}</Text>
            <Text style={styles.description}>{site.description}</Text>
            <Pressable style={styles.bouton} onPress={() => WebBrowser.openBrowserAsync(site.url)}>
              <Ionicons name="open-outline" size={16} color={Colors.emerald} />
              <Text style={styles.boutonTexte}>Ouvrir le site</Text>
            </Pressable>
          </View>

          <Text style={styles.titre}>3 dernières publications</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  entete: { gap: Spacing.three },
  puces: { gap: Spacing.two },
  puce: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  puceActive: { backgroundColor: Colors.emerald },
  puceTexte: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.emerald },
  carte: { backgroundColor: Colors.sand, borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.one },
  nom: { fontFamily: Fonts.semibold, fontSize: 18, color: Colors.text },
  description: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary },
  bouton: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  boutonTexte: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.emerald },
  titre: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.text },
});
