import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Card, StatusBadge, Button, EmptyState, Skeleton, Modal } from '../../components/ui'
import { colors, spacing, typography, radius } from '../../tokens'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const MOCK_ORDERS = [
  { id: 'ord-1', status: 'pending' as OrderStatus, type: 'dine_in', totalAmount: '46.50', createdAt: new Date().toISOString(), customer: { name: 'Alice Martin' }, notes: 'Window table please' },
  { id: 'ord-2', status: 'confirmed' as OrderStatus, type: 'takeaway', totalAmount: '46.00', createdAt: new Date().toISOString(), customer: { name: 'Bob Dupont' }, notes: null },
  { id: 'ord-3', status: 'preparing' as OrderStatus, type: 'dine_in', totalAmount: '30.00', createdAt: new Date().toISOString(), customer: null, notes: null },
  { id: 'ord-4', status: 'delivered' as OrderStatus, type: 'delivery', totalAmount: '55.00', createdAt: new Date().toISOString(), customer: { name: 'Carol Lemaire' }, notes: null },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
}

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  pending: 'Confirm',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Delivered',
}

export default function OrdersScreen() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<(typeof MOCK_ORDERS)[0] | null>(null)
  const isLoading = false

  const filtered = filter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter((o) => o.status === filter)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      {/* Status filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterLabel, filter === f.value && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders list */}
      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={100} style={{ marginBottom: spacing.md, marginHorizontal: spacing.lg }} />)}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📋" title="No orders" description={`No ${filter === 'all' ? '' : filter} orders`} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: order }) => (
            <TouchableOpacity onPress={() => setSelectedOrder(order)}>
              <Card style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                  <StatusBadge status={order.status} />
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaText}>👤 {order.customer?.name ?? 'Anonymous'}</Text>
                  <Text style={styles.metaText}>🛍️ {order.type.replace('_', ' ')}</Text>
                  <Text style={styles.amount}>€{order.totalAmount}</Text>
                </View>
                {order.notes && <Text style={styles.notes}>📝 {order.notes}</Text>}
                {NEXT_STATUS[order.status] && (
                  <View style={styles.actionRow}>
                    <Button
                      label={ACTION_LABELS[order.status]!}
                      size="sm"
                      onPress={() => {
                        // TODO: appeler useUpdateOrderStatus (hook Orval)
                        console.log('transition', order.id, NEXT_STATUS[order.status])
                      }}
                    />
                    {order.status === 'pending' && (
                      <Button label="Cancel" size="sm" variant="danger"
                        onPress={() => console.log('cancel', order.id)}
                      />
                    )}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <Modal visible={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder.id.slice(-6).toUpperCase()}`}>
          <View style={styles.detail}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Status</Text><StatusBadge status={selectedOrder.status} /></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Type</Text><Text style={styles.detailValue}>{selectedOrder.type.replace('_', ' ')}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Customer</Text><Text style={styles.detailValue}>{selectedOrder.customer?.name ?? 'Anonymous'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Total</Text><Text style={[styles.detailValue, styles.totalValue]}>€{selectedOrder.totalAmount}</Text></View>
            {selectedOrder.notes && <View style={styles.detailRow}><Text style={styles.detailLabel}>Notes</Text><Text style={styles.detailValue}>{selectedOrder.notes}</Text></View>}
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
  filterRow: { maxHeight: 48 },
  filterContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  filterLabelActive: { color: colors.textInverse },
  list: { padding: spacing.lg, gap: spacing.md },
  orderCard: { gap: spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: typography.base, fontWeight: typography.bold, color: colors.textPrimary },
  orderMeta: { flexDirection: 'row', gap: spacing.lg, flexWrap: 'wrap', alignItems: 'center' },
  metaText: { fontSize: typography.sm, color: colors.textSecondary },
  amount: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.primary, marginLeft: 'auto' },
  notes: { fontSize: typography.sm, color: colors.textSecondary, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  detail: { gap: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: typography.sm, color: colors.textSecondary },
  detailValue: { fontSize: typography.base, color: colors.textPrimary },
  totalValue: { fontWeight: typography.bold, color: colors.primary },
})
