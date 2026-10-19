import { useState } from 'react';
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { palette, space, radius } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Card } from '@/ui/primitives';
import { Field } from '@/ui/field';
import { BrandBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { useGifts } from '@/lib/gifts-store';
import { useI18n } from '@/lib/i18n';

export default function GuestScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { getByCode } = useGifts();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function submit() {
    setLoading(true);
    setError('');
    const found = getByCode(code.trim());
    setTimeout(() => {
      setLoading(false);
      if (found) {
        router.push(`/gift/${found.code}`);
      } else {
        setError(t('guest.invalid'));
      }
    }, 500);
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BrandBar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Screen>
          <FadeUp>
            <Txt variant="labelAmber">{t('guest.kicker')}</Txt>
            <Txt variant="title" style={{ marginTop: 10 }}>
              {t('guest.title')}
            </Txt>
            <Txt style={{ marginTop: 12 }}>{t('guest.subtitle')}</Txt>
          </FadeUp>

          <FadeUp delay={100} style={{ marginTop: 24 }}>
            <Card padded style={{ gap: 16 }}>
              <View>
                <Txt variant="heading" style={{ fontSize: 20 }}>
                  {t('guest.form.title')}
                </Txt>
                <Txt style={{ marginTop: 6, fontSize: 14 }}>{t('guest.form.subtitle')}</Txt>
              </View>

              {error ? <Txt style={styles.err}>{error}</Txt> : null}

              <Field
                label={t('guest.codeLabel')}
                value={code}
                onChangeText={(v) => setCode(v.toUpperCase())}
                placeholder={t('guest.codePlaceholder')}
                autoCapitalize="characters"
                style={{ letterSpacing: 3, fontWeight: '600' }}
              />
              <Field label={t('guest.nameLabel')} value={name} onChangeText={setName} placeholder={t('guest.namePlaceholder')} />
              <Button label={t('guest.access')} size="lg" full loading={loading} onPress={submit} />

              <View style={{ gap: 6, alignItems: 'center', marginTop: 4 }}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <Txt style={{ fontSize: 14 }}>{t('guest.haveAccount')}</Txt>
                  <Pressable onPress={() => router.push('/login')}>
                    <Txt style={styles.linkStrong}>{t('guest.signInInstead')}</Txt>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <Txt style={{ fontSize: 14 }}>{t('guest.noAccount')}</Txt>
                  <Pressable onPress={() => router.push('/signup')}>
                    <Txt style={styles.linkStrong}>{t('guest.createOne')}</Txt>
                  </Pressable>
                </View>
              </View>
            </Card>
          </FadeUp>

          <FadeUp delay={160} style={{ marginTop: 16 }}>
            <View style={styles.hint}>
              <Txt style={{ fontSize: 13, color: palette.ink2 }}>
                Try a demo code: <Txt style={{ fontWeight: '700', color: palette.ink1 }}>LUCIA24</Txt> or{' '}
                <Txt style={{ fontWeight: '700', color: palette.ink1 }}>MARCOS7</Txt>
              </Txt>
            </View>
          </FadeUp>
        </Screen>
      </KeyboardAvoidingView>
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
  linkStrong: { fontSize: 14, fontWeight: '700', color: palette.ink1 },
  hint: {
    borderWidth: 1,
    borderColor: palette.amberBr,
    backgroundColor: palette.amberLo,
    borderRadius: radius.md,
    padding: 14,
  },
});
