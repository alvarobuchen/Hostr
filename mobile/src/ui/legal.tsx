import { View } from 'react-native';
import { palette, space } from '@/theme/tokens';
import { Txt } from '@/ui/text';
import { BackBar } from '@/ui/bars';
import { Screen } from '@/ui/screen';
import { FadeUp } from '@/ui/motion';
import { useI18n } from '@/lib/i18n';

const EMAIL = 'hello@cenit.app';

export function LegalPage({ prefix, count }: { prefix: 'privacy' | 'terms'; count: number }) {
  const { t, ta } = useI18n();

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <BackBar />
      <Screen>
        <FadeUp>
          <Txt variant="title">{t(`${prefix}.title`)}</Txt>
          <Txt style={{ marginTop: 8, fontSize: 13, color: palette.ink3 }}>
            {t(`${prefix}.updated`)} July 2026
          </Txt>
        </FadeUp>

        <View style={{ marginTop: 24, gap: 24 }}>
          {Array.from({ length: count }, (_, idx) => {
            const i = idx + 1;
            const title = t(`${prefix}.s${i}.title`);
            const items = ta(`${prefix}.s${i}.items`);
            const special = prefix === 'privacy' && i === 7;
            const body = t(`${prefix}.s${i}.body`);
            const hasBody = body !== `${prefix}.s${i}.body`;

            return (
              <FadeUp key={i} delay={idx * 30}>
                <Txt variant="heading" style={{ fontSize: 17, marginBottom: 8 }}>
                  {title}
                </Txt>

                {special ? (
                  <Txt style={{ fontSize: 14, lineHeight: 22 }}>
                    {t('privacy.s7.body1')}
                    <Txt style={{ color: palette.amber, fontWeight: '600' }}>{EMAIL}</Txt>
                    {t('privacy.s7.body2')}
                  </Txt>
                ) : hasBody ? (
                  <Txt style={{ fontSize: 14, lineHeight: 22 }}>{body}</Txt>
                ) : null}

                {items.length > 0 && (
                  <View style={{ marginTop: 10, gap: 8 }}>
                    {items.map((it, k) => (
                      <View key={k} style={{ flexDirection: 'row', gap: 10 }}>
                        <View
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: palette.amber,
                            marginTop: 8,
                          }}
                        />
                        <Txt style={{ flex: 1, fontSize: 14, lineHeight: 22 }}>{it}</Txt>
                      </View>
                    ))}
                  </View>
                )}

                {i === count && (
                  <Txt style={{ marginTop: 10, fontSize: 14 }}>
                    <Txt style={{ fontWeight: '600' }}>{t(`${prefix}.emailLabel`)} </Txt>
                    <Txt style={{ color: palette.amber, fontWeight: '600' }}>{EMAIL}</Txt>
                  </Txt>
                )}
              </FadeUp>
            );
          })}
        </View>
      </Screen>
    </View>
  );
}
