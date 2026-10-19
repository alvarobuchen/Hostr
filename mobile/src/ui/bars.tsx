import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import { palette, space, fonts } from '@/theme/tokens';
import { Logo } from '@/ui/logo';
import { Txt } from '@/ui/text';
import { useI18n } from '@/lib/i18n';

/** Top brand bar for tab screens: logo + language toggle. */
export function BrandBar() {
  const insets = useSafeAreaInsets();
  const { locale, toggle } = useI18n();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6 }]}>
      <Logo size={26} />
      <Pressable onPress={toggle} style={styles.lang} hitSlop={8}>
        <Txt style={styles.langTxt}>{locale === 'en' ? 'ES' : 'EN'}</Txt>
      </Pressable>
    </View>
  );
}

/** Back bar for pushed stack screens. */
export function BackBar({ title }: { title?: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6 }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.back}
        hitSlop={10}
      >
        <SymbolView name="chevron.left" tintColor={palette.ink1} size={18} />
        <Txt style={styles.backTxt}>{title ?? 'Back'}</Txt>
      </Pressable>
      <Logo size={22} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingBottom: 10,
    backgroundColor: palette.bg,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.line,
  },
  lang: {
    borderWidth: 1,
    borderColor: palette.line2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  langTxt: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: palette.ink3,
    fontFamily: fonts.sans,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backTxt: { fontSize: 15, fontWeight: '600', color: palette.ink1, fontFamily: fonts.sans },
});
