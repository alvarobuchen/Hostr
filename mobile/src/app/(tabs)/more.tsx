import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { palette, space, radius, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Card } from '@/ui/primitives';
import { BrandBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { Footer } from '@/ui/footer';
import { useI18n } from '@/lib/i18n';

type Row = { label: string; sub?: string; icon: SymbolViewProps['name']; href: Href };

function MenuGroup({ title, rows }: { title: string; rows: Row[] }) {
  const router = useRouter();
  return (
    <View style={{ gap: 10 }}>
      <Txt variant="label">{title}</Txt>
      <Card style={{ overflow: 'hidden' }}>
        {rows.map((r, i) => (
          <Pressable
            key={r.label}
            onPress={() => router.push(r.href)}
            style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { backgroundColor: palette.bg2 }]}
          >
            <View style={styles.rowIcon}>
              <SymbolView name={r.icon} tintColor={palette.gold} size={19} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 15, fontWeight: '600', color: palette.ink1, fontFamily: fonts.sans }}>
                {r.label}
              </Txt>
              {r.sub ? <Txt style={{ fontSize: 12.5, color: palette.ink3, marginTop: 1 }}>{r.sub}</Txt> : null}
            </View>
            <SymbolView name="chevron.right" tintColor={palette.ink3} size={14} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

export default function MoreScreen() {
  const { t, locale, toggle } = useI18n();

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BrandBar />
      <Screen contentStyle={{ paddingHorizontal: 0 }}>
        <View style={{ paddingHorizontal: space.xl, gap: 24 }}>
          <FadeUp>
            <Txt variant="labelAmber">Menu</Txt>
            <Txt variant="title" style={{ marginTop: 8 }}>
              Everything Cenit
            </Txt>
          </FadeUp>

          <FadeUp delay={60}>
            <MenuGroup
              title="Account"
              rows={[
                { label: t('nav.signIn'), sub: 'Manage your celebrations', icon: 'person.crop.circle', href: '/login' },
                { label: t('nav.getStarted'), sub: 'Create a free account', icon: 'sparkles', href: '/signup' },
                { label: t('nav.guestAccess'), sub: 'Enter a gift code to pay', icon: 'qrcode', href: '/guest' },
              ]}
            />
          </FadeUp>

          <FadeUp delay={120}>
            <MenuGroup
              title="For hosts"
              rows={[
                { label: 'List your venue', sub: 'Create a host account', icon: 'building.2', href: '/host-signup' },
                { label: 'Host dashboard', sub: 'Bookings, availability, payouts', icon: 'chart.bar', href: '/host' },
              ]}
            />
          </FadeUp>

          <FadeUp delay={180}>
            <MenuGroup
              title={t('footer.support')}
              rows={[
                { label: t('footer.contact'), icon: 'envelope', href: '/contact' },
                { label: t('footer.privacy'), icon: 'lock.shield', href: '/privacy' },
                { label: t('footer.terms'), icon: 'doc.text', href: '/terms' },
              ]}
            />
          </FadeUp>

          <FadeUp delay={220}>
            <View style={{ gap: 10 }}>
              <Txt variant="label">Language</Txt>
              <Pressable onPress={toggle}>
                <Card style={styles.langRow}>
                  <View style={styles.rowIcon}>
                    <SymbolView name="globe" tintColor={palette.gold} size={19} />
                  </View>
                  <Txt style={{ flex: 1, fontSize: 15, fontWeight: '600', color: palette.ink1, fontFamily: fonts.sans }}>
                    {locale === 'en' ? 'English' : 'Español'}
                  </Txt>
                  <View style={styles.langPill}>
                    <Txt style={{ fontSize: 12, fontWeight: '700', color: palette.ink2, letterSpacing: 1 }}>
                      {locale === 'en' ? 'Switch to ES' : 'Switch to EN'}
                    </Txt>
                  </View>
                </Card>
              </Pressable>
            </View>
          </FadeUp>
        </View>
        <View style={{ height: 40 }} />
        <Footer />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  rowBorder: { borderTopWidth: 1, borderTopColor: palette.line },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.amberLo,
    borderWidth: 1,
    borderColor: palette.amberBr,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  langPill: {
    borderWidth: 1,
    borderColor: palette.line2,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
