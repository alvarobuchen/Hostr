import { useState } from 'react';
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { palette, space, radius } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Rule } from '@/ui/primitives';
import { Field } from '@/ui/field';
import { Logo } from '@/ui/logo';
import { BackBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { useI18n } from '@/lib/i18n';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function submit() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 700);
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BackBar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Screen>
          <FadeUp>
            <View style={{ marginBottom: 24 }}>
              <Logo size={28} />
            </View>
            <Txt variant="heading" style={{ fontSize: 28 }}>
              {t('login.title')}
            </Txt>
            <Txt style={{ marginTop: 6, marginBottom: 24 }}>{t('login.subtitle')}</Txt>

            <View style={{ gap: 16 }}>
              <Field
                label={t('login.email')}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                label={t('login.password')}
                value={password}
                onChangeText={setPassword}
                placeholder={t('login.passwordPlaceholder')}
                secureTextEntry
              />
              <Button label={t('login.signIn')} size="lg" full loading={loading} onPress={submit} />
            </View>

            <View style={styles.or}>
              <Rule style={{ flex: 1 }} />
              <Txt style={{ fontSize: 12, color: palette.ink3 }}>{t('login.or')}</Txt>
              <Rule style={{ flex: 1 }} />
            </View>

            <Button label={t('login.giftCode')} variant="ghost" full onPress={() => router.push('/guest')} />

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 24 }}>
              <Txt style={{ fontSize: 14 }}>{t('login.noAccount')}</Txt>
              <Pressable onPress={() => router.replace('/signup')}>
                <Txt style={styles.linkStrong}>{t('login.signUpFree')}</Txt>
              </Pressable>
            </View>
          </FadeUp>
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  linkStrong: { fontSize: 14, fontWeight: '700', color: palette.ink1 },
});
