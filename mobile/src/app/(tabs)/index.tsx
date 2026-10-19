import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { palette, space, radius } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Card } from '@/ui/primitives';
import { BrandBar } from '@/ui/bars';
import { FadeUp } from '@/ui/motion';
import { Confetti } from '@/ui/confetti';
import { PhoneFrame, VenuesScene, PaymentScene } from '@/ui/phone-mock';
import { Footer } from '@/ui/footer';
import { useI18n } from '@/lib/i18n';

const STEPS: { eyebrow: string; title: string; body: string; icon: SymbolViewProps['name']; done?: boolean }[] = [
  {
    eyebrow: 'Step 1 · Create',
    title: 'Set the goal.',
    body: 'The organizer picks an occasion, adds a name, and sets a target amount. The gift is live in seconds.',
    icon: 'square.and.pencil',
  },
  {
    eyebrow: 'Step 2 · Share',
    title: 'Send one link.',
    body: 'A unique code and shareable link are generated. Send it via WhatsApp, email, or anywhere guests can reach.',
    icon: 'square.and.arrow.up',
  },
  {
    eyebrow: 'Step 3 · Guests pay',
    title: 'Each friend chips in.',
    body: 'Guests open the link and pay their share through Stripe. No account, no app — just one tap.',
    icon: 'creditcard',
  },
  {
    eyebrow: 'Step 4 · Done',
    title: 'Goal reached.',
    body: 'Once fully funded, the organizer claims the total straight to their bank. Zero hassle.',
    icon: 'checkmark.seal.fill',
    done: true,
  },
];

function ReelSection({
  eyebrow,
  title,
  body,
  cta,
  onCta,
  scene,
  tinted,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  onCta: () => void;
  scene: React.ReactNode;
  tinted?: boolean;
}) {
  return (
    <View style={[styles.reel, tinted && { backgroundColor: palette.bg2 }]}>
      <FadeUp>
        <Txt variant="labelAmber">{eyebrow}</Txt>
        <Txt variant="title" style={{ marginTop: 8 }}>
          {title}
        </Txt>
        <Txt style={{ marginTop: 10, maxWidth: 320 }}>{body}</Txt>
        <View style={{ marginTop: 18, flexDirection: 'row' }}>
          <Button label={cta} onPress={onCta} />
        </View>
      </FadeUp>
      <FadeUp delay={120} style={{ alignItems: 'center', marginTop: space.xxl }}>
        <PhoneFrame>{scene}</PhoneFrame>
      </FadeUp>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BrandBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Confetti />
          <FadeUp>
            <Txt variant="labelAmber" center>
              {t('home.eyebrow')}
            </Txt>
          </FadeUp>
          <FadeUp delay={80}>
            <Txt variant="display" center style={{ marginTop: 16 }}>
              {t('home.title1')}{' '}
              <Txt variant="display" color={palette.gold}>
                {t('home.titleGold')}
              </Txt>
            </Txt>
            <Txt variant="display" center>
              {t('home.title2')}
            </Txt>
          </FadeUp>
          <FadeUp delay={200}>
            <Txt center style={{ marginTop: 16, maxWidth: 320 }}>
              {t('home.subtitle')}
            </Txt>
          </FadeUp>
          <FadeUp delay={300} style={styles.ctaWrap}>
            <Button label={t('home.cta.browseVenues')} size="lg" onPress={() => router.push('/venues')} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                label={t('home.cta.createGift')}
                variant="ghost"
                onPress={() => router.push('/gift/create')}
              />
              <Button label={t('home.cta.payGift')} variant="ghost" onPress={() => router.push('/guest')} />
            </View>
          </FadeUp>
          <FadeUp delay={500} style={{ marginTop: 30 }}>
            <SymbolView name="chevron.down" tintColor={palette.amber} size={20} />
          </FadeUp>
        </View>

        {/* ── Reel: venues ── */}
        <ReelSection
          eyebrow={t('reel.venues.eyebrow')}
          title={t('reel.venues.title')}
          body={t('reel.venues.body')}
          cta={t('reel.venues.cta')}
          onCta={() => router.push('/venues')}
          scene={<VenuesScene />}
        />

        {/* ── Reel: gifts ── */}
        <ReelSection
          eyebrow={t('reel.gifts.eyebrow')}
          title={t('reel.gifts.title')}
          body={t('reel.gifts.body')}
          cta={t('reel.gifts.cta')}
          onCta={() => router.push('/gift/create')}
          scene={<PaymentScene />}
          tinted
        />

        {/* ── Gift explainer steps ── */}
        <View style={styles.steps}>
          <FadeUp style={{ alignItems: 'center', marginBottom: 24 }}>
            <Txt variant="labelAmber" center>
              How shared gifts work
            </Txt>
            <Txt variant="title" center style={{ marginTop: 8 }}>
              From idea to funded
            </Txt>
          </FadeUp>
          <View style={{ gap: 14 }}>
            {STEPS.map((s, i) => (
              <FadeUp key={i} delay={i * 90}>
                <Card padded style={styles.stepCard}>
                  <View style={[styles.stepIcon, s.done && { backgroundColor: 'rgba(46,158,107,0.1)' }]}>
                    <SymbolView
                      name={s.icon}
                      tintColor={s.done ? palette.ok : palette.gold}
                      size={22}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt variant="labelAmber" style={{ marginBottom: 4 }}>
                      {s.eyebrow}
                    </Txt>
                    <Txt variant="heading" style={{ fontSize: 17, marginBottom: 4 }}>
                      {s.title}
                    </Txt>
                    <Txt style={{ fontSize: 14 }}>{s.body}</Txt>
                  </View>
                </Card>
              </FadeUp>
            ))}
          </View>
          <View style={{ alignItems: 'center', marginTop: 26 }}>
            <Button
              label="Start a shared gift"
              size="lg"
              onPress={() => router.push('/gift/create')}
            />
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 520,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: 60,
    overflow: 'hidden',
  },
  ctaWrap: { marginTop: 28, gap: 10, alignItems: 'center' },
  reel: { paddingHorizontal: space.xl, paddingVertical: 56 },
  steps: { paddingHorizontal: space.xl, paddingVertical: 40 },
  stepCard: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', padding: 20 },
  stepIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: palette.bg2,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
