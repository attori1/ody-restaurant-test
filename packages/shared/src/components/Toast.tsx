import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { colors, spacing, radius, typography, shadows } from '../tokens'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/** Hook pour déclencher un toast depuis n'importe quel écran. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

let nextId = 1

const VARIANT = {
  success: { color: colors.success, bg: colors.successLight, icon: '✓' },
  error: { color: colors.error, bg: colors.errorLight, icon: '✕' },
  warning: { color: colors.warning, bg: colors.warningLight, icon: '!' },
  info: { color: colors.info, bg: colors.infoLight, icon: 'i' },
} as const

/**
 * Fournit un système de toasts in-app (pattern feedback du design system).
 * À placer une fois à la racine ; les écrans déclenchent via useToast().
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = nextId++
      setToasts((list) => [...list, { id, message, variant }])
      setTimeout(() => remove(id), 3500)
    },
    [remove]
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error'),
      warning: (m) => show(m, 'warning'),
      info: (m) => show(m, 'info'),
    }),
    [show]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.overlay} pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={() => remove(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  )
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const anim = useRef(new Animated.Value(0)).current
  const v = VARIANT[item.variant]

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start()
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(onDismiss)
    }, 3300)
    return () => clearTimeout(t)
  }, [anim, onDismiss])

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: v.bg, borderColor: v.color },
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }] },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: v.color }]}>
        <Text style={styles.iconText}>{v.icon}</Text>
      </View>
      <Text style={[styles.message, { color: colors.textPrimary }]} numberOfLines={3}>
        {item.message}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 420,
    width: '90%',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    ...shadows.md,
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: colors.textInverse, fontSize: typography.xs, fontWeight: typography.bold },
  message: { flex: 1, fontSize: typography.sm, fontWeight: typography.medium },
})
