import { View, ViewProps, StyleSheet, Pressable, PressableProps } from 'react-native';
import { theme } from '@/theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
}

export function Card({ elevated, padded = true, style, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.card,
        elevated && styles.elevated,
        padded && styles.padded,
        style,
      ]}
    />
  );
}

interface PressableCardProps extends PressableProps {
  elevated?: boolean;
  padded?: boolean;
}

export function PressableCard({ elevated, padded = true, style, ...rest }: PressableCardProps) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.card,
        elevated && styles.elevated,
        padded && styles.padded,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  padded: {
    padding: theme.spacing.lg,
  },
  pressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
});
