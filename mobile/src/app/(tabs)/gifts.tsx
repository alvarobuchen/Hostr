import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { palette, space, radius, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Card, Badge, Tile, ProgressBar, Rule } from '@/ui/primitives';
import { BrandBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { Footer } from '@/ui/footer';
import { useGifts, paidTotal, type Gift } from '@/lib/gifts-store';
import { useI18n } from '@/lib/i18n';

function GiftCard({ gift, index }: { gift: Gift; index: number }) {
  const router = useRouter();
  const { t } = useI18n();
  const contributed = paidTotal(gift);
  const progress = Math.min((contributed / gift.totalPrice) * 100, 100);

  return (
    <FadeUp delay={(index % 2) * 80}>
      <Card padded style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Txt style={styles.title}>{gift.title}</Txt>
            <Txt style={{ fontSize: 12, color: palette.ink3, marginTop: 2 }}>
              {gift.eventDate
                ? new Date(gift.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </Txt>
          </View>
          <Badge label={gift.code} amber />
        </View>

        {gift.description ? (
          <Txt numberOfLines={2} style={{ fontSize: 14, lineHeight: 21 }}>
            {gift.description}
          </Txt>
        ) : null}

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 12, color: palette.ink2 }}>
              <Txt style={{ fontWeight: '700', color: palette.ink1 }}>${contributed.toFixed(0)}</Txt>
              <Txt style={{ color: palette.ink3 }}> / ${gift.totalPrice.toFixed(0)}</Txt>
            </Txt>
            <Txt style={{ fontSize: 12, fontWeight: '700', color: palette.amber }}>{Math.round(progress)}%</Txt>
          </View>
          <ProgressBar progress={progress} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Tile label={t('giftCard.guests')} value={String(gift.participantCount)} style={{ flex: 1 }} />
          <Tile
            label={t('giftCard.perPerson')}
            value={`$${(gift.totalPrice / gift.participantCount).toFixed(0)}`}
            amber
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.linkBox}>
          <Txt variant="label" style={{ marginBottom: 6 }}>
            {t('giftCard.guestLink')}
          </Txt>
          <Txt variant="mono" style={{ fontSize: 12 }}>
            cenit.app/gift/{gift.code}
          </Txt>
        </View>

        <Button label={t('giftCard.openShare')} variant="ghost" full onPress={() => router.push(`/gift/${gift.code}`)} />
      </Card>
    </FadeUp>
  );
}

/* Simplified payout panel (native port of PayoutPanel). */
function PayoutPanel() {
  const { gifts } = useGifts();
  const available = gifts.reduce((s, g) => s + paidTotal(g), 0);
  return (
    <Card padded style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={styles.payIcon}>
          <SymbolView name="banknote" tintColor={palette.gold} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="label">Get paid</Txt>
          <Txt style={{ fontSize: 13, marginTop: 2 }}>
            Connect a bank account to receive what guests contribute.
          </Txt>
        </View>
      </View>
      <Rule />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Txt variant="label">Available</Txt>
          <Txt style={{ fontSize: 24, fontWeight: '700', color: palette.ink1, marginTop: 2 }}>
            ${available.toFixed(0)}
          </Txt>
        </View>
        <Button label="Connect bank" size="sm" onPress={() => {}} />
      </View>
    </Card>
  );
}

export default function GiftsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { gifts } = useGifts();

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BrandBar />
      <Screen contentStyle={{ paddingHorizontal: 0 }}>
        <View style={{ paddingHorizontal: space.xl }}>
          <FadeUp>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Txt variant="labelAmber" style={{ marginBottom: 6 }}>
                  {t('gifts.dashboard')}
                </Txt>
                <Txt variant="title">{t('gifts.yourCollections')}</Txt>
              </View>
              <Button label={t('gifts.createGift')} size="sm" onPress={() => router.push('/gift/create')} />
            </View>
          </FadeUp>

          <View style={{ marginTop: 22 }}>
            <PayoutPanel />
          </View>

          <Rule style={{ marginVertical: 24 }} />

          {gifts.length === 0 ? (
            <Card padded style={{ alignItems: 'center', gap: 16, paddingVertical: 48 }}>
              <Txt center>{t('gifts.noneTitle')}</Txt>
              <Button label={t('gifts.createFirst')} onPress={() => router.push('/gift/create')} />
            </Card>
          ) : (
            <View style={{ gap: 18 }}>
              {gifts.map((g, i) => (
                <GiftCard key={g.id} gift={g} index={i} />
              ))}
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
        <Footer />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '600', color: palette.ink1 },
  linkBox: {
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.bg2,
    borderRadius: radius.md,
    padding: 14,
  },
  payIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.amberLo,
    borderWidth: 1,
    borderColor: palette.amberBr,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
