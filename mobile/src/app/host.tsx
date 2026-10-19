import { View, StyleSheet } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { palette, space, radius, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Card, Badge, Tile, Rule } from '@/ui/primitives';
import { BackBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';

const RESERVATIONS = [
  { guest: 'Ana Torres', date: '15 Aug 2026', guests: 60, deposit: 640, status: 'Confirmed' },
  { guest: 'Marc Vidal', date: '02 Sep 2026', guests: 90, deposit: 980, status: 'Confirmed' },
  { guest: 'Lucía Prat', date: '21 Sep 2026', guests: 40, deposit: 420, status: 'Pending' },
];

function NavCard({ icon, title, sub }: { icon: SymbolViewProps['name']; title: string; sub: string }) {
  return (
    <Card style={styles.navCard}>
      <View style={styles.navIcon}>
        <SymbolView name={icon} tintColor={palette.gold} size={20} />
      </View>
      <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.ink1, marginTop: 10 }}>{title}</Txt>
      <Txt style={{ fontSize: 12, color: palette.ink3, marginTop: 2 }}>{sub}</Txt>
    </Card>
  );
}

export default function HostDashboard() {
  const totalDeposits = RESERVATIONS.reduce((s, r) => s + r.deposit, 0);

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BackBar />
      <Screen>
        <FadeUp>
          <Txt variant="labelAmber">Venue host</Txt>
          <Txt variant="title" style={{ marginTop: 8 }}>
            Showroom Fashion Bar
          </Txt>
          <Txt style={{ marginTop: 10 }}>
            Manage your bookings, availability and payouts — all from one dashboard.
          </Txt>
        </FadeUp>

        {/* Stats */}
        <FadeUp delay={60} style={{ marginTop: 22, flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Tile label="Upcoming" value={String(RESERVATIONS.length)} style={{ flexBasis: '48%', flexGrow: 1 }} />
          <Tile label="Deposits" value={`$${totalDeposits}`} amber style={{ flexBasis: '48%', flexGrow: 1 }} />
        </FadeUp>

        {/* Quick nav */}
        <FadeUp delay={100} style={{ marginTop: 16, flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flexBasis: '48%', flexGrow: 1 }}>
            <NavCard icon="calendar" title="Availability" sub="Block or open dates" />
          </View>
          <View style={{ flexBasis: '48%', flexGrow: 1 }}>
            <NavCard icon="banknote" title="Payouts" sub="Withdraw to bank" />
          </View>
        </FadeUp>

        {/* Claim code */}
        <FadeUp delay={140} style={{ marginTop: 16 }}>
          <Card padded style={{ gap: 12 }}>
            <Txt variant="label">Add another venue</Txt>
            <Txt style={{ fontSize: 14 }}>
              Enter the claim code we sent you to connect a new space to your host account.
            </Txt>
            <Button label="Enter claim code" variant="ghost" onPress={() => {}} />
          </Card>
        </FadeUp>

        {/* Reservations */}
        <FadeUp delay={180} style={{ marginTop: 16 }}>
          <Card padded style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt variant="heading" style={{ fontSize: 18 }}>
                Reservations
              </Txt>
              <Badge label="Live" amber />
            </View>
            <View style={{ gap: 10 }}>
              {RESERVATIONS.map((r, i) => (
                <View key={i}>
                  {i > 0 && <Rule style={{ marginBottom: 10 }} />}
                  <View style={styles.resRow}>
                    <View style={{ flex: 1 }}>
                      <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.ink1 }}>{r.guest}</Txt>
                      <Txt style={{ fontSize: 12, color: palette.ink3, marginTop: 2 }}>
                        {r.date} · {r.guests} guests
                      </Txt>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Txt style={{ fontSize: 14, fontWeight: '700', color: palette.amber }}>${r.deposit}</Txt>
                      <View
                        style={[
                          styles.status,
                          r.status === 'Pending' ? { backgroundColor: palette.bg3 } : { backgroundColor: 'rgba(46,158,107,0.12)' },
                        ]}
                      >
                        <Txt
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            letterSpacing: 0.5,
                            color: r.status === 'Pending' ? palette.ink2 : palette.ok,
                          }}
                        >
                          {r.status.toUpperCase()}
                        </Txt>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </FadeUp>

        {/* Payout */}
        <FadeUp delay={220} style={{ marginTop: 16 }}>
          <Card padded style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View>
                <Txt variant="label">Available to withdraw</Txt>
                <Txt style={{ fontSize: 26, fontWeight: '700', color: palette.ink1, marginTop: 4 }}>
                  ${totalDeposits}
                </Txt>
              </View>
              <Button label="Withdraw" size="sm" onPress={() => {}} />
            </View>
          </Card>
        </FadeUp>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  navCard: { padding: 16 },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.amberLo,
    borderWidth: 1,
    borderColor: palette.amberBr,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  status: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
});
