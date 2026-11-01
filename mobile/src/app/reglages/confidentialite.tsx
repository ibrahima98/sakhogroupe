import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

// Brouillon de politique de confidentialité : à faire relire et valider par SAKHO GROUP
// avant la publication sur Google Play et l'App Store.
const SECTIONS = [
  {
    titre: 'Sans compte',
    texte:
      'Vous utilisez l’application sans créer de compte. Nous ne collectons ni votre nom, ni votre e-mail, ni votre numéro pour lire les contenus.',
  },
  {
    titre: 'Localisation',
    texte:
      'Votre position sert uniquement à calculer les heures de prière, directement sur votre téléphone. Elle n’est jamais envoyée à nos serveurs.',
  },
  {
    titre: 'Données gardées sur le téléphone',
    texte:
      'Vos préférences (méthode de prière), vos tasbih et les dernières publications consultées sont enregistrés sur votre téléphone pour fonctionner hors ligne. Les supprimer revient à effacer les données de l’application.',
  },
  {
    titre: 'Demandes de voyage',
    texte:
      'Si vous envoyez une demande de voyage, les informations saisies (nom, téléphone, e-mail, message) sont transmises à l’agence pour vous répondre, et conservées sur notre serveur.',
  },
  {
    titre: 'Contenus des sites',
    texte:
      'Les publications proviennent des sites de SAKHO GROUP. En ouvrant un lien, vous consultez le site concerné, soumis à sa propre politique.',
  },
];

export default function ConfidentialiteScreen() {
  return (
    <ScrollView contentContainerStyle={styles.contenu}>
      {SECTIONS.map((s) => (
        <View key={s.titre} style={styles.carte}>
          <Text style={styles.titre}>{s.titre}</Text>
          <Text style={styles.texte}>{s.texte}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: Spacing.three, gap: Spacing.three },
  carte: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.three, gap: Spacing.one },
  titre: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text },
  texte: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
});
