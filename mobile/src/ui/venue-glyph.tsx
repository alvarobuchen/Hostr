import { View, StyleSheet } from 'react-native';
import { palette, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';

/** Branded fallback header for venues without photography —
 *  a deep navy field with a soft gold bloom and the venue initial. */
export function VenueGlyph({ initial, height }: { initial: string; height?: number }) {
  return (
    <View style={[styles.wrap, height ? { height } : StyleSheet.absoluteFillObject]}>
      <View style={styles.bloom} />
      <View style={styles.bloom2} />
      <Txt style={styles.initial}>{initial.toUpperCase()}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bloom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(176,131,46,0.28)',
    top: -60,
    right: -60,
  },
  bloom2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(216,176,97,0.14)',
    bottom: -50,
    left: -40,
  },
  initial: {
    fontFamily: fonts.serif,
    fontSize: 80,
    fontWeight: '600',
    color: 'rgba(245,241,232,0.92)',
  },
});
