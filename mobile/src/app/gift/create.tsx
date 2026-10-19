import { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { palette, space, radius, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Card, Tile } from '@/ui/primitives';
import { Field } from '@/ui/field';
import { BackBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { useGifts } from '@/lib/gifts-store';
import { useI18n } from '@/lib/i18n';

const CLUBS = ['None', 'Shoko', 'Teatro Kapital', 'Panda Club'];

export default function CreateGift() {
  const router = useRouter();
  const { t } = useI18n();
  const { createGift } = useGifts();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [total, setTotal] = useState('');
  const [guests, setGuests] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [club, setClub] = useState('None');
  const [ticket, setTicket] = useState('35');
  const [error, setError] = useState('');

  const suggested = useMemo(() => {
    const a = Number(total);
    const p = Number(guests);
    return a && p ? a / p : 0;
  }, [total, guests]);

  function submit() {
    if (!title || !total || !guests) {
      setError('Please fill in the title, amount, and number of guests.');
      return;
    }
    const gift = createGift({
      title,
      description: description || undefined,
      totalPrice: Number(total),
      participantCount: Number(guests),
      eventDate: eventDate || undefined,
      clubName: club !== 'None' ? club : undefined,
      clubTicketPrice: club !== 'None' ? Number(ticket) : undefined,
    });
    router.replace(`/gift/${gift.code}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BackBar title={t('gc.allGifts')} />
      <Screen>
        {/* Form */}
        <FadeUp>
          <Card padded style={{ gap: 18 }}>
            <View>
              <Txt variant="labelAmber" style={{ marginBottom: 6 }}>
                {t('gc.newCollection')}
              </Txt>
              <Txt variant="heading" style={{ fontSize: 22 }}>
                {t('gc.title')}
              </Txt>
              <Txt style={{ marginTop: 8, fontSize: 14 }}>{t('gc.subtitle')}</Txt>
            </View>

            {error ? <Txt style={styles.err}>{error}</Txt> : null}

            <Field label={t('gc.giftTitle')} value={title} onChangeText={setTitle} placeholder={t('gc.giftTitlePlaceholder')} />
            <Field
              label={`${t('gc.description')} ${t('gc.optional')}`}
              value={description}
              onChangeText={setDescription}
              placeholder={t('gc.descPlaceholder')}
              multiline
              style={{ minHeight: 88, textAlignVertical: 'top' }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label={t('gc.totalAmount')} value={total} onChangeText={setTotal} placeholder="300" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label={t('gc.numGuests')} value={guests} onChangeText={setGuests} placeholder="12" keyboardType="numeric" />
              </View>
            </View>
            <Field label={t('gc.eventDate')} value={eventDate} onChangeText={setEventDate} placeholder="2026-08-15" />

            {/* Afterparty */}
            <View style={styles.after}>
              <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.ink1 }}>
                {t('gc.afterparty')}{' '}
                <Txt style={{ fontSize: 12, fontWeight: '400', color: palette.ink3 }}>{t('gc.afterpartyOptional')}</Txt>
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CLUBS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setClub(c)}
                    style={[styles.clubChip, club === c && { backgroundColor: palette.navy, borderColor: palette.navy }]}
                  >
                    <Txt style={{ fontSize: 13, fontWeight: '600', color: club === c ? palette.cream : palette.ink2 }}>
                      {c === 'None' ? t('gc.none') : c}
                    </Txt>
                  </Pressable>
                ))}
              </View>
              {club !== 'None' && (
                <Field label={t('gc.ticketPrice')} value={ticket} onChangeText={setTicket} placeholder="35" keyboardType="numeric" />
              )}
            </View>

            <Button label={t('gc.create')} size="lg" full onPress={submit} />
          </Card>
        </FadeUp>

        {/* Preview */}
        <FadeUp delay={100} style={{ marginTop: 20, gap: 16 }}>
          <Card padded style={{ gap: 18 }}>
            <Txt variant="label">{t('gc.preview')}</Txt>
            <View>
              <Txt variant="heading" style={{ fontSize: 18 }}>
                {title || t('gc.yourCollection')}
              </Txt>
              <Txt style={{ marginTop: 8, fontSize: 14 }}>{description || t('gc.previewDesc')}</Txt>
            </View>
            <View style={{ gap: 10 }}>
              <Tile label={t('gc.totalTarget')} value={`$${Number(total || 0).toFixed(0)}`} />
              <Tile label={t('gc.suggestedPerGuest')} value={`$${suggested.toFixed(0)}`} amber />
              <Tile
                label={t('gc.eventDate')}
                value={eventDate ? new Date(eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : t('gc.chooseDate')}
              />
            </View>
          </Card>

          <Card padded style={{ gap: 12 }}>
            <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.ink1 }}>{t('gc.whatNext')}</Txt>
            {[t('gc.step1'), t('gc.step2'), t('gc.step3')].map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.amber }}>{i + 1}.</Txt>
                <Txt style={{ flex: 1, fontSize: 14 }}>{step}</Txt>
              </View>
            ))}
          </Card>
        </FadeUp>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  err: {
    fontSize: 13,
    color: palette.err,
    backgroundColor: 'rgba(207,82,56,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(207,82,56,0.22)',
    borderRadius: radius.md,
    padding: 12,
  },
  after: {
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.bg2,
    borderRadius: radius.md,
    padding: 16,
    gap: 12,
  },
  clubChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.bg1,
    borderWidth: 1,
    borderColor: palette.line2,
  },
});
