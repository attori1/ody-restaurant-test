import { useState } from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography } from '../tokens'

interface ChipProps {
  label: string
  active?: boolean
  onPress?: () => void
}

/**
 * Puce de filtre/sélection réutilisable, avec états hover (web) et actif.
 * Centralise le style des filtres répétés sur plusieurs écrans.
 */
export function Chip({ label, active, onPress }: ChipProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.chip, hovered && !active && styles.chipHovered, active && styles.chipActive]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipHovered: { borderColor: colors.textTertiary, backgroundColor: colors.surfaceElevated },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  labelActive: { color: colors.textInverse },
})
