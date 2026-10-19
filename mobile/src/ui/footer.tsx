import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { palette, space, fonts } from '@/theme/tokens';
import { Logo } from '@/ui/logo';
import { Txt } from '@/ui/text';
import { Rule } from '@/ui/primitives';
import { useI18n } from '@/lib/i18n';

function Col({ title, links }: { title: string; links: { label: string; href: Href }[] }) {
  const router = useRouter();
  return (
    <View style={{ flex: 1, minWidth: 130 }}>
      <Txt variant="label" style={{ marginBottom: 12 }}>
        {title}
      </Txt>
      <View style={{ gap: 10 }}>
        {links.map((l) => (
          <Pressable key={l.label} onPress={() => router.push(l.href)} hitSlop={4}>
            <Txt style={styles.link}>{l.label}</Txt>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function Footer() {
  const { t } = useI18n();
  const year = 2026;
  return (
    <View style={styles.wrap}>
      <View style={{ gap: space.xl }}>
        <View style={{ gap: 12 }}>
          <Logo size={24} />
          <Txt style={{ fontSize: 13, lineHeight: 21, color: palette.ink2, maxWidth: 280 }}>
            {t('footer.tagline')}
          </Txt>
        </View>

        <View style={styles.cols}>
          <Col
            title={t('footer.product')}
            links={[
              { label: t('footer.venues'), href: '/venues' },
              { label: t('footer.giftCollections'), href: '/gifts' },
              { label: t('footer.guestCheckout'), href: '/guest' },
              { label: 'List your venue', href: '/host-signup' },
            ]}
          />
          <Col
            title={t('footer.support')}
            links={[
              { label: t('footer.contact'), href: '/contact' },
              { label: t('footer.privacy'), href: '/privacy' },
              { label: t('footer.terms'), href: '/terms' },
            ]}
          />
        </View>
      </View>

      <Rule style={{ marginTop: space.xl }} />
      <Txt style={styles.copy}>{t('footer.rights', { year })}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.bg,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
    paddingBottom: space.xxl,
  },
  cols: { flexDirection: 'row', gap: space.xl, flexWrap: 'wrap' },
  link: { fontSize: 14, color: palette.ink2, fontFamily: fonts.sans },
  copy: { fontSize: 12, color: palette.ink3, marginTop: 18, fontFamily: fonts.sans },
});
