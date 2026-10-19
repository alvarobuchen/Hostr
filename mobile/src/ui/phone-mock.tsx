import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { palette, fonts, radius } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { ProgressBar } from '@/ui/primitives';
import { FadeUp } from '@/ui/motion';

/* ── Phone frame ──────────────────────────────── */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <View style={styles.frame}>
      <View style={styles.screen}>
        {/* dynamic island */}
        <View style={styles.island} />
        {/* status bar */}
        <View style={styles.status}>
          <Txt style={styles.statusTxt}>9:41</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <SymbolView name="wifi" tintColor={palette.ink1} size={13} />
            <SymbolView name="battery.75percent" tintColor={palette.ink1} size={20} />
          </View>
        </View>
        <View style={{ flex: 1, paddingTop: 44 }}>{children}</View>
        {/* home indicator */}
        <View style={styles.homeInd} />
      </View>
    </View>
  );
}

/* ── Venues scene ─────────────────────────────── */
const MINI_VENUES = [
  { name: 'The Atrium Loft', meta: 'Downtown · up to 120 guests', price: 120, rating: 4.9 },
  { name: 'Skyline Terrace', meta: 'Uptown · up to 150 guests', price: 165, rating: 5.0 },
  { name: 'Garden Pavilion', meta: 'Riverside · up to 80 guests', price: 95, rating: 4.8 },
];

export function VenuesScene() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={styles.rowBetween}>
        <Txt style={styles.sceneTitle}>Venues</Txt>
        <SymbolView name="ellipsis" tintColor={palette.ink3} size={18} />
      </View>
      <View style={styles.search}>
        <SymbolView name="magnifyingglass" tintColor={palette.ink3} size={14} />
        <Txt style={{ fontSize: 13, color: palette.ink3 }}>Search spaces…</Txt>
      </View>
      <View style={styles.chips}>
        {['All', 'Rooftop', 'Garden', 'Loft'].map((c, i) => (
          <View key={c} style={[styles.chip, i === 0 && styles.chipActive]}>
            <Txt style={[styles.chipTxt, i === 0 && { color: palette.cream }]}>{c}</Txt>
          </View>
        ))}
      </View>
      <View style={{ gap: 12, marginTop: 12 }}>
        {MINI_VENUES.map((v, i) => (
          <FadeUp key={v.name} delay={120 + i * 90} distance={16}>
            <View style={styles.miniCard}>
              <View style={styles.miniHeader}>
                <View style={styles.miniBloom} />
                <View style={styles.ratingPill}>
                  <SymbolView name="star.fill" tintColor="#fff" size={9} />
                  <Txt style={styles.ratingTxt}>{v.rating.toFixed(1)}</Txt>
                </View>
                <View style={styles.pricePill}>
                  <Txt style={styles.priceTxt}>${v.price}/hr</Txt>
                </View>
              </View>
              <View style={styles.miniBody}>
                <View style={{ flex: 1 }}>
                  <Txt style={styles.miniName}>{v.name}</Txt>
                  <Txt style={styles.miniMeta}>{v.meta}</Txt>
                </View>
                <View style={styles.miniArrow}>
                  <SymbolView name="arrow.right" tintColor={palette.ink2} size={13} />
                </View>
              </View>
            </View>
          </FadeUp>
        ))}
      </View>
    </View>
  );
}

/* ── Payment scene ────────────────────────────── */
const MINI_PEOPLE = [
  { name: 'Ana', amount: 50 },
  { name: 'Carlos', amount: 40 },
  { name: 'Lucía', amount: 35 },
];

