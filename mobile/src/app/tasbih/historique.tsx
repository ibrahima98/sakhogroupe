import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatMinuteur, jourCle, useTasbih } from '@/lib/tasbih';

const NB_JOURS = 7;

function SeptJours({ parJour }: { parJour: Record<string, number> }) {
  const jours = Array.from({ length: NB_JOURS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (NB_JOURS - 1 - i));
    return { cle: jourCle(d), label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '') };
  });
  const max = Math.max(1, ...jours.map((j) => parJour[j.cle] ?? 0));
  return (
    <View style={styles.carte}>
      <Text style={styles.titre}>7 derniers jours</Text>
      <View style={styles.barres}>
        {jours.map((j) => {
          const n = parJour[j.cle] ?? 0;
          return (
            <View key={j.cle} style={styles.colonne} accessibilityLabel={`${j.label} : ${n} dhikr`}>
              <Text style={styles.valeur}>{n}</Text>
              <View style={styles.piste}>
                <View style={[styles.barre, { height: `${(n / max) * 100}%` }]} />
              </View>
              <Text style={styles.jour}>{j.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function HistoriqueScreen() {
  const { historique, parJour } = useTasbih();
  return (
    <FlatList
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={styles.contenu}
      data={historique}
      keyExtractor={(s) => s.id}
      ListHeaderComponent={
        <View style={{ gap: Spacing.three }}>
          <SeptJours parJour={parJour} />
          <Text style={styles.titre}>Séances enregistrées</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
      renderItem={({ item }) => (
        <View style={styles.seance}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>{item.nom}</Text>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })} ·{' '}
              {formatMinuteur(item.dureeSecondes)}
            </Text>
          </View>
          <Text style={styles.total}>{item.total}</Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.vide}>Aucune séance. Touchez l’icône d’enregistrement du compteur pour en garder une.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  contenu: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.five },
  carte: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.three },
  titre: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text },
  barres: { flexDirection: 'row', gap: Spacing.two, height: 140 },
  colonne: { flex: 1, alignItems: 'center', gap: Spacing.one },
  valeur: { fontFamily: Fonts.medium, fontSize: 10, color: Colors.textSecondary },
  piste: { flex: 1, width: '100%', maxWidth: 24, justifyContent: 'flex-end' },
  barre: { width: '100%', backgroundColor: Colors.yellow, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 2 },
  jour: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textSecondary, textTransform: 'capitalize' },
  seance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  nom: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text },
  date: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
  total: { fontFamily: Fonts.bold, fontSize: 20, color: '#C8960C' },
  vide: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
});
