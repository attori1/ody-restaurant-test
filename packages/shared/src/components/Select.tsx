import { useState } from 'react'
import { View, Text, Pressable, Modal, FlatList, StyleSheet, type ViewStyle } from 'react-native'
import { colors, spacing, radius, typography, shadows } from '../tokens'

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label?: string
  value?: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  style?: ViewStyle
}

/**
 * Select / dropdown réutilisable, compatible web et natif.
 * Le champ affiche l'option courante ; au clic, une liste d'options s'ouvre
 * dans une overlay (RN Modal) — robuste sur toutes les plateformes.
 */
export function Select({ label, value, options, onChange, placeholder = 'Select…', error, style }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const selected = options.find((o) => o.value === value)

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={() => setOpen(true)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.trigger,
          hovered && styles.triggerHovered,
          focused && styles.triggerFocused,
          error && styles.triggerError,
        ]}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.menu} onPress={() => {}}>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value)
                      setOpen(false)
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{item.label}</Text>
                    {isSelected && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                )
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.textPrimary },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  triggerHovered: { borderColor: colors.textTertiary },
  triggerFocused: { borderColor: colors.primary, borderWidth: 2 },
  triggerError: { borderColor: colors.error },
  triggerText: { fontSize: typography.base, color: colors.textPrimary, flex: 1 },
  placeholder: { color: colors.textTertiary },
  chevron: { fontSize: 10, color: colors.textSecondary, marginLeft: spacing.sm },
  error: { fontSize: typography.xs, color: colors.error },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 360,
    maxHeight: '60%',
    paddingVertical: spacing.xs,
    ...shadows.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionSelected: { backgroundColor: colors.primary + '12' },
  optionPressed: { backgroundColor: colors.surfaceElevated },
  optionText: { fontSize: typography.base, color: colors.textPrimary },
  optionTextSelected: { fontWeight: typography.semibold, color: colors.primary },
  check: { fontSize: typography.base, color: colors.primary },
})
