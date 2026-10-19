import { View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { palette, space, radius, fonts, cardShadow } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Rule } from '@/ui/primitives';
import { BrandBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { Footer } from '@/ui/footer';
import { venues, type Venue } from '@/lib/demo-data';
import { useI18n } from '@/lib/i18n';

function VenueCard({ venue, index }: { venue: Venue; index: number }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <FadeUp delay={(index % 3) * 70}>
      <Pressable
        onPress={() => router.push(`/venue/${venue.id}`)}
        style={({ pressed }) => [styles.card, cardShadow, pressed && { opacity: 0.94 }]}
      >
        <View style={styles.cover}>
          <Image source={venue.cover} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <View style={styles.coverShade} />
          <View style={styles.pricePill}>
            <Txt style={styles.priceTxt}>${venue.pricePerHour}/hr</Txt>
          </View>
        </View>
        <View style={{ padding: 18, gap: 12 }}>
          <View>
            <Txt style={styles.name}>{venue.name}</Txt>
            <Txt style={styles.loc}>{venue.location}</Txt>
          </View>
          <Txt numberOfLines={2} style={{ fontSize: 14, lineHeight: 21 }}>
            {venue.description}
          </Txt>
          <Rule />
          <View style={styles.footerRow}>
            <Txt style={{ fontSize: 14, color: palette.ink2 }}>
              {t('venues.upToPre')} <Txt style={{ fontWeight: '700', color: palette.ink1 }}>{venue.capacity}</Txt>{' '}
              {t('venues.guestsWord')}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Txt style={{ fontSize: 14, fontWeight: '600', color: palette.amber }}>
                {t('venues.estimateCost')}
              </Txt>
              <SymbolView name="arrow.right" tintColor={palette.amber} size={13} />
            </View>
          </View>
        </View>
      </Pressable>
    </FadeUp>
  );
}

export default function VenuesScreen() {
  const { t } = useI18n();
  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BrandBar />
      <Screen contentStyle={{ paddingHorizontal: 0 }}>
        <View style={{ paddingHorizontal: space.xl }}>
          <FadeUp>
            <Txt variant="labelAmber">{t('venues.eyebrow')}</Txt>
            <Txt variant="title" style={{ marginTop: 8 }}>
              {t('venues.title')}
            </Txt>
            <Txt style={{ marginTop: 12 }}>{t('venues.subtitle')}</Txt>
          </FadeUp>

          <View style={styles.count}>
            <Txt style={{ fontSize: 14, color: palette.ink2 }}>
              <Txt style={{ fontWeight: '700', color: palette.ink1 }}>{venues.length}</Txt>{' '}
              {t(venues.length === 1 ? 'venues.availableOne' : 'venues.availableMany', { n: venues.length }).replace(
                /^\d+\s/,
                '',
              )}
            </Txt>
            <Rule style={{ flex: 1 }} />
          </View>

          <View style={{ gap: 18 }}>
            {venues.map((v, i) => (
              <VenueCard key={v.id} venue={v} index={i} />
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
        <Footer />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.bg1,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  cover: { aspectRatio: 3 / 2, backgroundColor: palette.bg3 },
  coverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,20,30,0.16)',
  },
  pricePill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(14,20,30,0.72)',
    borderWidth: 1,
    borderColor: palette.amberBr,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  priceTxt: { color: palette.goldSoft, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  name: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '600', color: palette.ink1 },
  loc: { fontSize: 13, color: palette.ink3, marginTop: 2 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 24 },
});
