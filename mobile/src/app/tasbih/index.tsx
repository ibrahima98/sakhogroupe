import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router, Stack } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useMaintenant } from '@/lib/prayer';
import {
  basculerNuit,
  choisirTasbih,
  compter,
  enregistrerSeance,
  formatMinuteur,
  jourCle,
  reinitialiser,
  supprimerTasbih,
  tasbihActif,
  useTasbih,
} from '@/lib/tasbih';

const OR = '#C8960C';
const JOUR = { fond: Colors.background, texte: Colors.text, doux: Colors.textSecondary, carte: Colors.card, sable: Colors.sand };
const NUIT = { fond: '#0B241C', texte: Colors.sand, doux: '#9DB3A8', carte: '#123629', sable: '#1A4434' };

function vibrer(type: 'compte' | 'cible') {
  if (Platform.OS === 'web') return;
  if (type === 'cible') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function Minuteur({ debut, couleur }: { debut: number | null; couleur: string }) {
  const maintenant = useMaintenant();
  const secondes = debut ? Math.max(0, Math.floor((maintenant.getTime() - debut) / 1000)) : 0;
  return <Text style={[styles.minuteurTexte, { color: couleur }]}>{formatMinuteur(secondes)}</Text>;
}

function Action({
  icon,
  label,
  couleur,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  couleur: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action} accessibilityLabel={label} hitSlop={6}>
      <Ionicons name={icon} size={24} color={couleur} />
    </Pressable>
  );
}

