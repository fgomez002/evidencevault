import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  icon: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text variant="heading" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text tone="muted" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.sm },
  icon: { fontSize: 48 },
  title: { textAlign: 'center', marginTop: theme.spacing.sm },
  message: { textAlign: 'center', maxWidth: 280 },
  action: { marginTop: theme.spacing.lg },
});
