import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { Card, Button, Modal, EmptyState, Skeleton } from '../../components/ui'
import { colors, spacing, typography } from '../../tokens'

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Alice Martin', email: 'alice@example.com', phone: '+33 6 12 34 56 78', orderCount: 8, totalSpend: '312.50', lastOrderAt: '2024-01-15T14:30:00Z' },
  { id: '2', name: 'Bob Dupont', email: 'bob@example.com', phone: '+33 6 98 76 54 32', orderCount: 3, totalSpend: '124.00', lastOrderAt: '2024-01-10T12:00:00Z' },
  { id: '3', name: 'Carol Lemaire', email: 'carol@example.com', phone: '+33 7 11 22 33 44', orderCount: 1, totalSpend: '30.00', lastOrderAt: '2024-01-05T19:00:00Z' },
]

export default function CrmScreen() {
  const [selected, setSelected] = useState<(typeof MOCK_CUSTOMERS)[0] | null>(null)
  const isLoading = false

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CRM</Text>
        <Text style={styles.subtitle}>{MOCK_CUSTOMERS.length} customers</Text>
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={80} style={{ marginBottom: spacing.md }} />)}
        </View>
      ) : MOCK_CUSTOMERS.length === 0 ? (
        <EmptyState icon="👥" title="No customers yet" description="Customers will appear here once orders are placed" />
      ) : (
        <FlatList
          data={MOCK_CUSTOMERS}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: customer }) => (
            <TouchableOpacity onPress={() => setSelected(customer)}>
              <Card style={styles.customerCard}>
                <View style={styles.customerRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{customer.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={styles.name}>{customer.name}</Text>
                    <Text style={styles.email}>{customer.email}</Text>
                  </View>
                  <View style={styles.stats}>
                    <Text style={styles.spend}>€{customer.totalSpend}</Text>
                    <Text style={styles.orderCount}>{customer.orderCount} orders</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {selected && (
        <Modal visible={!!selected} onClose={() => setSelected(null)} title={selected.name}>
          <View style={styles.detail}>
            <View style={styles.detailRow}><Text style={styles.label}>Email</Text><Text style={styles.value}>{selected.email}</Text></View>
            <View style={styles.detailRow}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{selected.phone ?? '—'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.label}>Orders</Text><Text style={styles.value}>{selected.orderCount}</Text></View>
            <View style={styles.detailRow}><Text style={styles.label}>Total Spend</Text><Text style={[styles.value, styles.bold]}>€{selected.totalSpend}</Text></View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Last Order</Text>
              <Text style={styles.value}>{selected.lastOrderAt ? new Date(selected.lastOrderAt).toLocaleDateString() : '—'}</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.base, color: colors.textSecondary },
  list: { padding: spacing.lg, gap: spacing.md },
  customerCard: { padding: spacing.md },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.primary },
  customerInfo: { flex: 1 },
  name: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary },
  email: { fontSize: typography.sm, color: colors.textSecondary },
  stats: { alignItems: 'flex-end' },
  spend: { fontSize: typography.base, fontWeight: typography.bold, color: colors.primary },
  orderCount: { fontSize: typography.xs, color: colors.textTertiary },
  detail: { gap: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: typography.sm, color: colors.textSecondary },
  value: { fontSize: typography.base, color: colors.textPrimary },
  bold: { fontWeight: typography.bold },
})
