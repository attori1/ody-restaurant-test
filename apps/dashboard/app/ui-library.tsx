import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Button, Badge, StatusBadge, Card, Input, Select, Skeleton, Modal, EmptyState, useToast } from '@ody/shared'
import { colors, spacing, radius, typography, shadows, layout } from '@ody/shared'

export default function UiLibraryScreen() {
  const router = useRouter()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectValue, setSelectValue] = useState<string>()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Button label="← Back" variant="ghost" size="sm" onPress={() => router.back()} />
      </View>
      <Text style={styles.pageTitle}>Design System</Text>
      <Text style={styles.pageSubtitle}>Tokens, surfaces et composants réutilisables</Text>

      {/* COLORS */}
      <Section title="Colors">
        <Text style={styles.groupLabel}>Brand</Text>
        <View style={styles.swatchRow}>
          <Swatch color={colors.primary} name="primary" />
          <Swatch color={colors.primaryLight} name="primaryLight" />
          <Swatch color={colors.primaryDark} name="primaryDark" />
        </View>
        <Text style={styles.groupLabel}>Semantic</Text>
        <View style={styles.swatchRow}>
          <Swatch color={colors.success} name="success" />
          <Swatch color={colors.warning} name="warning" />
          <Swatch color={colors.error} name="error" />
          <Swatch color={colors.info} name="info" />
        </View>
        <Text style={styles.groupLabel}>Order status</Text>
        <View style={styles.swatchRow}>
          {Object.entries(colors.status).map(([name, color]) => (
            <Swatch key={name} color={color} name={name} />
          ))}
        </View>
      </Section>

      {/* TYPOGRAPHY */}
      <Section title="Typography">
        <Text style={{ fontSize: typography['4xl'], fontWeight: typography.bold, color: colors.textPrimary }}>Display 4xl</Text>
        <Text style={{ fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary }}>Heading 2xl</Text>
        <Text style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary }}>Subtitle lg</Text>
        <Text style={{ fontSize: typography.base, color: colors.textPrimary }}>Body base — the quick brown fox</Text>
        <Text style={{ fontSize: typography.sm, color: colors.textSecondary }}>Secondary sm</Text>
        <Text style={{ fontSize: typography.xs, color: colors.textTertiary }}>Caption xs</Text>
      </Section>

      {/* SPACING */}
      <Section title="Spacing scale">
        {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((key) => (
          <View key={key} style={styles.spacingRow}>
            <Text style={styles.spacingLabel}>{key} · {spacing[key]}px</Text>
            <View style={[styles.spacingBar, { width: spacing[key] * 4 }]} />
          </View>
        ))}
      </Section>

      {/* RADIUS & SHADOWS (surfaces) */}
      <Section title="Surfaces — radius & elevation">
        <View style={styles.surfaceRow}>
          <View style={[styles.surface, { borderRadius: radius.sm }]}><Text style={styles.surfaceLabel}>sm</Text></View>
          <View style={[styles.surface, { borderRadius: radius.md }]}><Text style={styles.surfaceLabel}>md</Text></View>
          <View style={[styles.surface, { borderRadius: radius.lg }]}><Text style={styles.surfaceLabel}>lg</Text></View>
          <View style={[styles.surface, { borderRadius: radius.xl }]}><Text style={styles.surfaceLabel}>xl</Text></View>
        </View>
        <View style={styles.surfaceRow}>
          <View style={[styles.elevSurface, shadows.sm]}><Text style={styles.surfaceLabel}>shadow sm</Text></View>
          <View style={[styles.elevSurface, shadows.md]}><Text style={styles.surfaceLabel}>shadow md</Text></View>
          <View style={[styles.elevSurface, shadows.lg]}><Text style={styles.surfaceLabel}>shadow lg</Text></View>
        </View>
      </Section>

      {/* LAYOUT & GRID */}
      <Section title="Layout & grid rules">
        <Text style={styles.bodyText}>
          Le contenu est centré et plafonné à <Text style={styles.code}>{layout.maxContentWidth}px</Text> de large
          (lisibilité sur grand écran), avec une gouttière de <Text style={styles.code}>{layout.gutter}px</Text> entre les éléments.
        </Text>
        <Text style={styles.groupLabel}>Colonnes responsives (gridColumns)</Text>
        {([
          ['Mobile (<480)', 1],
          ['≥480', 2],
          ['≥768', 3],
          ['≥1024', 4],
        ] as const).map(([range, cols]) => (
          <View key={range} style={styles.gridRuleRow}>
            <Text style={styles.gridRuleLabel}>{range}</Text>
            <View style={styles.gridDemo}>
              {Array.from({ length: cols }).map((_, i) => (
                <View key={i} style={styles.gridCell} />
              ))}
            </View>
            <Text style={styles.gridRuleCols}>{cols} col</Text>
          </View>
        ))}
      </Section>

      {/* BUTTONS */}
      <Section title="Buttons">
        <Text style={styles.groupLabel}>Variants</Text>
        <View style={styles.componentRow}>
          <Button label="Primary" onPress={() => {}} />
          <Button label="Secondary" variant="secondary" onPress={() => {}} />
          <Button label="Ghost" variant="ghost" onPress={() => {}} />
          <Button label="Danger" variant="danger" onPress={() => {}} />
        </View>
        <Text style={styles.groupLabel}>Sizes</Text>
        <View style={styles.componentRow}>
          <Button label="Small" size="sm" onPress={() => {}} />
          <Button label="Medium" size="md" onPress={() => {}} />
          <Button label="Large" size="lg" onPress={() => {}} />
        </View>
        <Text style={styles.groupLabel}>States</Text>
        <View style={styles.componentRow}>
          <Button label="Loading" loading onPress={() => {}} />
          <Button label="Disabled" disabled onPress={() => {}} />
        </View>
      </Section>

      {/* BADGES */}
      <Section title="Badges & status">
        <View style={styles.componentRow}>
          <Badge label="Default" />
          <Badge label="Success" color={colors.success} />
          <Badge label="Error" color={colors.error} />
        </View>
        <View style={styles.componentRow}>
          <StatusBadge status="pending" />
          <StatusBadge status="preparing" />
          <StatusBadge status="ready" />
          <StatusBadge status="delivered" />
          <StatusBadge status="cancelled" />
        </View>
      </Section>

      {/* INPUTS */}
      <Section title="Form controls">
        <Input label="Default input" placeholder="Type here..." />
        <Input label="With hint" placeholder="email@example.com" hint="We'll never share it" />
        <Input label="With error" placeholder="Invalid" error="This field is required" />
        <Select
          label="Select / dropdown"
          value={selectValue}
          onChange={setSelectValue}
          placeholder="Pick an option"
          options={[
            { label: 'Dine in', value: 'dine_in' },
            { label: 'Takeaway', value: 'takeaway' },
            { label: 'Delivery', value: 'delivery' },
          ]}
        />
      </Section>

      {/* FEEDBACK STATES */}
      <Section title="Feedback — loading / empty / toast">
        <Text style={styles.groupLabel}>Skeleton</Text>
        <Skeleton height={20} style={{ marginBottom: spacing.sm }} />
        <Skeleton height={20} width="60%" />
        <Text style={styles.groupLabel}>Toasts</Text>
        <View style={styles.componentRow}>
          <Button label="Success" size="sm" onPress={() => toast.success('Saved successfully')} />
          <Button label="Error" size="sm" variant="danger" onPress={() => toast.error('Something went wrong')} />
          <Button label="Warning" size="sm" variant="secondary" onPress={() => toast.warning('Heads up')} />
          <Button label="Info" size="sm" variant="ghost" onPress={() => toast.info('For your information')} />
        </View>
        <Text style={styles.groupLabel}>Empty state</Text>
        <Card>
          <EmptyState icon="📭" title="Nothing here" description="An empty state example" />
        </Card>
      </Section>

      {/* OVERLAYS */}
      <Section title="Overlays">
        <Button label="Open Modal" onPress={() => setModalOpen(true)} />
        <Modal visible={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
          <Text style={{ fontSize: typography.base, color: colors.textSecondary, marginBottom: spacing.lg }}>
            Modals are used for create/edit flows and detail views across the dashboard.
          </Text>
          <Button label="Close" onPress={() => setModalOpen(false)} />
        </Modal>
      </Section>

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.sectionCard}>{children}</Card>
    </View>
  )
}

