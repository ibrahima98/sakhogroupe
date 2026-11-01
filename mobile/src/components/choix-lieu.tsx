import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { lieuActuel } from '@/lib/localisation';
import { VILLES } from '@/lib/prayer';
import { modifierPreferences, usePreferences } from '@/lib/preferences';

/** Bouton « Dakar, Sénégal ⌄ » qui ouvre le choix : position GPS ou ville. */
export function ChoixLieu() {
  const { lieu, lieuGps } = usePreferences();
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const utiliserGps = async () => {
    setRecherche(true);
    setErreur(null);
    try {
      modifierPreferences({ lieu: await lieuActuel(), lieuGps: true });
      setOuvert(false);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Position introuvable.');
    } finally {
      setRecherche(false);
    }
  };

  return (
    <>
      <Pressable style={styles.pastille} onPress={() => setOuvert(true)} accessibilityRole="button">
        <Ionicons name={lieuGps ? 'navigate' : 'location-outline'} size={14} color={Colors.emerald} />
        <Text style={styles.pastilleTexte} numberOfLines={1}>
          {lieu.nom}
        </Text>
        <Ionicons name="chevron-down" size={14} color={Colors.emerald} />
      </Pressable>

      <Modal visible={ouvert} transparent animationType="slide" onRequestClose={() => setOuvert(false)}>
        <Pressable style={styles.voile} onPress={() => setOuvert(false)} accessibilityLabel="Fermer" />
        <SafeAreaView edges={['bottom']} style={styles.feuille}>
          <Text style={styles.titre}>Lieu pour le calcul</Text>
          <Pressable style={styles.gps} onPress={utiliserGps} disabled={recherche}>
            {recherche ? (
              <ActivityIndicator color={Colors.emerald} />
            ) : (
              <Ionicons name="navigate" size={18} color={Colors.emerald} />
            )}
            <Text style={styles.gpsTexte}>Utiliser ma position</Text>
          </Pressable>
          {erreur && <Text style={styles.erreur}>{erreur}</Text>}
          <ScrollView style={{ maxHeight: 360 }}>
            {VILLES.map((v) => {
              const choisi = !lieuGps && v.nom === lieu.nom;
              return (
                <Pressable
                  key={v.nom}
                  style={styles.ville}
                  onPress={() => {
                    modifierPreferences({ lieu: v, lieuGps: false });
                    setOuvert(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: choisi }}>
                  <Text style={styles.villeTexte}>{v.nom}</Text>
                  {choisi && <Ionicons name="checkmark" size={20} color={Colors.emerald} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pastille: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  pastilleTexte: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.text, flexShrink: 1 },
  voile: { flex: 1, backgroundColor: 'rgba(13, 58, 45, 0.35)' },
  feuille: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  titre: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.text },
  gps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.yellow,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  gpsTexte: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.emerald },
  erreur: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.danger },
  ville: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  villeTexte: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
});
