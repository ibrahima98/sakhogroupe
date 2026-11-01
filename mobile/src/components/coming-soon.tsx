import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

/** Écran provisoire pour les pages pas encore développées. */
export function ComingSoon({ title, description, icon }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={32} color={Colors.emerald} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.badge}>En cours de développement</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.three,
  },
  panel: {
    backgroundColor: Colors.sand,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: Fonts.semibold, fontSize: 20, color: Colors.text },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  badge: {
    marginTop: Spacing.two,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.emerald,
    backgroundColor: Colors.yellow,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
});
