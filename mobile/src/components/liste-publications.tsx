import * as WebBrowser from 'expo-web-browser';
import { type ReactElement, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ImageViewer } from '@/components/image-viewer';
import { PublicationCard, PublicationCardSkeleton } from '@/components/publication-card';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { Publication, usePublications } from '@/lib/publications';

type Props = {
  etat: ReturnType<typeof usePublications>;
  entete?: ReactElement;
  pied?: ReactElement;
  vide?: string;
};

/**
 * Liste de publications commune (accueil, sites, cours, voyage) : cartes grisées au
 * chargement, erreur avec « Réessayer », mémoire hors ligne, tirer pour actualiser.
 * Une vidéo s'ouvre dans le lecteur du site, une photo s'affiche en grand.
 */
export function ListePublications({ etat, entete, pied, vide = 'Aucune publication pour le moment.' }: Props) {
  const { publications, chargement, erreur, depuisCache, actualiser } = etat;
  const [photo, setPhoto] = useState<Publication | null>(null);
  const premierChargement = chargement && publications.length === 0;

  const ouvrir = (p: Publication) => {
    if (p.type === 'video') WebBrowser.openBrowserAsync(p.media_url ?? p.url);
    else if (p.affiche) setPhoto(p);
    else WebBrowser.openBrowserAsync(p.url);
  };

  return (
    <>
      <FlatList
        data={premierChargement ? [] : publications}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PublicationCard publication={item} onPress={ouvrir} />}
        contentContainerStyle={styles.contenu}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.three }} />}
        refreshControl={<RefreshControl refreshing={chargement && !premierChargement} onRefresh={actualiser} />}
        ListHeaderComponent={
          <View style={styles.entete}>
            {entete}
            {erreur && (
              <View style={styles.erreur}>
                <Text style={styles.erreurTexte}>
                  {depuisCache
                    ? 'Hors ligne : voici les dernières publications gardées en mémoire.'
                    : `Impossible de charger les publications. ${erreur}`}
                </Text>
                <Pressable onPress={actualiser} style={styles.reessayer}>
                  <Text style={styles.reessayerTexte}>Réessayer</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          premierChargement ? (
            <View style={{ gap: Spacing.three }}>
              <PublicationCardSkeleton />
              <PublicationCardSkeleton />
            </View>
          ) : erreur ? undefined : (
            <Text style={styles.vide}>{vide}</Text>
          )
        }
        ListFooterComponent={pied}
      />
      <ImageViewer
        publication={photo}
        onClose={() => setPhoto(null)}
        onOpenSite={(p) => WebBrowser.openBrowserAsync(p.url)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: Spacing.three, paddingBottom: Spacing.five },
  entete: { gap: Spacing.three, marginBottom: Spacing.three },
  erreur: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.three, gap: Spacing.two },
  erreurTexte: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.danger },
  reessayer: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  reessayerTexte: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.emerald },
  vide: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
