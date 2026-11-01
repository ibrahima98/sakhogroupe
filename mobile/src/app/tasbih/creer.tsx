import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ComponentProps, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { CIBLES, creerTasbih } from '@/lib/tasbih';

const MAX_CIBLE = 100_000;

function Champ({
  label,
  ...props
}: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.champ}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={Colors.textSecondary} style={styles.input} {...props} />
    </View>
  );
}

export default function CreerTasbihScreen() {
  const [nom, setNom] = useState('');
  const [texte, setTexte] = useState('');
  const [sens, setSens] = useState('');
  const [cible, setCible] = useState(33);
  const [autre, setAutre] = useState('');
  const [vibration, setVibration] = useState(true);
  const [tente, setTente] = useState(false);

  const cibleAutre = Number(autre);
  const cibleFinale = autre ? cibleAutre : cible;
  const erreurs = {
    nom: !nom.trim() ? 'Donnez un nom à votre tasbih.' : null,
    texte: !texte.trim() ? 'Écrivez le texte du dhikr.' : null,
    cible:
      !Number.isInteger(cibleFinale) || cibleFinale < 1 || cibleFinale > MAX_CIBLE
        ? `Nombre entre 1 et ${MAX_CIBLE.toLocaleString('fr-FR')}.`
        : null,
  };
  const valide = !erreurs.nom && !erreurs.texte && !erreurs.cible;

  const enregistrer = () => {
    setTente(true);
    if (!valide) return;
    creerTasbih({ nom: nom.trim(), texte: texte.trim(), sens: sens.trim(), cible: cibleFinale, vibration });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <View style={styles.apercu}>
          <Text style={styles.apercuLabel}>Aperçu</Text>
          <Text style={styles.apercuTexte}>{texte.trim() || 'سُبْحَانَ ٱللَّهِ'}</Text>
          <Text style={styles.apercuSens}>
            {/* Exemple affiché seulement tant que rien n'est saisi. */}
            {[sens.trim() || (texte.trim() ? '' : 'Gloire à Allah'), `cible ${erreurs.cible ? '?' : cibleFinale}`]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>

        <Champ label="Nom du tasbih" placeholder="Mon tasbih du matin" value={nom} onChangeText={setNom} maxLength={40} />
        {tente && erreurs.nom && <Text style={styles.erreur}>{erreurs.nom}</Text>}

        <Champ
          label="Texte du dhikr (arabe ou français)"
          placeholder="سُبْحَانَ ٱللَّهِ"
          value={texte}
          onChangeText={setTexte}
          maxLength={200}
        />
        {tente && erreurs.texte && <Text style={styles.erreur}>{erreurs.texte}</Text>}

        <Champ label="Sens / traduction (facultatif)" placeholder="Gloire à Allah" value={sens} onChangeText={setSens} maxLength={200} />

        <View style={styles.champ}>
          <Text style={styles.label}>Nombre de répétitions</Text>
          <View style={styles.cibles}>
            {CIBLES.map((n) => {
              const actif = !autre && cible === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => {
                    setCible(n);
                    setAutre('');
                  }}
                  style={[styles.puce, actif && styles.puceActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: actif }}>
                  <Text style={[styles.puceTexte, actif && styles.puceTexteActif]}>{n}</Text>
                </Pressable>
              );
            })}
            <View style={[styles.puce, styles.autre, !!autre && styles.puceActive]}>
              <Text style={[styles.puceTexte, !!autre && styles.puceTexteActif]}>Autre :</Text>
              <TextInput
                value={autre}
                onChangeText={(v) => setAutre(v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                placeholder="250"
                placeholderTextColor={Colors.textSecondary}
                style={styles.autreInput}
                maxLength={6}
                accessibilityLabel="Autre nombre de répétitions"
              />
            </View>
          </View>
          {tente && erreurs.cible && <Text style={styles.erreur}>{erreurs.cible}</Text>}
        </View>

        <View style={styles.vibration}>
          <Text style={styles.vibrationTexte}>Vibration à chaque dhikr</Text>
          <Switch
            value={vibration}
            onValueChange={setVibration}
            trackColor={{ true: Colors.yellow, false: Colors.border }}
            thumbColor={Colors.card}
          />
        </View>

        <Pressable style={({ pressed }) => [styles.enregistrer, pressed && { opacity: 0.85 }]} onPress={enregistrer}>
          <Ionicons name="checkmark" size={18} color={Colors.emerald} />
          <Text style={styles.enregistrerTexte}>Enregistrer mon tasbih</Text>
        </Pressable>
        <Text style={styles.note}>Vos tasbih enregistrés apparaissent dans « Mes tasbih »</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  contenu: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  apercu: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  apercuLabel: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.orange },
  apercuTexte: { fontFamily: Fonts.arabic, fontSize: 30, lineHeight: 54, color: Colors.emerald, textAlign: 'center' },
  apercuSens: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  champ: { gap: Spacing.one + 2 },
  label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.text },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
  },
  erreur: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.danger, marginTop: -Spacing.two },
  cibles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  puce: {
    backgroundColor: Colors.sand,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
  },
  puceActive: { backgroundColor: Colors.yellow },
  puceTexte: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.text },
  puceTexteActif: { color: Colors.emerald, fontFamily: Fonts.semibold },
  autre: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingVertical: 0 },
  autreInput: { width: 64, paddingVertical: Spacing.two, fontFamily: Fonts.medium, fontSize: 14, color: Colors.text },
  vibration: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vibrationTexte: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.text },
  enregistrer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.three,
  },
  enregistrerTexte: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.emerald },
  note: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
});
