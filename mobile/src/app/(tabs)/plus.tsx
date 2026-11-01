import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Item = {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  href: Href;
};

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Fonctionnalités',
    items: [
      { label: 'Compteur de tasbih', icon: 'ellipse-outline', href: '/tasbih' },
      { label: 'Livres', icon: 'library-outline', href: '/livres' },
      { label: 'Cours', icon: 'play-circle-outline', href: '/livres?onglet=cours' },
      { label: 'Voyages', icon: 'airplane-outline', href: '/voyage' },
      { label: 'Nos sites', icon: 'globe-outline', href: '/sites' },
    ],
  },
  {
    title: 'Préférences',
    items: [
      { label: 'Langue', icon: 'language-outline', href: '/reglages/langue' },
      { label: 'Méthode de prière', icon: 'compass-outline', href: '/reglages/methode-priere' },
      { label: 'Notifications', icon: 'notifications-outline', href: '/reglages/notifications' },
    ],
  },
  {
    title: 'À propos',
    items: [
      { label: 'Confidentialité', icon: 'shield-checkmark-outline', href: '/reglages/confidentialite' },
      { label: 'À propos de SAKHO GROUP', icon: 'information-circle-outline', href: '/reglages/a-propos' },
      { label: 'Espace administrateur', icon: 'lock-closed-outline', href: '/reglages/admin' },
    ],
  },
];

function Row({ item }: { item: Item }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => router.push(item.href)}
      accessibilityRole="button">
      <Ionicons name={item.icon} size={22} color={Colors.emerald} />
      <Text style={styles.rowLabel}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function PlusScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Logo />
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item) => (
                <Row key={item.label} item={item} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.three, gap: Spacing.four },
  section: { gap: Spacing.two },
  sectionTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.textSecondary },
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLabel: { flex: 1, fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  pressed: { backgroundColor: Colors.background },
});
