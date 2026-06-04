import { useState } from 'react'
import { Pressable, Text, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native'
import { colors, spacing, radius, typography } from '../tokens'

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
  // États interactifs gérés explicitement pour couvrir web (hover/focus) et tactile (pressed).
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        // hover : léger assombrissement ; pressed : un peu plus marqué
        !isDisabled && hovered && hoverStyles[variant],
        !isDisabled && pressed && styles.pressed,
        // focus : anneau visible (accessibilité clavier)
        focused && styles.focused,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? colors.textInverse : colors.primary} style={styles.spinner} />}
      <Text style={[labelStyles[variant], labelSizeStyles[size]]}>{label}</Text>
    </Pressable>
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
  pressed: { opacity: 0.7 },
  focused: { borderWidth: 2, borderColor: colors.primaryDark },
  disabled: { opacity: 0.45 },
  spinner: { marginRight: spacing.xs },
})

// Couleurs au survol : une teinte plus soutenue par variante.
const hoverStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryDark },
  secondary: { backgroundColor: colors.border },
  ghost: { backgroundColor: colors.surfaceElevated },
  danger: { backgroundColor: '#DC2626' },
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
