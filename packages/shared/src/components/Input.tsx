import { View, TextInput, Text, StyleSheet, type TextInputProps } from 'react-native'
import { colors, spacing, radius, typography } from '../tokens'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.error },
  error: { fontSize: typography.xs, color: colors.error },
  hint: { fontSize: typography.xs, color: colors.textTertiary },
})
