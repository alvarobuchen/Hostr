import { useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, Pressable } from 'react-native';
import { palette, radius, fonts } from '@/theme/tokens';
import { Txt } from '@/ui/text';

/** Labeled text input styled like the web `.inp` + `.field-label`. */
export function Field({
  label,
  hint,
  style,
  ...rest
}: TextInputProps & { label?: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ alignSelf: 'stretch' }}>
      {label ? (
        <Txt style={styles.label}>
          {label}
          {hint ? <Txt style={styles.hint}> {hint}</Txt> : null}
        </Txt>
      ) : null}
      <TextInput
        placeholderTextColor={palette.ink3}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && {
            borderColor: palette.amberBr,
            backgroundColor: palette.bg3,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

/** A checkbox-style toggle row (label + description + check). */
export function ToggleRow({
  title,
  desc,
  value,
  onChange,
}: {
  title: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.toggle}>
      <View style={{ flex: 1 }}>
        <Txt style={{ fontSize: 14, fontWeight: '600', color: palette.ink1, fontFamily: fonts.sans }}>
          {title}
        </Txt>
        {desc ? <Txt style={{ fontSize: 12, color: palette.ink3, marginTop: 2 }}>{desc}</Txt> : null}
      </View>
      <View style={[styles.check, value && { backgroundColor: palette.amber, borderColor: palette.amber }]}>
        {value ? <Txt style={{ color: palette.white, fontSize: 13, fontWeight: '700' }}>✓</Txt> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.ink2,
    marginBottom: 6,
    fontFamily: fonts.sans,
  },
  hint: { color: palette.ink3, fontWeight: '400' },
  input: {
    backgroundColor: palette.bg2,
    borderWidth: 1,
    borderColor: palette.line2,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.ink1,
    fontSize: 15,
    fontFamily: fonts.sans,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.bg2,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: palette.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
