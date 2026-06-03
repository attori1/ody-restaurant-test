import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native'
import { colors, spacing, radius, typography } from '../../tokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  onPress?: () => void
  label: string
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export function Button({ onPress, label, variant = 'primary', size = 'md', loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, styles[variant], styles[`size_${size}`], isDisabled && styles.disabled, style]}
      activeOpacity={0.75}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'primary' ? colors.textInverse : colors.primary} style={styles.spinner} />}
      <Text style={[labelStyles[variant], labelSizeStyles[size]]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  size_sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minHeight: 32 },
  size_md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, minHeight: 40 },
  size_lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, minHeight: 48 },
  disabled: { opacity: 0.45 },
  spinner: { marginRight: spacing.xs },
})

const labelStyles = StyleSheet.create({
  primary: { color: colors.textInverse },
  secondary: { color: colors.textPrimary },
  ghost: { color: colors.primary },
  danger: { color: colors.textInverse },
})

const labelSizeStyles = StyleSheet.create({
  sm: { fontSize: typography.sm, fontWeight: typography.medium },
  md: { fontSize: typography.base, fontWeight: typography.semibold },
  lg: { fontSize: typography.lg, fontWeight: typography.semibold },
})
