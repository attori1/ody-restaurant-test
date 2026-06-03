import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { Card, Button, Badge, Modal, Input, EmptyState, Skeleton } from '../../components/ui'
import { colors, spacing, typography, radius } from '../../tokens'

// Données mock — seront remplacées par les hooks Orval après gen:contract
const MOCK_CATEGORIES = [
  { id: '1', name: 'Starters' },
  { id: '2', name: 'Main Course' },
  { id: '3', name: 'Desserts' },
  { id: '4', name: 'Drinks' },
]

const MOCK_ITEMS = [
  { id: '1', categoryId: '1', name: 'Bruschetta', price: '8.50', available: true, description: 'Toasted bread with tomatoes' },
  { id: '2', categoryId: '2', name: 'Grilled Salmon', price: '24.00', available: true, description: 'With lemon butter sauce' },
  { id: '3', categoryId: '2', name: 'Beef Burger', price: '18.50', available: false, description: '180g beef, cheddar' },
  { id: '4', categoryId: '3', name: 'Crème Brûlée', price: '8.00', available: true, description: 'Classic French dessert' },
]

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<(typeof MOCK_ITEMS)[0] | null>(null)
  const isLoading = false

  const filtered = selectedCategory
    ? MOCK_ITEMS.filter((i) => i.categoryId === selectedCategory)
    : MOCK_ITEMS

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', price: '', categoryId: MOCK_CATEGORIES[0].id, description: '' },
  })

  const openEdit = (item: (typeof MOCK_ITEMS)[0]) => {
    setEditItem(item)
    reset({ name: item.name, price: item.price, categoryId: item.categoryId, description: item.description ?? '' })
    setShowModal(true)
  }

  const openCreate = () => {
    setEditItem(null)
    reset({ name: '', price: '', categoryId: MOCK_CATEGORIES[0].id, description: '' })
    setShowModal(true)
  }

  const onSubmit = (data: unknown) => {
    // TODO: appeler useCreateMenuItem ou useUpdateMenuItem (hooks Orval)
    console.log('submit', data)
    setShowModal(false)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <Button label="+ Add Item" onPress={openCreate} size="sm" />
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory === null && styles.filterChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.filterLabel, selectedCategory === null && styles.filterLabelActive]}>All</Text>
        </TouchableOpacity>
        {MOCK_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.filterLabel, selectedCategory === cat.id && styles.filterLabelActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {isLoading
          ? [1, 2, 3, 4].map((i) => <Skeleton key={i} height={80} style={{ marginBottom: spacing.md }} />)
          : filtered.length === 0
            ? <EmptyState icon="🍽️" title="No items" description="Add your first menu item" actionLabel="Add Item" onAction={openCreate} />
            : filtered.map((item) => (
                <Card key={item.id} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <View style={styles.itemTop}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Badge label={item.available ? 'Available' : 'Unavailable'} color={item.available ? colors.success : colors.error} />
                      </View>
                      {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={styles.price}>€{item.price}</Text>
                      <Button label="Edit" variant="secondary" size="sm" onPress={() => openEdit(item)} />
                    </View>
                  </View>
                </Card>
              ))}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal visible={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Item' : 'Add Item'}>
        <View style={styles.form}>
          <Controller control={control} name="name" rules={{ required: 'Name is required' }}
            render={({ field }) => <Input label="Name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />}
          />
          <Controller control={control} name="price" rules={{ required: 'Price is required' }}
            render={({ field }) => <Input label="Price (€)" value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" error={errors.price?.message} />}
          />
          <Controller control={control} name="description"
            render={({ field }) => <Input label="Description" value={field.value} onChangeText={field.onChange} multiline />}
          />
          <View style={styles.formActions}>
            <Button label="Cancel" variant="secondary" onPress={() => setShowModal(false)} style={{ flex: 1 }} />
            <Button label={editItem ? 'Save' : 'Create'} onPress={handleSubmit(onSubmit)} style={{ flex: 1 }} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
  filterRow: { maxHeight: 48 },
  filterContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  filterLabelActive: { color: colors.textInverse },
  list: { flex: 1 },
  listContent: { padding: spacing.lg, gap: spacing.md },
  itemCard: { padding: spacing.md },
  itemRow: { flexDirection: 'row', gap: spacing.md },
  itemInfo: { flex: 1, gap: spacing.xs },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  itemName: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary },
  itemDesc: { fontSize: typography.sm, color: colors.textSecondary },
  itemRight: { alignItems: 'flex-end', gap: spacing.sm },
  price: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.textPrimary },
  form: { gap: spacing.lg },
  formActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
})
