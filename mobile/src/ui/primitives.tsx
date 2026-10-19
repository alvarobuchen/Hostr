import { useEffect } from 'react';
import {
  Pressable,
  View,
  ViewProps,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { palette, radius, space, cardShadow, goldShadow, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';

/* ─── Button ─────────────────────────────────── */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  full,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pad =
    size === 'lg'
      ? { paddingVertical: 15, paddingHorizontal: 28 }
      : size === 'sm'
        ? { paddingVertical: 8, paddingHorizontal: 15 }
        : { paddingVertical: 12, paddingHorizontal: 20 };
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 14;
  const primary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[full && { alignSelf: 'stretch' }, aStyle, primary && goldShadow, style]}>
      <Pressable
        disabled={isDisabled}
        onPressIn={() => (scale.value = withSpring(0.97, { damping: 18, stiffness: 320 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 18, stiffness: 320 }))}
        onPress={onPress}
        style={[
          styles.btn,
          pad,
          primary ? styles.btnPrimary : styles.btnGhost,
          isDisabled && { opacity: 0.45 },
        ]}
      >
        {loading && (
          <ActivityIndicator size="small" color={primary ? palette.white : palette.ink1} />
        )}
        <Txt
          style={{
            fontFamily: fonts.sans,
            fontWeight: '600',
            fontSize,
            color: primary ? palette.white : palette.ink1,
          }}
        >
          {label}
        </Txt>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Card ───────────────────────────────────── */
export function Card({
  children,
  style,
  padded,
  ...rest
}: ViewProps & { padded?: boolean }) {
  return (
    <View style={[styles.card, cardShadow, padded && styles.cardP, style]} {...rest}>
      {children}
    </View>
  );
}

/* ─── Badge ──────────────────────────────────── */
export function Badge({ label, amber }: { label: string; amber?: boolean }) {
  return (
    <View style={[styles.badge, amber && styles.badgeAmber]}>
      <Txt
        style={{
          fontSize: 10.5,
          fontWeight: '700',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: amber ? palette.amber : palette.ink2,
        }}
      >
        {label}
      </Txt>
    </View>
  );
}

/* ─── Stat tile ──────────────────────────────── */
export function Tile({
  label,
  value,
  amber,
  center,
  style,
}: {
  label: string;
  value: string;
  amber?: boolean;
  center?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[amber ? styles.tileAmber : styles.tile, center && { alignItems: 'center' }, style]}>
      <Txt variant={amber ? 'labelAmber' : 'label'} style={{ marginBottom: 6 }}>
        {label}
      </Txt>
      <Txt style={{ fontSize: 18, fontWeight: '700', color: palette.ink1, fontFamily: fonts.sans }}>
        {value}
      </Txt>
    </View>
  );
}

/* ─── Progress bar (animated fill) ───────────── */
export function ProgressBar({ progress, delay = 200 }: { progress: number; delay?: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(100, progress)), {
      duration: 900,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [progress]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={styles.progress}>
      <Animated.View style={[styles.progressFill, fill]} />
    </View>
  );
}

/* ─── Divider ────────────────────────────────── */
export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.rule, style]} />;
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnPrimary: { backgroundColor: palette.gold, borderColor: palette.gold },
  btnGhost: { backgroundColor: palette.bg1, borderColor: palette.line2 },
  card: {
    backgroundColor: palette.bg1,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.xl,
  },
  cardP: { padding: space.xl },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.line2,
  },
  badgeAmber: { borderColor: palette.amberBr, backgroundColor: palette.amberLo },
  tile: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: palette.bg2,
    borderWidth: 1,
    borderColor: palette.line2,
    borderRadius: radius.lg,
  },
  tileAmber: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: palette.amberLo,
    borderWidth: 1,
    borderColor: palette.amberBr,
    borderRadius: radius.lg,
  },
  progress: {
    height: 6,
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: palette.amber, borderRadius: radius.pill },
  rule: { height: 1, backgroundColor: palette.line },
});
