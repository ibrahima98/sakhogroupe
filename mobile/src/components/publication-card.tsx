import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { dateRelative, nomSite, type Publication } from '@/lib/publications';

type Props = {
  publication: Publication;
  onPress: (publication: Publication) => void;
};

/** Carte unique pour image et vidéo : affiche 16:9, badge, titre sur 2 lignes, site, date. */
export function PublicationCard({ publication, onPress }: Props) {
  const estVideo = publication.type === 'video';
  return (
    <Pressable
      onPress={() => onPress(publication)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${estVideo ? 'Vidéo' : 'Photo'} : ${publication.titre}`}>
      <View style={styles.afficheBox}>
        {publication.affiche ? (
          <Image source={publication.affiche} style={styles.affiche} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.affiche, styles.sansAffiche]}>
            <Ionicons name={estVideo ? 'videocam-outline' : 'image-outline'} size={36} color={Colors.textSecondary} />
          </View>
        )}
        {estVideo && (
          <View style={styles.play}>
            <Ionicons name="play" size={22} color={Colors.emerald} />
          </View>
        )}
        <Text style={styles.badge}>{estVideo ? (publication.duree ?? 'Vidéo') : 'Photo'}</Text>
      </View>
      <View style={styles.texte}>
        <Text style={styles.titre} numberOfLines={2}>
          {publication.titre}
        </Text>
        <Text style={styles.meta}>
          {nomSite(publication.site)}
          {/* Les cours Moodle n'ont pas de date de publication : on ne l'affiche pas. */}
          {publication.rubrique === 'cours' ? ' · Cours' : ` · ${dateRelative(publication.date)}`}
        </Text>
      </View>
    </Pressable>
  );
}

/** Carte grisée affichée pendant le chargement. */
export function PublicationCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={[styles.affiche, { backgroundColor: Colors.skeleton }]} />
      <View style={styles.texte}>
        <View style={[styles.ligne, { width: '90%' }]} />
        <View style={[styles.ligne, { width: '40%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, overflow: 'hidden' },
  pressed: { opacity: 0.85 },
  afficheBox: { position: 'relative' },
  affiche: { width: '100%', aspectRatio: 16 / 9, backgroundColor: Colors.sand },
  sansAffiche: { alignItems: 'center', justifyContent: 'center' },
  play: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 48,
    height: 48,
    marginTop: -24,
    marginLeft: -24,
    borderRadius: Radius.pill,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  badge: {
    position: 'absolute',
    right: Spacing.two,
    bottom: Spacing.two,
    backgroundColor: 'rgba(13, 58, 45, 0.85)',
    color: Colors.card,
    fontFamily: Fonts.medium,
    fontSize: 11,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  texte: { padding: Spacing.three, gap: Spacing.one },
  titre: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 21, color: Colors.text },
  meta: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
  ligne: { height: 12, borderRadius: 6, backgroundColor: Colors.skeleton, marginVertical: 3 },
});
