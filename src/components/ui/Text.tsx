import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { theme } from '@/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'danger' | 'inverse';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: keyof typeof theme.font.weight;
}

const toneColor: Record<Tone, string> = {
  default: theme.colors.text,
  muted: theme.colors.textMuted,
  faint: theme.colors.textFaint,
  accent: theme.colors.accent,
  danger: theme.colors.danger,
  inverse: theme.colors.textInverse,
};

export function Text({ variant = 'body', tone = 'default', weight, style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={[
        styles[variant],
        { color: toneColor[tone] },
        weight ? { fontWeight: theme.font.weight[weight] } : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontSize: theme.font.size.display, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: theme.font.size.xxl, fontWeight: '700', letterSpacing: -0.3 },
  heading: { fontSize: theme.font.size.lg, fontWeight: '600' },
  body: { fontSize: theme.font.size.md, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: theme.font.size.sm, fontWeight: '600' },
  caption: { fontSize: theme.font.size.xs, fontWeight: '500' },
});
