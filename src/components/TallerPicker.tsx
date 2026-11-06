import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Check, ChevronDown, X } from 'lucide-react-native';
import { colors, fonts, radius } from '@/theme';
import type { Taller } from '@/types/api';
import { Chip } from './Chip';
import { Text } from './Text';

export interface TallerPickerProps {
  value?: number;
  onChange: (id: number) => void;
  talleres: Taller[];
  loading?: boolean;
  error?: string;
}

export function TallerPicker({ value, onChange, talleres, loading, error }: TallerPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = talleres.find((t) => t.id === value);
  return (
    <View style={styles.wrap}>
      <Text variant="small" color={colors.tinta} style={{ fontFamily: fonts.sansBold }}>Taller</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Taller"
        accessibilityValue={{ text: selected ? `#${selected.id} ${selected.nombre}` : 'Sin elegir' }}
        onPress={() => setOpen(true)}
        style={[styles.field, { borderColor: error ? colors.error : colors.borde }]}
      >
        <Text
          numberOfLines={1}
          style={[styles.fieldText, !selected && { color: colors.tintaSuave }]}
        >
          {selected ? `#${selected.id} · ${selected.nombre}` : 'Elige un taller'}
        </Text>
        {loading ? <ActivityIndicator color={colors.rosa} /> : <ChevronDown size={20} strokeWidth={2} color={colors.tinta} />}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Cerrar" />
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text variant="h2">Elige un taller</Text>
            <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10}>
              <X size={24} strokeWidth={2} color={colors.tinta} />
            </Pressable>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.rosa} style={{ marginVertical: 32 }} />
          ) : (
            <FlatList
              data={talleres}
              keyExtractor={(t) => String(t.id)}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const sel = item.id === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: sel }}
                    onPress={() => { onChange(item.id); setOpen(false); }}
                    style={({ pressed }) => [styles.option, sel && { backgroundColor: colors.hueso }, pressed && { opacity: 0.85 }]}
                  >
                    <Chip label={`#${item.id}`} />
                    <View style={styles.optText}>
                      <Text variant="bodyStrong">{item.nombre}</Text>
                      <Text variant="small">{item.horario}</Text>
                    </View>
                    {sel ? <Check size={22} strokeWidth={2} color={colors.rosaProfundo} /> : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  field: {
    height: 52, borderRadius: radius.md, backgroundColor: colors.blanco, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8,
  },
  fieldText: { flex: 1 },
  error: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.error },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,20,20,0.4)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '75%',
    backgroundColor: colors.marfil, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 20,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 12, paddingBottom: 32, gap: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md },
  optText: { flex: 1 },
});
