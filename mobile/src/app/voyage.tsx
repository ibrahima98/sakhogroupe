import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ListePublications } from '@/components/liste-publications';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { usePublications } from '@/lib/publications';

const AGENCE = 'https://almadinatravel.net';

/** Offres d'Almadina Travel (Omra, Hajj). Le formulaire de demande viendra ensuite. */
export default function VoyageScreen() {
  const etat = usePublications({ rubriques: ['voyage'], limite: 20 });

  return (
    <ListePublications
      etat={etat}
      vide="Aucune offre de voyage pour le moment."
      entete={
        <View style={styles.banniere}>
          <Text style={styles.titre}>Omra et Hajj avec Almadina Travel</Text>
          <Text style={styles.texte}>
            Forfaits avec vols, hébergement, visas, transport entre Médine et La Mecque et accompagnement.
          </Text>
          <Pressable style={styles.bouton} onPress={() => WebBrowser.openBrowserAsync(AGENCE)}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.emerald} />
            <Text style={styles.boutonTexte}>Demander des infos</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  banniere: { backgroundColor: Colors.emerald, borderRadius: Radius.lg, padding: Spacing.three + 4, gap: Spacing.two },
  titre: { fontFamily: Fonts.semibold, fontSize: 18, color: Colors.card },
  texte: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, color: Colors.sand },
  bouton: {
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
});
