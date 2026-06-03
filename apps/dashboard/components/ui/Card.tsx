import { View, StyleSheet, type ViewStyle } from 'react-native'
import { colors, radius, shadows, spacing } from '../../tokens'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  elevated?: boolean
}

export function Card({ children, style, elevated }: CardProps) {
  return (
    <View style={[styles.card, elevated && shadows.md, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
})
