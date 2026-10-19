import { View, Text, StyleSheet } from 'react-native';
import { palette, fonts } from '@/theme/tokens';

/**
 * Cenit logotype — lowercase "cenit" in a serif face, with the signature
 * antique-gold dot replacing the tittle on the "i" ("el punto más alto").
 * Rebuilt from live type so it scales crisply. Size via `size` (font px).
 */
export function Logo({ size = 26, tone = 'navy' }: { size?: number; tone?: 'navy' | 'cream' }) {
  const color = tone === 'cream' ? palette.cream : palette.ink1;
  const dot = Math.max(3, size * 0.16);
  return (
    <View style={styles.row}>
      <Text style={[styles.word, { fontSize: size, color }]}>cen</Text>
      <View style={{ position: 'relative' }}>
        <Text style={[styles.word, { fontSize: size, color }]}>ı</Text>
        <View
          style={{
            position: 'absolute',
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: palette.gold,
            left: '50%',
            marginLeft: -dot / 2,
            top: -size * 0.16,
          }}
        />
      </View>
      <Text style={[styles.word, { fontSize: size, color }]}>t</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  word: {
    fontFamily: fonts.serif,
    fontWeight: '600',
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
});
