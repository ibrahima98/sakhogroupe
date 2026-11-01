import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Publication } from '@/lib/publications';

type Props = {
  publication: Publication | null;
  onClose: () => void;
  onOpenSite: (publication: Publication) => void;
};

/** Photo affichée en grand. */
export function ImageViewer({ publication, onClose, onOpenSite }: Props) {
  return (
    <Modal visible={!!publication} animationType="fade" onRequestClose={onClose} transparent>
      <SafeAreaView style={styles.fond}>
        <Pressable onPress={onClose} style={styles.fermer} accessibilityLabel="Fermer" hitSlop={12}>
          <Ionicons name="close" size={28} color={Colors.card} />
        </Pressable>
        {publication?.affiche && (
          <Image source={publication.affiche} style={styles.image} contentFit="contain" />
        )}
        {publication && (
          <View style={styles.bas}>
            <Text style={styles.titre}>{publication.titre}</Text>
            <Pressable onPress={() => onOpenSite(publication)} style={styles.bouton}>
              <Text style={styles.boutonTexte}>Lire sur le site</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.92)', justifyContent: 'center' },
  fermer: { position: 'absolute', top: Spacing.five, right: Spacing.three, zIndex: 1 },
  image: { width: '100%', flex: 1 },
  bas: { padding: Spacing.three, gap: Spacing.three },
  titre: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.card },
  bouton: {
    backgroundColor: Colors.yellow,
    borderRadius: 999,
    paddingVertical: Spacing.two + 2,
    alignItems: 'center',
  },
  boutonTexte: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.emerald },
});
