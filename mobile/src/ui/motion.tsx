import { ReactNode, useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * Fade-up entrance — mirrors the web's framer-motion
 * `{ opacity:0, y:24 } → { opacity:1, y:0 }`.
 *
 * Driven by a mount effect (not reanimated layout `entering`), which is
 * reliable on native-stack pushed screens — layout entering animations can
 * otherwise leave a pushed screen's content stuck invisible.
 */
export function FadeUp({
  children,
  delay = 0,
  distance = 24,
  duration = 560,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: EASE }));
  }, []);
  const a = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * distance }],
  }));
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}

export function Fade({
  children,
  delay = 0,
  duration = 600,
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: EASE }));
  }, []);
  const a = useAnimatedStyle(() => ({ opacity: p.value }));
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}
