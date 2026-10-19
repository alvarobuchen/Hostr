import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { palette, space, radius, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Card, Badge, Tile, ProgressBar } from '@/ui/primitives';
import { Field } from '@/ui/field';
import { BackBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { useGifts, paidTotal } from '@/lib/gifts-store';
import { useI18n } from '@/lib/i18n';

export default function GiftDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { getByCode, contribute } = useGifts();
  const gift = getByCode(String(code));

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');

  if (!gift) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        <BackBar title={t('gc.allGifts')} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <Txt variant="title" center>
            {t('gp.notFound')}
          </Txt>
          <Button label={t('gc.allGifts')} onPress={() => router.replace('/gifts')} />
        </View>
      </View>
    );
  }

  const collected = paidTotal(gift);
  const progress = Math.min((collected / gift.totalPrice) * 100, 100);
  const perPerson = gift.totalPrice / gift.participantCount;

  function pay() {
    const amt = Number(amount);
    if (!name || !amt) {
      setErr('Enter your name and an amount.');
      setOk('');
      return;
    }
    contribute(String(code), name, amt);
    setOk(t('gifts.success'));
    setErr('');
    setName('');
    setAmount('');
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BackBar title={t('gc.allGifts')} />
      <Screen>
        <FadeUp>
          <Txt variant="labelAmber">{t('giftD.sharedGift')}</Txt>
          <Txt variant="title" style={{ marginTop: 6 }}>
            {gift.title}
          </Txt>
          {gift.description ? <Txt style={{ marginTop: 10 }}>{gift.description}</Txt> : null}
        </FadeUp>

        {/* Progress panel */}
        <FadeUp delay={80} style={{ marginTop: 20 }}>
          <Card padded style={{ gap: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Txt variant="label" style={{ marginBottom: 4 }}>
                  {t('giftD.collectionProgress')}
                </Txt>
                <Txt style={{ fontSize: 24, fontWeight: '700', color: palette.ink1 }}>
                  ${collected.toFixed(0)}{' '}
                  <Txt style={{ fontSize: 15, fontWeight: '400', color: palette.ink3 }}>
                    {t('giftD.of')} ${gift.totalPrice.toFixed(0)}
                  </Txt>
                </Txt>
              </View>
              <Badge label={`${Math.round(progress)}%`} amber />
            </View>
            <ProgressBar progress={progress} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Tile label={t('giftD.guests')} value={String(gift.participantCount)} center style={{ flex: 1 }} />
              <Tile
                label={t('giftD.date')}
                value={gift.eventDate ? new Date(gift.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                center
                style={{ flex: 1 }}
              />
              <Tile label={t('giftD.perShare')} value={`$${perPerson.toFixed(0)}`} amber center style={{ flex: 1 }} />
            </View>

            <View>
              <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.ink1, marginBottom: 10 }}>
                {t('giftD.contributors')}
              </Txt>
              {gift.contributions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Txt style={{ fontSize: 13, color: palette.ink3 }}>{t('giftD.noContrib')}</Txt>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {gift.contributions.map((c) => (
                    <View key={c.id} style={styles.contribRow}>
                      <View>
                        <Txt style={{ fontSize: 14, fontWeight: '600', color: palette.ink1 }}>{c.name}</Txt>
                        <Txt style={{ fontSize: 12, color: palette.ink3 }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </Txt>
                      </View>
                      <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.amber }}>${c.amount.toFixed(0)}</Txt>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Card>
        </FadeUp>

        {/* Contribute / share */}
        <FadeUp delay={140} style={{ marginTop: 20 }}>
          <Card padded style={{ gap: 16 }}>
            <View>
              <Txt variant="label" style={{ marginBottom: 4 }}>
                {t('giftD.contribute')}
              </Txt>
              <Txt variant="heading" style={{ fontSize: 18 }}>
                {t('giftD.payYourShare')}
              </Txt>
              <Txt style={{ marginTop: 6, fontSize: 14 }}>{t('giftD.enterNameAmount')}</Txt>
            </View>

            <View style={styles.linkBox}>
              <Txt variant="labelAmber" style={{ marginBottom: 6 }}>
                {t('giftCard.guestLink')}
              </Txt>
              <Txt variant="mono" style={{ fontSize: 12, color: palette.ink2 }}>
                cenit.app/gift/{gift.code}
              </Txt>
            </View>

            {ok ? (
              <Animated.View entering={FadeIn}>
                <Txt style={styles.ok}>{ok}</Txt>
              </Animated.View>
            ) : null}
            {err ? <Txt style={styles.err}>{err}</Txt> : null}

            <Field value={name} onChangeText={setName} placeholder={t('giftD.yourName')} />
            <Field
              value={amount}
              onChangeText={setAmount}
              placeholder={t('giftD.suggested', { n: perPerson.toFixed(0) })}
              keyboardType="numeric"
            />
            <Button label={t('giftD.payStripe')} full onPress={pay} />
          </Card>
        </FadeUp>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.bg2,
    borderRadius: radius.md,
    padding: 16,
  },
  contribRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.bg2,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  linkBox: {
    borderWidth: 1,
    borderColor: palette.amberBr,
    backgroundColor: palette.amberLo,
    borderRadius: radius.md,
    padding: 14,
  },
  ok: {
    fontSize: 13,
    color: palette.ok,
    backgroundColor: 'rgba(46,158,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(46,158,107,0.22)',
    borderRadius: radius.md,
    padding: 12,
  },
  err: {
    fontSize: 13,
    color: palette.err,
    backgroundColor: 'rgba(207,82,56,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(207,82,56,0.22)',
    borderRadius: radius.md,
    padding: 12,
  },
});
