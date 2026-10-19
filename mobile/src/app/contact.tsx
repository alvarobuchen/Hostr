import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';

import { palette, space, radius } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { Button, Card } from '@/ui/primitives';
import { Field } from '@/ui/field';
import { BackBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { useI18n } from '@/lib/i18n';

export default function ContactScreen() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 700);
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BackBar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Screen>
          <FadeUp>
            <Txt variant="labelAmber">{t('contact.supportKicker')}</Txt>
            <Txt variant="title" style={{ marginTop: 10 }}>
              {t('contact.title')}
            </Txt>
            <Txt style={{ marginTop: 12 }}>{t('contact.intro')}</Txt>
          </FadeUp>

          <FadeUp delay={80} style={{ marginTop: 20, flexDirection: 'row', gap: 12 }}>
            <Card padded style={{ flex: 1, gap: 8, padding: 18 }}>
              <SymbolView name="envelope.fill" tintColor={palette.gold} size={20} />
              <Txt variant="label">{t('contact.email')}</Txt>
              <Txt style={{ fontSize: 13, color: palette.ink1, fontWeight: '600' }}>hello@cenit.app</Txt>
            </Card>
            <Card padded style={{ flex: 1, gap: 8, padding: 18 }}>
              <SymbolView name="mappin.circle.fill" tintColor={palette.gold} size={20} />
              <Txt variant="label">{t('contact.office')}</Txt>
              <Txt style={{ fontSize: 13, color: palette.ink1, fontWeight: '600' }}>{t('contact.officeAddr')}</Txt>
            </Card>
          </FadeUp>

          <FadeUp delay={140} style={{ marginTop: 20 }}>
            <Card padded style={{ gap: 16 }}>
              <View>
                <Txt variant="heading" style={{ fontSize: 20 }}>
                  {t('contact.sendTitle')}
                </Txt>
                <Txt style={{ marginTop: 6, fontSize: 14 }}>{t('contact.conciergeNote')}</Txt>
              </View>

              {sent && (
                <Animated.View entering={FadeIn}>
                  <Txt style={styles.ok}>{t('contact.success')}</Txt>
                </Animated.View>
              )}

              <Field label={t('contact.fullName')} value={name} onChangeText={setName} placeholder={t('contact.namePlaceholder')} />
              <Field
                label={t('contact.emailAddr')}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field label={t('contact.subject')} value={subject} onChangeText={setSubject} placeholder={t('contact.subjectPlaceholder')} />
              <Field
                label={t('contact.message')}
                value={message}
                onChangeText={setMessage}
                placeholder={t('contact.messagePlaceholder')}
                multiline
                style={{ minHeight: 110, textAlignVertical: 'top' }}
              />
              <Button label={t('contact.send')} size="lg" full loading={loading} onPress={submit} />
            </Card>
          </FadeUp>
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  ok: {
    fontSize: 13,
    color: palette.ok,
    backgroundColor: 'rgba(46,158,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(46,158,107,0.22)',
    borderRadius: radius.md,
    padding: 12,
  },
});
