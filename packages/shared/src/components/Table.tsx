import { useState } from 'react'
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native'
import { colors, spacing, typography } from '../tokens'

export interface TableColumn<T> {
  key: string
  header: string
  /** Poids de largeur de la colonne (flex). Défaut : 1. */
  flex?: number
  align?: 'left' | 'right' | 'center'
  /** Rendu personnalisé d'une cellule ; par défaut affiche la valeur brute. */
  render?: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowPress?: (row: T) => void
}

/**
 * Tableau de données générique et réutilisable (web + natif).
 * En-tête + lignes ; chaque ligne peut être cliquable et réagit au survol.
 */
export function Table<T>({ columns, data, keyExtractor, onRowPress }: TableProps<T>) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const align = (a?: 'left' | 'right' | 'center') =>
    a === 'right' ? 'flex-end' : a === 'center' ? 'center' : 'flex-start'

  return (
    <View style={styles.table}>
      {/* En-tête */}
      <View style={[styles.row, styles.headerRow]}>
        {columns.map((col) => (
          <View key={col.key} style={[styles.cell, { flex: col.flex ?? 1, alignItems: align(col.align) }]}>
            <Text style={styles.headerText}>{col.header}</Text>
          </View>
        ))}
      </View>

      {/* Lignes */}
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => {
          const key = keyExtractor(item)
          const hovered = hoveredKey === key
          return (
            <Pressable
              onPress={onRowPress ? () => onRowPress(item) : undefined}
              onHoverIn={() => setHoveredKey(key)}
              onHoverOut={() => setHoveredKey((k) => (k === key ? null : k))}
              style={[styles.row, hovered && styles.rowHovered]}
            >
              {columns.map((col) => (
                <View key={col.key} style={[styles.cell, { flex: col.flex ?? 1, alignItems: align(col.align) }]}>
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <Text style={styles.cellText}>{String((item as Record<string, unknown>)[col.key] ?? '')}</Text>
                  )}
                </View>
              ))}
            </Pressable>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  table: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerRow: { backgroundColor: colors.surfaceElevated },
  rowHovered: { backgroundColor: colors.surfaceElevated },
  cell: { paddingRight: spacing.sm },
  headerText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  cellText: { fontSize: typography.base, color: colors.textPrimary },
})
