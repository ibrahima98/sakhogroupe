import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { OptionRow } from '@/components/option-row';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

// Les langues de l'application restent à valider avec le client (cahier des charges).
const LANGUES = [
  { id: 'fr', nom: 'Français', details: 'Langue actuelle', dispo: true },
  { id: 'ar', nom: 'العربية', details: 'Bientôt disponible', dispo: false },
  { id: 'en', nom: 'English', details: 'Bientôt disponible', dispo: false },
  { id: 'wo', nom: 'Wolof', details: 'Bientôt disponible', dispo: false },
];

export default function LangueScreen() {
  return (
    <ScrollView contentContainerStyle={styles.contenu}>
      <View style={styles.carte}>
        {LANGUES.map((l) => (
          <OptionRow key={l.id} titre={l.nom} details={l.details} choisi={l.id === 'fr'} desactive={!l.dispo} />
        ))}
      </View>
      <Text style={styles.note}>D’autres langues seront ajoutées dans une prochaine version.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: Spacing.three, gap: Spacing.three },
  carte: { backgroundColor: Colors.card, borderRadius: Radius.md, overflow: 'hidden' },
  note: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary },
});
