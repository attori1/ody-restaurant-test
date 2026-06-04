import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { Card, Modal, EmptyState, Skeleton, StatusBadge } from '@ody/shared'
import { colors, spacing, typography } from '@ody/shared'
import { useGetApiCustomers, useGetApiCustomersId } from '@ody/api-client'

export default function CrmScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: customers, isLoading, isError } = useGetApiCustomers()
  const { data: detail, isLoading: detailLoading } = useGetApiCustomersId(selectedId ?? '', {
    query: { enabled: !!selectedId },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CRM</Text>
        {customers && <Text style={styles.subtitle}>{customers.length} customers</Text>}
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={80} style={{ marginBottom: spacing.md }} />)}
        </View>
      ) : isError ? (
        <EmptyState icon="⚠️" title="Couldn't load customers" description="Check that the backend is running" />
      ) : !customers || customers.length === 0 ? (
        <EmptyState icon="👥" title="No customers yet" description="Customers appear here once orders are placed" />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: customer }) => (
            <TouchableOpacity onPress={() => setSelectedId(customer.id)} activeOpacity={0.7}>
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

      <Modal visible={!!selectedId} onClose={() => setSelectedId(null)} title={detail?.name ?? 'Customer'}>
        {detailLoading || !detail ? (
          <View style={{ gap: spacing.md }}><Skeleton height={20} /><Skeleton height={20} /><Skeleton height={80} /></View>
        ) : (
          <View style={styles.detail}>
            <View style={styles.detailRow}><Text style={styles.label}>Email</Text><Text style={styles.value}>{detail.email}</Text></View>
            <View style={styles.detailRow}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{detail.phone ?? '—'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.label}>Orders</Text><Text style={styles.value}>{detail.orderCount}</Text></View>
            <View style={styles.detailRow}><Text style={styles.label}>Total Spend</Text><Text style={[styles.value, styles.bold]}>€{detail.totalSpend}</Text></View>

            <View style={styles.ordersBlock}>
              <Text style={styles.ordersTitle}>Recent Orders</Text>
              {detail.recentOrders.length === 0 ? (
                <Text style={styles.muted}>No orders yet</Text>
              ) : (
                detail.recentOrders.map((order) => (
                  <View key={order.id} style={styles.orderLine}>
                    <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                    <StatusBadge status={order.status} />
                    <Text style={styles.orderAmount}>€{order.totalAmount}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </Modal>
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
  ordersBlock: { gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  ordersTitle: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textSecondary, textTransform: 'uppercase' },
  muted: { fontSize: typography.base, color: colors.textTertiary },
  orderLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  orderId: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textPrimary, width: 80 },
  orderAmount: { fontSize: typography.base, color: colors.textPrimary, marginLeft: 'auto' },
})
