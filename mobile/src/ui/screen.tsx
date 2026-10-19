import { ReactNode } from 'react';
import { ScrollView, View, StyleSheet, RefreshControlProps, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, space } from '@/theme/tokens';

/** Standard page scroll container: brand background, comfortable gutters,
 *  and bottom padding that clears the tab bar. */
export function Screen({
  children,
  contentStyle,
  padTop = true,
  refreshControl,
  bounces = true,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  padTop?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  bounces?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.scroll}
      bounces={bounces}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      contentContainerStyle={[
        {
          paddingHorizontal: space.xl,
          paddingTop: padTop ? space.xl : 0,
          paddingBottom: insets.bottom + 120,
        },
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

export function Gap({ h = space.lg }: { h?: number }) {
  return <View style={{ height: h }} />;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: palette.bg },
});
