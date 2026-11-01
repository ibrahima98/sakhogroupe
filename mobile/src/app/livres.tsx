import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ComingSoon } from '@/components/coming-soon';
import { ListePublications } from '@/components/liste-publications';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { usePublications } from '@/lib/publications';

type Onglet = 'livres' | 'cours';

function Choix({ onglet }: { onglet: Onglet }) {
  return (
    <View style={styles.choix}>
      {(['livres', 'cours'] as const).map((o) => {
        const actif = o === onglet;
        return (
          <Pressable
            key={o}
            onPress={() => router.setParams({ onglet: o })}
            style={[styles.option, actif && styles.optionActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: actif }}>
            <Ionicons
              name={o === 'livres' ? 'book-outline' : 'play-circle-outline'}
              size={18}
              color={actif ? Colors.card : Colors.emerald}
            />
            <Text style={[styles.optionTexte, actif && { color: Colors.card }]}>
              {o === 'livres' ? 'Livres' : 'Cours'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Cours() {
  // Cours des sites Moodle (Almadina University, ICFA) ; ceux de l'admin viendront s'ajouter.
  const etat = usePublications({ rubriques: ['cours'], limite: 30 });
  return (
    <ListePublications
      etat={etat}
      vide="Aucun cours pour le moment."
      entete={
        <View style={{ gap: Spacing.three }}>
          <Choix onglet="cours" />
          <Text style={styles.note}>
            Cours proposés par Almadina University et ICFA Institute. L’inscription se fait sur leur site.
          </Text>
        </View>
      }
    />
  );
}

export default function LivresScreen() {
  const { onglet } = useLocalSearchParams<{ onglet?: Onglet }>();
  if (onglet === 'cours') return <Cours />;
  return (
    <View style={styles.page}>
      <View style={styles.haut}>
        <Choix onglet="livres" />
      </View>
      <ComingSoon
        title="Livres (PDF)"
        description="Les livres ajoutés par l’administrateur apparaîtront ici, avec leur couverture et un lecteur."
        icon="library-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  haut: { padding: Spacing.three, paddingBottom: 0 },
  choix: { flexDirection: 'row', backgroundColor: Colors.sand, borderRadius: Radius.pill, padding: 4 },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one + 2,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  optionActive: { backgroundColor: Colors.emerald },
  optionTexte: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.emerald },
  note: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary },
});
