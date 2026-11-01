import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

/** Logo texte en attendant le fichier officiel SAKHO GROUP SARL. */
export function Logo() {
  return (
    <View>
      <Text style={styles.name}>SAKHO</Text>
      <Text style={styles.sub}>GROUP SARL</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: Fonts.bold, fontSize: 22, letterSpacing: 2, color: Colors.emerald },
  sub: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.orange,
    marginTop: -4,
  },
});
