import { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import Animated, { FadeIn } from 'react-native-reanimated';

import { palette, space, radius, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Card, Badge, Tile, Rule } from '@/ui/primitives';
import { ToggleRow } from '@/ui/field';
import { BackBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { VenueGlyph } from '@/ui/venue-glyph';
import { getVenue } from '@/lib/demo-data';
import { computeEstimate } from '@/lib/booking';
import { useI18n } from '@/lib/i18n';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function buildMonth(cursor: Date): (Date | null)[] {
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const count = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(new Date(y, m, d));
  return cells;
}

/* Compact − value + stepper. */
function Stepper({
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={{ flex: 1, minWidth: 150 }}>
      <Txt style={styles.fieldLabel}>{label}</Txt>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={styles.stepBtn}
          hitSlop={6}
        >
          <SymbolView name="minus" tintColor={palette.ink1} size={14} />
        </Pressable>
        <Txt style={styles.stepVal}>
          {value} {suffix}
        </Txt>
        <Pressable
          onPress={() => onChange(Math.min(max, value + step))}
          style={styles.stepBtn}
          hitSlop={6}
        >
          <SymbolView name="plus" tintColor={palette.ink1} size={14} />
        </Pressable>
      </View>
    </View>
  );
}

export default function VenueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const venue = getVenue(String(id));

  const [attendees, setAttendees] = useState(20);
  const [drinks, setDrinks] = useState(2);
  const [hours, setHours] = useState(4);
  const [catering, setCatering] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const est = useMemo(() => {
    if (!venue) return { base: 0, drinks: 0, catering: 0, extras: 0, total: 0, deposit: 0 };
    return computeEstimate({
      pricePerHour: venue.pricePerHour,
      hours,
      attendees,
      drinksPerPerson: drinks,
      catering,
      addOnsTotal: venue.addOns.reduce((s, a) => s + a.price, 0),
    });
  }, [attendees, drinks, hours, catering, venue]);

  if (!venue) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        <BackBar title={t('vd.allVenues')} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <Txt variant="title" center>
            {t('vd.notFound')}
          </Txt>
          <Txt center>{t('vd.notFoundBody')}</Txt>
          <Button label={t('vd.back')} onPress={() => router.replace('/venues')} />
        </View>
      </View>
    );
  }

  const gallery = venue.images ?? [];
  const monthDays = buildMonth(monthCursor);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthLabel = monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const mapQuery = encodeURIComponent(
    venue.location.includes(',') ? `${venue.location}, Spain` : `${venue.location}, Madrid, Spain`,
  );

  function onReserve() {
    if (!selectedDate) {
      setError(t('vd.reserve') && 'Pick a date for your event first.');
      return;
    }
    setError(null);
    setConfirmed(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BackBar title={t('vd.allVenues')} />
      <Screen>
        {/* ── Gallery ── */}
        <FadeUp>
          <Card style={{ overflow: 'hidden', padding: 0 }}>
            <View style={styles.hero}>
              {gallery.length > 0 ? (
                <Image
                  key={activeImg}
                  source={gallery[activeImg]}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={220}
                />
              ) : (
                <VenueGlyph initial={venue.name.charAt(0)} />
              )}
            </View>
            {gallery.length > 1 && (
              <View style={styles.thumbs}>
                {gallery.map((src, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setActiveImg(i)}
                    style={[styles.thumb, i === activeImg && { borderColor: palette.amber }]}
                  >
                    <Image source={src} style={StyleSheet.absoluteFill} contentFit="cover" />
                  </Pressable>
                ))}
              </View>
            )}
            <View style={{ padding: space.xl, gap: 16 }}>
              <View>
                <Txt variant="label" style={{ marginBottom: 4 }}>
                  {t('vd.curated')}
                </Txt>
                <Txt variant="heading" style={{ fontSize: 24 }}>
                  {venue.name}
                </Txt>
                <Txt style={{ marginTop: 10, fontSize: 14, lineHeight: 22 }}>{venue.description}</Txt>
              </View>
              <View style={styles.tileGrid}>
                <Tile label={t('vd.location')} value={venue.location} style={{ flexBasis: '48%', flexGrow: 1 }} />
                <Tile label={t('vd.baseRate')} value={`$${venue.pricePerHour}/hr`} amber style={{ flexBasis: '48%', flexGrow: 1 }} />
                <Tile
                  label={t('vd.maxCapacity')}
                  value={`${venue.capacity} ${t('vd.guestsWord')}`}
                  style={{ flexBasis: '100%' }}
                />
              </View>
            </View>
          </Card>
        </FadeUp>

        {/* ── Location ── */}
        <FadeUp delay={60} style={{ marginTop: 20 }}>
          <Card padded>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Txt variant="label" style={{ marginBottom: 4 }}>
                  {t('vd.location')}
                </Txt>
                <Txt variant="heading" style={{ fontSize: 18 }}>
                  {venue.location}
                </Txt>
              </View>
              <Button
                label="Maps"
                variant="ghost"
                size="sm"
                onPress={() => Linking.openURL(`http://maps.apple.com/?q=${mapQuery}`)}
              />
            </View>
          </Card>
        </FadeUp>

        {/* ── Estimator ── */}
        <FadeUp delay={100} style={{ marginTop: 20 }}>
          <Card padded>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Txt variant="label" style={{ marginBottom: 4 }}>
                  {t('vd.estimator')}
                </Txt>
                <Txt variant="heading" style={{ fontSize: 18 }}>
                  {t('vd.customize')}
                </Txt>
              </View>
              <Badge label={t('vd.liveEstimate')} amber />
            </View>

            <View style={{ gap: 14, marginTop: 20 }}>
              <View style={styles.stepRow}>
                <Stepper label={t('vd.guests')} value={attendees} suffix={t('vd.guestsWord')} min={5} max={1000} step={5} onChange={setAttendees} />
                <Stepper label={t('vd.drinksPP')} value={drinks} suffix="" min={0} max={6} step={1} onChange={setDrinks} />
              </View>
              <View style={styles.stepRow}>
                <Stepper label={t('vd.duration')} value={hours} suffix="h" min={2} max={9} step={1} onChange={setHours} />
                <View style={{ flex: 1, minWidth: 150, justifyContent: 'flex-end' }}>
                  <ToggleRow title={t('vd.catering')} desc={t('vd.cateringPP')} value={catering} onChange={setCatering} />
                </View>
              </View>
            </View>

            {/* Calendar */}
            <View style={{ marginTop: 22 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Txt style={styles.fieldLabel}>{t('gc.eventDate')}</Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Pressable
                    onPress={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                    hitSlop={8}
                  >
                    <SymbolView name="chevron.left" tintColor={palette.ink2} size={16} />
                  </Pressable>
                  <Txt style={{ fontSize: 13, fontWeight: '700', color: palette.ink1, minWidth: 120, textAlign: 'center' }}>
                    {monthLabel}
                  </Txt>
                  <Pressable
                    onPress={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                    hitSlop={8}
                  >
                    <SymbolView name="chevron.right" tintColor={palette.ink2} size={16} />
                  </Pressable>
                </View>
              </View>
              <View style={styles.calRow}>
                {WEEKDAYS.map((w) => (
                  <Txt key={w} style={styles.calHead}>
                    {w}
                  </Txt>
                ))}
              </View>
              <View style={styles.calGrid}>
                {monthDays.map((date, i) => {
                  if (!date) return <View key={`e${i}`} style={styles.calCell} />;
                  const key = ymd(date);
                  const past = date < today;
                  const active = selectedDate === key;
                  return (
                    <Pressable
                      key={key}
                      disabled={past}
                      onPress={() => {
                        setSelectedDate(key);
                        setError(null);
                      }}
                      style={[
                        styles.calCell,
                        styles.calDay,
                        active && { backgroundColor: palette.amber, borderColor: palette.amber },
                        past && { backgroundColor: palette.bg2, borderColor: 'transparent' },
                      ]}
                    >
                      <Txt
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: active ? '#fff' : past ? palette.ink3 : palette.ink1,
                          textDecorationLine: past ? 'line-through' : 'none',
                        }}
                      >
                        {date.getDate()}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Breakdown */}
            <View style={styles.breakdown}>
              {([
                [t('vd.venueHire'), est.base],
                [t('vd.drinks'), est.drinks],
                [t('vd.catering'), est.catering],
                [t('vd.addonExtras'), est.extras],
              ] as [string, number][]).map(([label, val]) => (
                <View key={label} style={styles.brRow}>
                  <Txt style={{ fontSize: 14, color: palette.ink2 }}>{label}</Txt>
                  <Txt style={{ fontSize: 14, fontWeight: '600', color: palette.ink1 }}>${val.toFixed(0)}</Txt>
                </View>
              ))}
              <Rule />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View>
                  <Txt style={{ fontSize: 12, color: palette.ink3 }}>{t('vd.estTotal')}</Txt>
                  <Txt style={{ fontSize: 26, fontWeight: '700', color: palette.amber }}>${est.total.toFixed(0)}</Txt>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Txt style={{ fontSize: 12, color: palette.ink3 }}>Deposit now (20%)</Txt>
                  <Txt style={{ fontSize: 18, fontWeight: '700', color: palette.ink1 }}>${est.deposit.toFixed(0)}</Txt>
                </View>
              </View>

              {confirmed && (
                <Animated.View entering={FadeIn} style={styles.confirm}>
                  <Txt style={{ fontSize: 13, color: palette.ink1 }}>
                    🎉 Your reservation is confirmed. The host can see it in their dashboard.
                  </Txt>
                </Animated.View>
              )}
              {error && <Txt style={{ fontSize: 13, color: palette.err }}>{error}</Txt>}

              <Button
                full
                label={
                  confirmed
                    ? 'Reserved ✓'
                    : selectedDate
                      ? `Reserve · $${est.deposit.toFixed(0)} deposit`
                      : 'Pick a date to reserve'
                }
                onPress={onReserve}
                disabled={confirmed}
              />
            </View>
          </Card>
        </FadeUp>

        {/* ── Add-ons ── */}
        <FadeUp delay={140} style={{ marginTop: 20 }}>
          <Card padded>
            <Txt variant="label" style={{ marginBottom: 4 }}>
              {t('vd.includedAddons')}
            </Txt>
            <Txt variant="heading" style={{ fontSize: 18, marginBottom: 14 }}>
              {t('vd.whatsAvailable')}
            </Txt>
            <View style={{ gap: 10 }}>
              {venue.addOns.map((a) => (
                <View key={a.id} style={styles.addon}>
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.ink1 }}>{a.name}</Txt>
                    <Txt style={{ fontSize: 12, lineHeight: 18, color: palette.ink2, marginTop: 3 }}>{a.description}</Txt>
                  </View>
                  <Badge label={`$${a.price}`} amber />
                </View>
              ))}
            </View>
          </Card>
        </FadeUp>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { aspectRatio: 3 / 2, backgroundColor: palette.bg3 },
  thumbs: { flexDirection: 'row', gap: 8, paddingHorizontal: space.xl, paddingTop: 12, flexWrap: 'wrap' },
  thumb: {
    width: 52,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: palette.line2,
  },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: palette.ink2, marginBottom: 6, fontFamily: fonts.sans },
  stepRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.bg2,
    borderWidth: 1,
    borderColor: palette.line2,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    height: 46,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: palette.bg1,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepVal: { fontSize: 14, fontWeight: '700', color: palette.ink1 },
  calRow: { flexDirection: 'row' },
  calHead: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: palette.ink3, marginBottom: 4 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  calDay: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.bg1,
  },
  breakdown: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.bg2,
    borderRadius: radius.lg,
    padding: 18,
    gap: 12,
  },
  brRow: { flexDirection: 'row', justifyContent: 'space-between' },
  confirm: {
    borderWidth: 1,
    borderColor: palette.amber,
    backgroundColor: 'rgba(176,131,46,0.1)',
    borderRadius: 10,
    padding: 12,
  },
  addon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.bg2,
    borderRadius: radius.md,
    padding: 14,
  },
});