export function PaymentScene() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 18 }}>
      <View style={[styles.rowBetween, { marginBottom: 16 }]}>
        <SymbolView name="chevron.left" tintColor={palette.ink2} size={16} />
        <Txt style={styles.appbarTitle}>SHARED GIFT</Txt>
        <SymbolView name="ellipsis" tintColor={palette.ink3} size={16} />
      </View>

      <View style={styles.giftCard}>
        <View style={styles.rowBetween}>
          <View>
            <Txt style={styles.eyebrowGold}>BIRTHDAY SURPRISE</Txt>
            <Txt style={styles.giftName}>For Lucía</Txt>
          </View>
          <View style={styles.pctPill}>
            <Txt style={styles.pctTxt}>78%</Txt>
          </View>
        </View>
        <View style={{ alignItems: 'center', marginVertical: 14 }}>
          <Txt style={styles.bigAmount}>$1,404</Txt>
          <Txt style={{ fontSize: 12, color: palette.ink3, marginTop: 2 }}>of $1,800</Txt>
        </View>
        <ProgressBar progress={78} />
      </View>

      <View style={{ gap: 8, marginTop: 12 }}>
        {MINI_PEOPLE.map((p, i) => (
          <FadeUp key={p.name} delay={200 + i * 110} distance={12}>
            <View style={styles.personRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.avatar}>
                  <Txt style={styles.avatarTxt}>{p.name[0]}</Txt>
                </View>
                <Txt style={{ fontSize: 14, fontWeight: '500', color: palette.ink2 }}>{p.name}</Txt>
              </View>
              <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.ink1 }}>+${p.amount}</Txt>
            </View>
          </FadeUp>
        ))}
      </View>

      <View style={styles.chipBtn}>
        <Txt style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Chip in</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 260,
    height: 540,
    backgroundColor: '#16181d',
    borderRadius: 44,
    padding: 8,
    shadowColor: '#0e1015',
    shadowOpacity: 0.4,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 30 },
    elevation: 12,
  },
  screen: {
    flex: 1,
    borderRadius: 37,
    overflow: 'hidden',
    backgroundColor: palette.bg,
  },
  island: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 74,
    height: 20,
    borderRadius: 99,
    backgroundColor: '#08090c',
    zIndex: 10,
  },
  status: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 13,
    zIndex: 9,
  },
  statusTxt: { fontSize: 12, fontWeight: '700', color: palette.ink1, fontFamily: fonts.sans },
  homeInd: {
    position: 'absolute',
    bottom: 7,
    alignSelf: 'center',
    width: 100,
    height: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(22,38,63,0.22)',
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sceneTitle: { fontFamily: fonts.serif, fontWeight: '600', fontSize: 22, color: palette.ink1 },
  search: {
    marginTop: 10,
    height: 38,
    borderRadius: 12,
    backgroundColor: palette.bg1,
    borderWidth: 1,
    borderColor: palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  chips: { flexDirection: 'row', gap: 6, marginTop: 10 },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: palette.bg2,
    borderWidth: 1,
    borderColor: palette.line,
  },
  chipActive: { backgroundColor: palette.navy, borderColor: palette.navy },
  chipTxt: { fontSize: 11, fontWeight: '600', color: palette.ink2 },
  miniCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: palette.bg1,
    borderWidth: 1,
    borderColor: palette.line,
  },
  miniHeader: { height: 96, backgroundColor: palette.navy, overflow: 'hidden' },
  miniBloom: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(216,176,97,0.22)',
    top: -50,
    right: -30,
  },
  ratingPill: {
    position: 'absolute',
    top: 9,
    left: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  pricePill: {
    position: 'absolute',
    bottom: 9,
    right: 9,
    backgroundColor: palette.gold,
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  priceTxt: { color: '#fff', fontWeight: '700', fontSize: 11.5 },
  miniBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  miniName: { fontFamily: fonts.serif, fontWeight: '600', fontSize: 16, color: palette.ink1 },
  miniMeta: { fontSize: 11.5, color: palette.ink3, marginTop: 2 },
  miniArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appbarTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: palette.ink3 },
  giftCard: {
    backgroundColor: palette.bg1,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 20,
    padding: 16,
  },
  eyebrowGold: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: palette.gold },
  giftName: { fontFamily: fonts.serif, fontWeight: '600', fontSize: 20, color: palette.ink1, marginTop: 3 },
  pctPill: {
    backgroundColor: palette.amberLo,
    borderWidth: 1,
    borderColor: palette.amberBr,
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 3,
    height: 24,
  },
  pctTxt: { fontSize: 11, fontWeight: '700', color: palette.gold },
  bigAmount: { fontSize: 34, fontWeight: '800', color: palette.ink1, letterSpacing: -1 },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.bg2,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: palette.cream, fontSize: 12, fontWeight: '700' },
  chipBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
