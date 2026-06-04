import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { Card, Button, Badge, Modal, Input, EmptyState, Skeleton } from '@ody/shared'
import { colors, spacing, typography, radius } from '@ody/shared'
import { useMenu } from '../../hooks/useMenu'
import type { GetApiMenuItems200Item } from '@ody/api-client'

interface FormValues {
  name: string
  price: string
  categoryId: string
  description: string
}

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<GetApiMenuItems200Item | null>(null)

  // Toute la logique de données vient du hook métier — la page reste présentationnelle.
  const { items, categories, isLoading, isError, createItem, updateItem, deleteItem, isSaving } =
    useMenu(selectedCategory)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', price: '', categoryId: '', description: '' },
  })

  const openEdit = (item: GetApiMenuItems200Item) => {
    setEditItem(item)
    reset({ name: item.name, price: item.price, categoryId: item.categoryId, description: item.description ?? '' })
    setShowModal(true)
  }

  const openCreate = () => {
    setEditItem(null)
    reset({ name: '', price: '', categoryId: categories[0]?.id ?? '', description: '' })
    setShowModal(true)
  }

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
      description: data.description || null,
    }
    if (editItem) {
      await updateItem(editItem.id, payload)
    } else {
      await createItem(payload)
    }
    setShowModal(false)
  }

  const toggleAvailability = async (item: GetApiMenuItems200Item) => {
    await updateItem(item.id, { available: !item.available })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <Button label="+ Add Item" onPress={openCreate} size="sm" />
      </View>

      {/* Filtres par catégorie */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory === undefined && styles.filterChipActive]}
          onPress={() => setSelectedCategory(undefined)}
        >
          <Text style={[styles.filterLabel, selectedCategory === undefined && styles.filterLabelActive]}>All</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.filterLabel, selectedCategory === cat.id && styles.filterLabelActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste des items : loading / error / empty / data */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} height={80} style={{ marginBottom: spacing.md }} />)
        ) : isError ? (
          <EmptyState icon="⚠️" title="Couldn't load menu" description="Check that the backend is running on :8787" />
        ) : items.length === 0 ? (
          <EmptyState icon="🍽️" title="No items" description="Add your first menu item" actionLabel="Add Item" onAction={openCreate} />
        ) : (
          items.map((item) => (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <View style={styles.itemTop}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => toggleAvailability(item)}>
                      <Badge label={item.available ? 'Available' : 'Unavailable'} color={item.available ? colors.success : colors.error} />
                    </TouchableOpacity>
                  </View>
                  {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.price}>€{item.price}</Text>
                  <View style={styles.itemActions}>
                    <Button label="Edit" variant="secondary" size="sm" onPress={() => openEdit(item)} />
                    <Button label="Delete" variant="danger" size="sm" onPress={() => deleteItem(item.id)} />
                  </View>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal créer / éditer */}
      <Modal visible={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Item' : 'Add Item'}>
        <View style={styles.form}>
          <Controller control={control} name="name" rules={{ required: 'Name is required' }}
            render={({ field }) => <Input label="Name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />}
          />
          <Controller control={control} name="price" rules={{ required: 'Price is required', pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Invalid price' } }}
            render={({ field }) => <Input label="Price (€)" value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" error={errors.price?.message} />}
          />
          <Controller control={control} name="categoryId" rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <View style={styles.catSelect}>
                <Text style={styles.catLabel}>Category</Text>
                <View style={styles.catChips}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.filterChip, field.value === cat.id && styles.filterChipActive]}
                      onPress={() => field.onChange(cat.id)}
                    >
                      <Text style={[styles.filterLabel, field.value === cat.id && styles.filterLabelActive]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
          <Controller control={control} name="description"
            render={({ field }) => <Input label="Description" value={field.value} onChangeText={field.onChange} multiline />}
          />
          <View style={styles.formActions}>
            <Button label="Cancel" variant="secondary" onPress={() => setShowModal(false)} style={{ flex: 1 }} />
            <Button label={editItem ? 'Save' : 'Create'} onPress={handleSubmit(onSubmit)} loading={isSaving} style={{ flex: 1 }} />
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
  itemActions: { flexDirection: 'row', gap: spacing.xs },
  form: { gap: spacing.lg },
  formActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  catSelect: { gap: spacing.xs },
  catLabel: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.textPrimary },
  catChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
})
