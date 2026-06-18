import { Pressable, View, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';

interface Props {
  label: string;
  color?: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, color = theme.colors.accent, icon, selected, onPress }: Props) {
  const content = (
    <View
      style={[
        styles.chip,
        { borderColor: selected ? color : theme.colors.border },
        selected && { backgroundColor: color + '22' },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text variant="label" tone={selected ? 'default' : 'muted'}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  icon: { fontSize: 13 },
  pressed: { opacity: 0.7 },
});
