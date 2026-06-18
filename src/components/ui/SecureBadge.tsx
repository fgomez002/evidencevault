import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';

interface Props {
  verified?: boolean;
  label?: string;
}

/**
 * Indicates an evidence item's integrity status. "Verified" means the stored
 * SHA-256 hash matches the file bytes (chain-of-custody intact).
 */
export function SecureBadge({ verified = true, label }: Props) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: (verified ? theme.colors.success : theme.colors.warning) + '22' },
      ]}
    >
      <Text style={styles.icon}>{verified ? '🔒' : '⚠️'}</Text>
      <Text variant="caption" tone={verified ? 'default' : 'default'}>
        {label ?? (verified ? 'Hash verified' : 'Unverified')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  icon: { fontSize: 11 },
});
