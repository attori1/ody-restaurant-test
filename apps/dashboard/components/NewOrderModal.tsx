import { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import axios from 'axios'
import { Modal, Button, Select, EmptyState, useToast } from '@ody/shared'
import { colors, spacing, typography, radius } from '@ody/shared'
import {
  useGetApiMenuItems,
  useGetApiCustomers,
  type PostApiOrdersBodyType,
} from '@ody/api-client'
import { useCreateOrder } from '../hooks/useCreateOrder'

interface NewOrderModalProps {
  visible: boolean
  onClose: () => void
}

const ORDER_TYPES: { label: string; value: PostApiOrdersBodyType }[] = [
  { label: 'Dine in', value: 'dine_in' },
  { label: 'Takeaway', value: 'takeaway' },
  { label: 'Delivery', value: 'delivery' },
]

/**
 * Constructeur de commande : on choisit le type, un client optionnel, puis les plats
 * avec leurs quantités. Le total affiché ici n'est qu'un aperçu — le backend recalcule
 * et valide le vrai total à la création.
 */
export function NewOrderModal({ visible, onClose }: NewOrderModalProps) {
  const toast = useToast()
  const [type, setType] = useState<PostApiOrdersBodyType>('dine_in')
  const [customerId, setCustomerId] = useState<string>()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // On ne propose que les plats disponibles à l'ajout.
  const { data: items = [] } = useGetApiMenuItems({ available: 'true' })
  const { data: customers = [] } = useGetApiCustomers()
  const { createOrder, isCreating } = useCreateOrder()

  const setQty = (id: string, delta: number) => {
    setQuantities((q) => {
      const next = Math.max(0, (q[id] ?? 0) + delta)
      const copy = { ...q }
      if (next === 0) delete copy[id]
      else copy[id] = next
      return copy
    })
  }

  // Aperçu du total côté client (le serveur reste la source de vérité).
  const previewTotal = useMemo(() => {
    return items
      .reduce((sum, item) => sum + parseFloat(item.price) * (quantities[item.id] ?? 0), 0)
      .toFixed(2)
  }, [items, quantities])

  const selectedCount = Object.values(quantities).reduce((a, b) => a + b, 0)

  const reset = () => {
    setType('dine_in')
    setCustomerId(undefined)
    setQuantities({})
  }

  const submit = async () => {
    const orderItems = Object.entries(quantities).map(([menuItemId, quantity]) => ({ menuItemId, quantity }))
    if (orderItems.length === 0) {
      toast.warning('Add at least one item')
      return
    }
    try {
      await createOrder({ type, customerId, items: orderItems })
      toast.success('Order created')
      reset()
      onClose()
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error ?? 'Could not create the order.'
        : 'Could not create the order.'
      toast.error(message)
    }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="New Order">
      <View style={styles.form}>
        <Select
          label="Order type"
          value={type}
          onChange={(v) => setType(v as PostApiOrdersBodyType)}
          options={ORDER_TYPES}
        />

        <Select
          label="Customer (optional)"
          value={customerId}
          onChange={setCustomerId}
          placeholder="Anonymous"
          options={customers.map((c) => ({ label: c.name, value: c.id }))}
        />

        <Text style={styles.sectionLabel}>Items</Text>
        {items.length === 0 ? (
          <EmptyState icon="🍽️" title="No available items" description="Add menu items first" />
        ) : (
          <ScrollView style={styles.itemList} nestedScrollEnabled>
            {items.map((item) => {
              const qty = quantities[item.id] ?? 0
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>€{item.price}</Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={[styles.stepBtn, qty === 0 && styles.stepBtnDisabled]}
                      onPress={() => setQty(item.id, -1)}
                      disabled={qty === 0}
                    >
                      <Text style={styles.stepSign}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qty}>{qty}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(item.id, 1)}>
                      <Text style={styles.stepSign}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total ({selectedCount} item{selectedCount !== 1 ? 's' : ''})</Text>
          <Text style={styles.totalValue}>€{previewTotal}</Text>
        </View>

        <View style={styles.actions}>
          <Button label="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button label="Create Order" onPress={submit} loading={isCreating} disabled={selectedCount === 0} style={{ flex: 1 }} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  sectionLabel: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textSecondary, textTransform: 'uppercase' },
  itemList: { maxHeight: 260 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: typography.base, color: colors.textPrimary },
  itemPrice: { fontSize: typography.sm, color: colors.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.4 },
  stepSign: { fontSize: typography.lg, color: colors.textPrimary, lineHeight: 22 },
  qty: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary, minWidth: 20, textAlign: 'center' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  totalValue: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.md },
})
