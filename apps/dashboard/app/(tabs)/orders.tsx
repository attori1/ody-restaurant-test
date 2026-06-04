import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import axios from 'axios'
import { Card, StatusBadge, Button, Chip, EmptyState, Skeleton, Modal, useToast } from '@ody/shared'
import { colors, spacing, typography } from '@ody/shared'
import { useOrders, useOrderDetail, type OrderStatus } from '../../hooks/useOrders'
import { NewOrderModal } from '../../components/NewOrderModal'
import type { PostApiOrdersIdStatusBodyStatus } from '@ody/api-client'

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function OrdersScreen() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNewOrder, setShowNewOrder] = useState(false)

  const toast = useToast()
  const { orders, isLoading, isError, getNextAction, updateStatus, isUpdating } = useOrders(
    filter === 'all' ? undefined : filter
  )
  const { data: detail, isLoading: detailLoading } = useOrderDetail(selectedId)

  // Applique une transition de statut et affiche un toast (succès ou erreur backend).
  const changeStatus = async (id: string, status: PostApiOrdersIdStatusBodyStatus) => {
    try {
      await updateStatus(id, status)
      toast.success(`Order marked as ${status}`)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error ?? 'Could not update the order.'
        : 'Could not update the order.'
      toast.error(message)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Button label="+ New Order" size="sm" onPress={() => setShowNewOrder(true)} />
      </View>

      {/* Filtres par statut */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {STATUS_FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} active={filter === f.value} onPress={() => setFilter(f.value)} />
        ))}
      </ScrollView>

      {/* Liste */}
      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={120} style={{ marginBottom: spacing.md }} />)}
        </View>
      ) : isError ? (
        <EmptyState icon="⚠️" title="Couldn't load orders" description="Check that the backend is running" />
      ) : orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders" description={filter === 'all' ? 'No orders yet' : `No ${filter} orders`} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: order }) => {
            const nextAction = getNextAction(order.status)
            return (
              <TouchableOpacity onPress={() => setSelectedId(order.id)} activeOpacity={0.7}>
                <Card style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                    <StatusBadge status={order.status} />
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.metaText}>🛍️ {order.type.replace('_', ' ')}</Text>
                    <Text style={styles.amount}>€{order.totalAmount}</Text>
                  </View>
                  {order.notes && <Text style={styles.notes}>📝 {order.notes}</Text>}
                  {(nextAction || order.status === 'pending') && (
                    <View style={styles.actionRow}>
                      {nextAction && (
                        <Button
                          label={nextAction.label}
                          size="sm"
                          loading={isUpdating}
                          onPress={() => changeStatus(order.id, nextAction.status)}
                        />
                      )}
                      {order.status === 'pending' && (
                        <Button label="Cancel" size="sm" variant="danger"
                          onPress={() => changeStatus(order.id, 'cancelled')}
                        />
                      )}
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            )
          }}
        />
      )}

      {/* Détail commande — chargé via useOrderDetail */}
      <Modal visible={!!selectedId} onClose={() => setSelectedId(null)} title={detail ? `Order #${detail.id.slice(-6).toUpperCase()}` : 'Order'}>
        {detailLoading || !detail ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={20} /><Skeleton height={20} /><Skeleton height={60} />
          </View>
        ) : (
          <View style={styles.detail}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Status</Text><StatusBadge status={detail.status} /></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Type</Text><Text style={styles.detailValue}>{detail.type.replace('_', ' ')}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Customer</Text><Text style={styles.detailValue}>{detail.customer?.name ?? 'Anonymous'}</Text></View>

            <View style={styles.itemsBlock}>
              <Text style={styles.itemsTitle}>Items</Text>
              {detail.items.map((it) => (
                <View key={it.id} style={styles.lineItem}>
                  <Text style={styles.lineQty}>{it.quantity}×</Text>
                  <Text style={styles.lineName}>{it.menuItem.name}</Text>
                  <Text style={styles.linePrice}>€{it.subtotal}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>€{detail.totalAmount}</Text>
            </View>
            {detail.notes && <View style={styles.detailRow}><Text style={styles.detailLabel}>Notes</Text><Text style={styles.detailValue}>{detail.notes}</Text></View>}
          </View>
        )}
      </Modal>

      {/* Création de commande */}
      <NewOrderModal visible={showNewOrder} onClose={() => setShowNewOrder(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
  filterRow: { maxHeight: 48 },
  filterContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
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
  itemsBlock: { gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  itemsTitle: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textSecondary, textTransform: 'uppercase' },
  lineItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  lineQty: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textSecondary, width: 32 },
  lineName: { flex: 1, fontSize: typography.base, color: colors.textPrimary },
  linePrice: { fontSize: typography.base, color: colors.textPrimary },
  totalRow: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary },
  totalValue: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.primary },
})