function Swatch({ color, name }: { color: string; name: string }) {
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: color }]} />
      <Text style={styles.swatchName}>{name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
  topBar: { marginBottom: spacing.sm },
  bodyText: { fontSize: typography.base, color: colors.textSecondary, lineHeight: 22 },
  code: { fontWeight: typography.semibold, color: colors.textPrimary },
  gridRuleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  gridRuleLabel: { fontSize: typography.sm, color: colors.textSecondary, width: 110 },
  gridDemo: { flex: 1, flexDirection: 'row', gap: spacing.xs },
  gridCell: { flex: 1, height: 20, backgroundColor: colors.primary + '33', borderRadius: radius.sm },
  gridRuleCols: { fontSize: typography.sm, color: colors.textTertiary, width: 44, textAlign: 'right' },
  pageTitle: { fontSize: typography['3xl'], fontWeight: typography.bold, color: colors.textPrimary },
  pageSubtitle: { fontSize: typography.base, color: colors.textSecondary, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl, gap: spacing.sm },
  sectionTitle: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary },
  sectionCard: { gap: spacing.md },
  groupLabel: { fontSize: typography.xs, fontWeight: typography.semibold, color: colors.textTertiary, textTransform: 'uppercase', marginTop: spacing.sm },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: { alignItems: 'center', gap: spacing.xs, width: 72 },
  swatchColor: { width: 56, height: 56, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  swatchName: { fontSize: typography.xs, color: colors.textSecondary, textAlign: 'center' },
  spacingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  spacingLabel: { fontSize: typography.sm, color: colors.textSecondary, width: 90 },
  spacingBar: { height: 16, backgroundColor: colors.primary, borderRadius: radius.sm },
  surfaceRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  surface: { width: 72, height: 72, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  elevSurface: { width: 96, height: 72, backgroundColor: colors.surface, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  surfaceLabel: { fontSize: typography.xs, color: colors.textSecondary },
  componentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
})
