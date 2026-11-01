import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

type Props = {
  titre: string;
  details?: string;
  choisi: boolean;
  desactive?: boolean;
  onPress?: () => void;
};

/** Ligne d'une liste à choix unique (langue, méthode de prière…). */
export function OptionRow({ titre, details, choisi, desactive, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desactive}
      style={({ pressed }) => [styles.ligne, pressed && { backgroundColor: Colors.background }]}
      accessibilityRole="radio"
      accessibilityState={{ checked: choisi, disabled: desactive }}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.titre, desactive && { color: Colors.textSecondary }]}>{titre}</Text>
        {details && <Text style={styles.details}>{details}</Text>}
      </View>
      <Ionicons
        name={choisi ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={desactive ? Colors.border : Colors.emerald}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  titre: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  details: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
