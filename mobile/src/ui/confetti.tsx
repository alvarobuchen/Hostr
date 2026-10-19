import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { palette } from '@/theme/tokens';

const DOTS = [
  { x: 0.12, y: 0.18, s: 7, c: palette.gold, d: 0 },
  { x: 0.82, y: 0.14, s: 5, c: palette.goldSoft, d: 400 },
  { x: 0.24, y: 0.62, s: 4, c: palette.gold, d: 900 },
  { x: 0.7, y: 0.72, s: 6, c: palette.goldSoft, d: 200 },
  { x: 0.5, y: 0.1, s: 4, c: palette.gold, d: 1200 },
  { x: 0.9, y: 0.5, s: 5, c: palette.gold, d: 700 },
  { x: 0.08, y: 0.44, s: 5, c: palette.goldSoft, d: 500 },
  { x: 0.42, y: 0.82, s: 4, c: palette.gold, d: 1000 },
  { x: 0.62, y: 0.32, s: 3, c: palette.goldSoft, d: 300 },
];

function Dot({ x, y, s, c, d }: (typeof DOTS)[number]) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      d,
      withRepeat(withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -10 + t.value * 20 }],
    opacity: 0.35 + t.value * 0.5,
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: c,
        },
        style,
      ]}
    />
  );
}

/** Floating gold confetti field for the hero backdrop. */
export function Confetti() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {DOTS.map((dot, i) => (
        <Dot key={i} {...dot} />
      ))}
    </View>
  );
}
