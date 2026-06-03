import { useState, useEffect } from 'react'
import { ScrollView, View, Text, StyleSheet, Switch } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { Card, Button, Input, Skeleton, EmptyState } from '../../components/ui'
import { colors, spacing, typography } from '../../tokens'
import { useSettings } from '../../hooks/useSettings'

interface FormValues {
  prepTimeMinutes: number
  autoAccept: boolean
  serviceAvailable: boolean
  openingTime: string
  closingTime: string
}

export default function SettingsScreen() {
  const { settings, isLoading, isError, updateSettings, isSaving } = useSettings()
  const [saved, setSaved] = useState(false)

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      prepTimeMinutes: 20, autoAccept: false, serviceAvailable: true,
      openingTime: '12:00', closingTime: '22:00',
    },
  })

  // Quand les settings arrivent du backend, on remplit le formulaire
  useEffect(() => {
    if (settings) {
      reset({
        prepTimeMinutes: settings.prepTimeMinutes,
        autoAccept: settings.autoAccept,
        serviceAvailable: settings.serviceAvailable,
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
      })
    }
  }, [settings, reset])

  const onSave = async (data: FormValues) => {
    await updateSettings(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isError) {
    return <EmptyState icon="⚠️" title="Couldn't load settings" description="Check that the backend is running" />
  }

  if (isLoading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Skeleton height={32} width={120} />
        <Skeleton height={140} /><Skeleton height={100} /><Skeleton height={120} />
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🍳 Service</Text>

        <Controller control={control} name="serviceAvailable"
          render={({ field }) => (
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Service Available</Text>
                <Text style={styles.rowHint}>Toggle to open or close the restaurant</Text>
              </View>
              <Switch value={field.value} onValueChange={field.onChange} trackColor={{ true: colors.success }} />
            </View>
          )}
        />

        <Controller control={control} name="autoAccept"
          render={({ field }) => (
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Auto-Accept Orders</Text>
                <Text style={styles.rowHint}>Automatically confirm incoming orders</Text>
              </View>
              <Switch value={field.value} onValueChange={field.onChange} trackColor={{ true: colors.primary }} />
            </View>
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>⏱️ Timing</Text>
        <Controller control={control} name="prepTimeMinutes"
          render={({ field }) => (
            <Input
              label="Preparation Time (minutes)"
              value={String(field.value)}
              onChangeText={(v) => field.onChange(parseInt(v) || 0)}
              keyboardType="number-pad"
              hint="Average time to prepare an order"
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Opening Hours</Text>
        <View style={styles.hoursRow}>
          <Controller control={control} name="openingTime"
            render={({ field }) => (
              <Input label="Opening" value={field.value} onChangeText={field.onChange} placeholder="09:00" style={styles.hoursInput} />
            )}
          />
          <Text style={styles.hoursSep}>→</Text>
          <Controller control={control} name="closingTime"
            render={({ field }) => (
              <Input label="Closing" value={field.value} onChangeText={field.onChange} placeholder="22:00" style={styles.hoursInput} />
            )}
          />
        </View>
      </Card>

      <Button
        label={saved ? '✓ Saved!' : 'Save Settings'}
        onPress={handleSubmit(onSave)}
        loading={isSaving}
        size="lg"
        style={styles.saveBtn}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
  section: { gap: spacing.lg },
  sectionTitle: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  rowText: { flex: 1 },
  rowLabel: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  rowHint: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  hoursRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  hoursInput: { flex: 1 },
  hoursSep: { fontSize: typography.lg, color: colors.textTertiary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
})
