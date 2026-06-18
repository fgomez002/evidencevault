import { Pressable } from 'react-native';
import { Card } from './Card';
import { Text } from './Text';
import { theme } from '@/theme';

interface Props {
  label: string;
  value?: string | null;
  onPress?: () => void;
  multiline?: boolean;
}

/** A labelled read-only field used across the record detail screens. */
export function DetailField({ label, value, onPress, multiline }: Props) {
  if (!value) return null;
  const body = (
    <Card style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
      <Text variant="label" tone="muted">
        {label.toUpperCase()}
      </Text>
      <Text style={{ lineHeight: 22 }} tone={onPress ? 'accent' : 'default'} numberOfLines={multiline ? undefined : 1}>
        {value}
      </Text>
    </Card>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}
