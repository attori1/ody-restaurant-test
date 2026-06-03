import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { Card, Skeleton, EmptyState } from '../../components/ui'
import { colors, spacing, typography } from '../../tokens'
import { useGetApiAnalyticsKpis } from '@ody/api-client'

export default function HomeScreen() {
  const { data: kpis, isLoading, isError } = useGetApiAnalyticsKpis()

  if (isError) {
    return <EmptyState icon="⚠️" title="Couldn't load dashboard" description="Check that the backend is running on :8787" />
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning 👋</Text>
        <Text style={styles.subtitle}>Here's what's happening today</Text>
      </View>

      <View style={styles.kpiGrid}>
        <KpiCard label="Total Orders" value={kpis ? String(kpis.totalOrders) : ''} icon="📋" loading={isLoading} />
        <KpiCard label="Revenue" value={kpis ? `€${kpis.totalRevenue}` : ''} icon="💶" loading={isLoading} />
        <KpiCard label="Pending" value={kpis ? String(kpis.pendingOrders) : ''} icon="⏳" color={colors.warning} loading={isLoading} />
        <KpiCard label="Today's Orders" value={kpis ? String(kpis.todayOrders) : ''} icon="📅" loading={isLoading} />
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Popular Items</Text>
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} height={24} style={{ marginBottom: spacing.sm }} />)
        ) : !kpis || kpis.popularItems.length === 0 ? (
          <Text style={styles.muted}>No sales data yet</Text>
        ) : (
          kpis.popularItems.map((item, i) => (
            <View key={item.id} style={styles.popularRow}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Text style={styles.popularName}>{item.name}</Text>
              <Text style={styles.popularCount}>{item.totalSold} sold</Text>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>💶 Today's Revenue</Text>
        {isLoading ? (
          <Skeleton height={40} width={120} />
        ) : (
          <>
            <Text style={styles.bigNumber}>€{kpis?.todayRevenue ?? '0'}</Text>
            <Text style={styles.subNumber}>{kpis?.todayOrders ?? 0} orders today</Text>
          </>
        )}
      </Card>
    </ScrollView>
  )
}

function KpiCard({ label, value, icon, color, loading }: {
  label: string; value: string; icon: string; color?: string; loading?: boolean
}) {
  return (
    <Card style={styles.kpiCard}>
      {loading ? (
        <>
          <Skeleton height={20} width={40} style={{ marginBottom: spacing.xs }} />
          <Skeleton height={14} width={80} />
        </>
      ) : (
        <>
          <Text style={styles.kpiIcon}>{icon}</Text>
          <Text style={[styles.kpiValue, color ? { color } : {}]}>{value}</Text>
          <Text style={styles.kpiLabel}>{label}</Text>
        </>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.xs, paddingVertical: spacing.md },
  greeting: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.base, color: colors.textSecondary },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpiCard: { flex: 1, minWidth: 140, gap: spacing.xs },
  kpiIcon: { fontSize: 24 },
  kpiValue: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
  kpiLabel: { fontSize: typography.sm, color: colors.textSecondary },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary },
  muted: { fontSize: typography.base, color: colors.textTertiary },
  popularRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  rank: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.textTertiary, width: 28 },
  popularName: { flex: 1, fontSize: typography.base, color: colors.textPrimary },
  popularCount: { fontSize: typography.sm, color: colors.textSecondary },
  bigNumber: { fontSize: typography['3xl'], fontWeight: typography.bold, color: colors.primary },
  subNumber: { fontSize: typography.base, color: colors.textSecondary },
})
