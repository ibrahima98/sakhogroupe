import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { type ComponentProps, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Fonctionnalite = {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  href: Href;
  couleur: string; // icône
  fond: string; // tuile
};

const VERT = { couleur: Colors.emerald, fond: '#DCEBE3' };
const JAUNE = { couleur: '#9A6B00', fond: '#FFF1C7' };
const ORANGE = { couleur: Colors.orange, fond: '#F8E2CC' };

// Toutes les fonctionnalités ; les 3 premières sont affichées sur l'accueil.
const FONCTIONNALITES: Fonctionnalite[] = [
  { label: 'Sites', icon: 'globe-outline', href: '/sites', ...VERT },
  { label: 'Tasbih', icon: 'ellipse-outline', href: '/tasbih', ...JAUNE },
  { label: 'Voyage', icon: 'airplane-outline', href: '/voyage', ...ORANGE },
  { label: 'Coran', icon: 'book-outline', href: '/coran', ...VERT },
  { label: 'Prières', icon: 'time-outline', href: '/prieres', ...JAUNE },
  { label: 'Livres', icon: 'library-outline', href: '/livres', ...ORANGE },
  { label: 'Cours', icon: 'play-circle-outline', href: '/livres?onglet=cours', ...VERT },
  { label: 'Réglages', icon: 'settings-outline', href: '/plus', ...JAUNE },
];

const NB_VISIBLES = 3;

function Tuile({
  label,
  icon,
  couleur,
  fond,
  onPress,
}: Pick<Fonctionnalite, 'label' | 'icon' | 'couleur' | 'fond'> & { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tuile, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={[styles.carre, { backgroundColor: fond }]}>
        <Ionicons name={icon} size={28} color={couleur} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Raccourcis à la manière de Wave : 3 tuiles + « Plus » qui ouvre toutes les fonctionnalités. */
export function Raccourcis() {
  const [ouvert, setOuvert] = useState(false);

  const aller = (href: Href) => {
    setOuvert(false);
    router.push(href);
  };

  return (
    <>
      <View style={styles.rangee}>
        {FONCTIONNALITES.slice(0, NB_VISIBLES).map((f) => (
          <Tuile key={f.label} {...f} onPress={() => aller(f.href)} />
        ))}
        <Tuile label="Plus" icon="grid-outline" couleur={Colors.card} fond={Colors.emerald} onPress={() => setOuvert(true)} />
      </View>

      <Modal visible={ouvert} transparent animationType="slide" onRequestClose={() => setOuvert(false)}>
        <Pressable style={styles.voile} onPress={() => setOuvert(false)} accessibilityLabel="Fermer" />
        <SafeAreaView edges={['bottom']} style={styles.feuille}>
          <View style={styles.poignee} />
          <Text style={styles.titre}>Toutes les fonctionnalités</Text>
          <View style={styles.grille}>
            {FONCTIONNALITES.map((f) => (
              <Tuile key={f.label} {...f} onPress={() => aller(f.href)} />
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  rangee: { flexDirection: 'row', justifyContent: 'space-between' },
  tuile: { width: '25%', alignItems: 'center', gap: Spacing.one + 2 },
  carre: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.text },

  voile: { flex: 1, backgroundColor: 'rgba(13, 58, 45, 0.35)' },
  feuille: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  poignee: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginVertical: Spacing.two + 2,
  },
  titre: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.text, marginBottom: Spacing.three },
  grille: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.four },
});