export default function TasbihScreen() {
  // L'écran ne s'éteint pas pendant le dhikr.
  useKeepAwake();
  const etat = useTasbih();
  const tasbih = tasbihActif(etat);
  const c = etat.nuit ? NUIT : JOUR;
  const [choixOuvert, setChoixOuvert] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 2000);
    return () => clearTimeout(id);
  }, [message]);

  const toucher = () => {
    const resultat = compter();
    if (tasbih.vibration || resultat === 'cible') vibrer(resultat);
    if (resultat === 'cible') setMessage(`Série ${etat.serie} terminée`);
  };

  const enregistrer = () => {
    setMessage(enregistrerSeance() ? 'Séance enregistrée' : 'Rien à enregistrer');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.fond }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: c.fond },
          headerTintColor: etat.nuit ? Colors.sand : Colors.emerald,
        }}
      />
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.haut}>
          <Pressable style={[styles.mesTasbih, { backgroundColor: c.sable }]} onPress={() => setChoixOuvert(true)}>
            <Text style={[styles.mesTasbihTexte, { color: c.texte }]} numberOfLines={1}>
              Mes tasbih : {tasbih.nom}
            </Text>
            <Ionicons name="chevron-down" size={14} color={c.texte} />
          </Pressable>
          <Pressable style={styles.creer} onPress={() => router.push('/tasbih/creer')}>
            <Ionicons name="add" size={16} color={Colors.emerald} />
            <Text style={styles.creerTexte}>Créer</Text>
          </Pressable>
        </View>

        <View style={styles.infos}>
          <Text style={[styles.info, { color: c.texte }]}>Série : {etat.serie}</Text>
          <Text style={[styles.info, { color: c.texte }]}>Cible : {tasbih.cible}</Text>
        </View>

        <Text style={[styles.dhikr, { color: etat.nuit ? Colors.yellow : Colors.emerald }]}>{tasbih.texte}</Text>
        {!!tasbih.sens && <Text style={[styles.sens, { color: c.texte }]}>{tasbih.sens}</Text>}

        <View style={[styles.minuteur, { backgroundColor: c.carte, borderColor: c.sable }]}>
          <Minuteur debut={etat.debut} couleur={c.texte} />
        </View>

        <Text style={[styles.compteurLabel, { color: c.texte }]}>Compteur</Text>
        <Pressable onPress={toucher} accessibilityRole="button" accessibilityLabel="Compter un dhikr">
          <Text style={styles.compteur}>{String(etat.compteur).padStart(3, '0')}</Text>
        </Pressable>

        <Pressable
          onPress={toucher}
          style={({ pressed }) => [styles.zone, { backgroundColor: c.sable }, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="Toucher pour compter">
          {({ pressed }) => (
            <>
              <Text style={[styles.zoneTexte, { color: c.doux }]}>Toucher</Text>
              <View style={[styles.bouton, pressed && { transform: [{ scale: 0.92 }] }]} />
              <Text style={[styles.zoneTexte, { color: c.doux }]}>Toucher</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.message, { color: etat.nuit ? Colors.yellow : Colors.orange }]}>{message ?? ' '}</Text>

        <View style={[styles.actions, { backgroundColor: c.carte, borderColor: c.sable }]}>
          <Action icon="refresh" label="Réinitialiser" couleur={c.texte} onPress={reinitialiser} />
          <Action icon="download-outline" label="Enregistrer la séance" couleur={c.texte} onPress={enregistrer} />
          <Action icon="time-outline" label="Historique" couleur={c.texte} onPress={() => router.push('/tasbih/historique')} />
          <Action
            icon={etat.nuit ? 'sunny-outline' : 'moon-outline'}
            label={etat.nuit ? 'Mode jour' : 'Mode nuit'}
            couleur={c.texte}
            onPress={basculerNuit}
          />
        </View>

        <Text style={[styles.total, { color: c.doux }]}>
          Aujourd’hui : {etat.parJour[jourCle()] ?? 0} dhikr · Séance : {etat.totalSeance}
        </Text>
      </ScrollView>

      <Modal visible={choixOuvert} transparent animationType="slide" onRequestClose={() => setChoixOuvert(false)}>
        <Pressable style={styles.voile} onPress={() => setChoixOuvert(false)} accessibilityLabel="Fermer" />
        <SafeAreaView edges={['bottom']} style={styles.feuille}>
          <Text style={styles.feuilleTitre}>Mes tasbih</Text>
          <ScrollView style={{ maxHeight: 420 }}>
            {etat.tasbihs.map((t) => (
              <View key={t.id} style={styles.choix}>
                <Pressable
                  style={styles.choixCorps}
                  onPress={() => {
                    choisirTasbih(t.id);
                    setChoixOuvert(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: t.id === tasbih.id }}>
                  <Text style={styles.choixNom}>{t.nom}</Text>
                  <Text style={styles.choixDetails} numberOfLines={1}>
                    {t.texte} · cible {t.cible}
                  </Text>
                </Pressable>
                {t.id === tasbih.id && <Ionicons name="checkmark" size={20} color={Colors.emerald} />}
                {t.perso && (
                  <Pressable onPress={() => supprimerTasbih(t.id)} hitSlop={8} accessibilityLabel={`Supprimer ${t.nom}`}>
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </Pressable>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  contenu: { padding: Spacing.three, gap: Spacing.three, alignItems: 'stretch' },
  haut: { flexDirection: 'row', gap: Spacing.two },
  mesTasbih: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  mesTasbihTexte: { fontFamily: Fonts.medium, fontSize: 13, flexShrink: 1 },
  creer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
  },
  creerTexte: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.emerald },
  infos: { flexDirection: 'row', justifyContent: 'space-between' },
  info: { fontFamily: Fonts.regular, fontSize: 13 },
  dhikr: { fontFamily: Fonts.arabic, fontSize: 40, lineHeight: 72, textAlign: 'center' },
  sens: { fontFamily: Fonts.regular, fontSize: 14, textAlign: 'center', marginTop: -Spacing.three },
  minuteur: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  minuteurTexte: { fontFamily: Fonts.medium, fontSize: 15 },
  compteurLabel: { fontFamily: Fonts.medium, fontSize: 18, textAlign: 'center', marginTop: Spacing.two },
  compteur: {
    fontFamily: Fonts.bold,
    fontSize: 104,
    lineHeight: 120,
    color: OR,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  zone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    marginHorizontal: Spacing.two,
  },
  zoneTexte: { fontFamily: Fonts.regular, fontSize: 12 },
  bouton: { width: 56, height: 56, borderRadius: Radius.pill, backgroundColor: '#FFD563' },
  message: { fontFamily: Fonts.medium, fontSize: 13, textAlign: 'center', marginTop: -Spacing.two },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
  },
  action: { padding: Spacing.one },
  total: { fontFamily: Fonts.regular, fontSize: 12, textAlign: 'center' },

  voile: { flex: 1, backgroundColor: 'rgba(13, 58, 45, 0.35)' },
  feuille: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  feuilleTitre: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.text },
  choix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  choixCorps: { flex: 1 },
  choixNom: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  choixDetails: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
});
