import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListePublications } from '@/components/liste-publications';
import { Logo } from '@/components/logo';
import { Raccourcis } from '@/components/raccourcis';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatDuree, formatHeure, prochainePriere, useMaintenant } from '@/lib/prayer';
import { usePreferences } from '@/lib/preferences';
import { type Rubrique, usePublications } from '@/lib/publications';

// L'accueil montre l'actualité et les offres de voyage ; les cours ont leur page.
const RUBRIQUES_ACCUEIL: Rubrique[] = ['actualite', 'voyage'];

// Invocations tirées du Coran (traduction à valider avec le client).
const INVOCATIONS = [
  {
    arabe: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    francais: 'Seigneur, accorde-nous belle part ici-bas et belle part dans l’au-delà, et protège-nous du châtiment du Feu.',
    source: 'Al-Baqara, 2:201',
  },
  {
    arabe: 'رَبِّ زِدْنِي عِلْمًا',
    francais: 'Seigneur, accrois mes connaissances.',
    source: 'Ta-Ha, 20:114',
  },
  {
    arabe: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    francais: 'Allah nous suffit ; Il est notre meilleur garant.',
    source: 'Al-Imran, 3:173',
  },
];

function invocationDuJour(date: Date) {
  const jour = Math.floor(date.getTime() / 86_400_000);
  return INVOCATIONS[jour % INVOCATIONS.length];
}

function PrayerBanner() {
  const maintenant = useMaintenant();
  const { methodePriere, lieu } = usePreferences();
  const { nom, heure } = prochainePriere(lieu, maintenant, methodePriere);
  const date = maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Link href="/prieres" asChild>
      <Pressable style={styles.priere}>
        <View style={styles.priereHaut}>
          <Text style={styles.priereLieu}>
            <Ionicons name="location-outline" size={13} /> {lieu.nom}
          </Text>
          <Text style={styles.priereDate}>{date}</Text>
        </View>
        <Text style={styles.priereLabel}>Prochaine prière · {nom}</Text>
        <Text style={styles.priereHeure}>{formatHeure(heure)}</Text>
        <Text style={styles.priereReste}>Temps restant {formatDuree(heure.getTime() - maintenant.getTime())}</Text>
      </Pressable>
    </Link>
  );
}

function Invocation() {
  const inv = invocationDuJour(new Date());
  return (
    <View style={styles.invocation}>
      <Text style={styles.sectionTitre}>Invocation du jour</Text>
      <Text style={styles.arabe}>{inv.arabe}</Text>
      <Text style={styles.invFr}>{inv.francais}</Text>
      <Text style={styles.invSource}>{inv.source}</Text>
    </View>
  );
}

export default function AccueilScreen() {
  const etat = usePublications({ rubriques: RUBRIQUES_ACCUEIL, limite: 20 });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ListePublications
        etat={etat}
        entete={
          <View style={styles.entete}>
            <Logo />
            <PrayerBanner />
            <Raccourcis />
            <Text style={styles.sectionTitre}>Dernières publications</Text>
          </View>
        }
        pied={<Invocation />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  entete: { gap: Spacing.three },
  sectionTitre: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.text },

  priere: { backgroundColor: Colors.emerald, borderRadius: Radius.lg, padding: Spacing.three + 4, gap: 2 },
  priereHaut: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.two },
  priereLieu: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.sand },
  priereDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.sand, textTransform: 'capitalize' },
  priereLabel: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.yellow },
  priereHeure: { fontFamily: Fonts.bold, fontSize: 40, color: Colors.card, lineHeight: 48 },
  priereReste: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.sand },

  invocation: {
    marginTop: Spacing.four,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
    borderLeftWidth: 4,
    borderLeftColor: Colors.yellow,
  },
  arabe: { fontFamily: Fonts.arabic, fontSize: 22, lineHeight: 40, color: Colors.emerald, textAlign: 'right', writingDirection: 'rtl' },
  invFr: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: Colors.text },
  invSource: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.orange },
});
