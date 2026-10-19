import { useState } from 'react';
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { palette } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button } from '@/ui/primitives';
import { Field } from '@/ui/field';
import { Logo } from '@/ui/logo';
import { BackBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { useI18n } from '@/lib/i18n';

function validate(pw: string) {
  const errs: { key: string; ok: boolean }[] = [
    { key: 'signup.pw.len', ok: pw.length >= 8 },
    { key: 'signup.pw.upper', ok: /[A-Z]/.test(pw) },
    { key: 'signup.pw.lower', ok: /[a-z]/.test(pw) },
    { key: 'signup.pw.num', ok: /[0-9]/.test(pw) },
  ];
  return errs;
}

export function SignupForm({ host = false }: { host?: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const checks = validate(password);
  const allOk = checks.every((c) => c.ok);

  function submit() {
    if (!allOk) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace(host ? '/host' : '/(tabs)');
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
            {host && (
              <Txt variant="labelAmber" style={{ marginBottom: 6 }}>
                For venue hosts
              </Txt>
            )}
            <Txt variant="heading" style={{ fontSize: 28 }}>
              {host ? 'List your venue' : t('signup.title')}
            </Txt>
            <Txt style={{ marginTop: 6, marginBottom: 24 }}>
              {host
                ? 'Create your host account, then add your venue with the code we gave you.'
                : t('signup.subtitle')}
            </Txt>

            <View style={{ gap: 16 }}>
              <Field label={t('signup.fullName')} value={name} onChangeText={setName} placeholder={t('signup.namePlaceholder')} />
              <Field
                label={t('signup.email')}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View>
                <Field
                  label={t('signup.password')}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('signup.passwordPlaceholder')}
                  secureTextEntry
                />
                {password.length > 0 && (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    {allOk ? (
                      <Txt style={{ fontSize: 12, color: palette.ok }}>{t('signup.pw.ok')}</Txt>
                    ) : (
                      checks
                        .filter((c) => !c.ok)
                        .map((c) => (
                          <View key={c.key} style={styles.checkRow}>
                            <View style={styles.dot} />
                            <Txt style={{ fontSize: 12, color: palette.ink3 }}>{t(c.key)}</Txt>
                          </View>
                        ))
                    )}
                  </View>
                )}
              </View>
              <Button
                label={host ? 'Create host account' : t('signup.create')}
                size="lg"
                full
                loading={loading}
                disabled={!allOk}
                onPress={submit}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 24 }}>
              <Txt style={{ fontSize: 14 }}>{t('signup.haveAccount')}</Txt>
              <Pressable onPress={() => router.replace('/login')}>
                <Txt style={styles.linkStrong}>{t('signup.signIn')}</Txt>
              </Pressable>
            </View>
          </FadeUp>
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: palette.ink4 },
  linkStrong: { fontSize: 14, fontWeight: '700', color: palette.ink1 },
});
