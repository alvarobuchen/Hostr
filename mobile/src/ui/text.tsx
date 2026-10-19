import { Text, TextProps, StyleSheet } from 'react-native';
import { palette, fonts } from '@/theme/tokens';

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'small'
  | 'label'
  | 'labelAmber'
  | 'mono';

export type TxtProps = TextProps & {
  variant?: Variant;
  color?: string;
  center?: boolean;
};

/** Brand-aware text. Serif for display/title, Inter-like sans for the rest. */
export function Txt({ variant = 'body', color, center, style, ...rest }: TxtProps) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        color ? { color } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: palette.ink1 },
  display: {
    fontFamily: fonts.serif,
    fontSize: 44,
    lineHeight: 46,
    fontWeight: '600',
    letterSpacing: -1,
    color: palette.ink1,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: palette.ink1,
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: palette.ink1,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 24,
    color: palette.ink2,
  },
  small: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: palette.ink2,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: palette.ink3,
  },
  labelAmber: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: palette.amber,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: palette.ink2,
  },
});
