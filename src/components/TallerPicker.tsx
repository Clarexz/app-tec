import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown, CircleCheck, Clock, Search, SearchX, X } from 'lucide-react-native';
import { colors, fonts, radius, space } from '@/theme';
import type { Taller } from '@/types/api';
import { Chip } from './Chip';
import { Text } from './Text';

export interface TallerPickerProps {
  value?: number;
  onChange: (id: number) => void;
  talleres: Taller[];
  loading?: boolean;
  error?: string;
  /** Talleres que no se pueden elegir (p. ej. en los que el alumno ya está inscrito). */
  disabledIds?: readonly number[];
  /** Etiqueta que acompaña a los talleres deshabilitados. */
  disabledLabel?: string;
  /** Etiqueta del campo. */
  label?: string;
}

/** Minúsculas y sin acentos, para buscar "musica" y encontrar "Música". */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .trim();
}

export function TallerPicker({
  value, onChange, talleres, loading, error, disabledIds, disabledLabel = 'Ya inscrito', label = 'Taller',
}: TallerPickerProps) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const insets = useSafeAreaInsets();
  const selected = talleres.find((t) => t.id === value);
  const bloqueados = useMemo(() => new Set(disabledIds ?? []), [disabledIds]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda).replace(/^#/, '');
    if (!q) return talleres;
    return talleres.filter(
      (t) => String(t.id) === q || normalizar(t.nombre).includes(q) || normalizar(t.horario).includes(q),
    );
  }, [talleres, busqueda]);

  const cerrar = () => {
    setOpen(false);
    setBusqueda('');
  };

  return (
    <View style={styles.wrap}>
      <Text variant="small" color={colors.tinta} style={{ fontFamily: fonts.sansBold }}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Abre la lista de talleres"
        accessibilityValue={{ text: selected ? `${selected.nombre}, ${selected.horario}` : 'Sin elegir' }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          selected && styles.fieldSelected,
          { borderColor: error ? colors.error : colors.borde },
          pressed && { opacity: 0.88 },
        ]}
      >
        {selected ? (
          <>
            <Chip label={`#${selected.id}`} />
            <View style={styles.fieldBody}>
              <Text variant="bodyStrong" numberOfLines={1}>{selected.nombre}</Text>
              <View style={styles.horario}>
                <Clock size={14} strokeWidth={2} color={colors.tintaSuave} />
                <Text variant="small" numberOfLines={1} style={styles.flex}>{selected.horario}</Text>
              </View>
            </View>
          </>
        ) : (
          <Text numberOfLines={1} style={[styles.flex, { color: colors.tintaSuave }]}>
            {loading ? 'Cargando talleres…' : 'Elige un taller'}
          </Text>
        )}
        {loading ? <ActivityIndicator color={colors.rosa} /> : <ChevronDown size={20} strokeWidth={2} color={colors.tinta} />}
      </Pressable>
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}

      <Modal transparent animationType="slide" visible={open} onRequestClose={cerrar}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.backdrop} onPress={cerrar} accessibilityRole="button" accessibilityLabel="Cerrar la lista" />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space[4]) }]}>
            <View style={styles.grabber} />
            <View style={styles.sheetHead}>
              <Text variant="h2" accessibilityRole="header">Elige un taller</Text>
              <Pressable onPress={cerrar} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10}>
                <X size={24} strokeWidth={2} color={colors.tinta} />
              </Pressable>
            </View>

            {talleres.length > 0 ? (
              <View style={styles.search}>
                <Search size={20} strokeWidth={2} color={colors.tintaSuave} />
                <TextInput
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar por nombre, horario o número"
                  placeholderTextColor={colors.tintaSuave}
                  selectionColor={colors.rosa}
                  accessibilityLabel="Buscar taller"
                  autoCorrect={false}
                  returnKeyType="search"
                  style={styles.searchInput}
                />
                {busqueda ? (
                  <Pressable onPress={() => setBusqueda('')} accessibilityRole="button" accessibilityLabel="Borrar búsqueda" hitSlop={10}>
                    <X size={20} strokeWidth={2} color={colors.tinta} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {loading && talleres.length === 0 ? (
              <ActivityIndicator color={colors.rosa} style={{ marginVertical: space[6] }} />
            ) : (
              <FlatList
                data={filtrados}
                keyExtractor={(t) => String(t.id)}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListEmptyComponent={
                  <View style={styles.vacio}>
                    <SearchX size={24} strokeWidth={2} color={colors.tinta} />
                    <Text center color={colors.tintaSuave}>
                      {talleres.length === 0
                        ? 'Por ahora no hay talleres abiertos.'
                        : 'No encontramos talleres con esa búsqueda.'}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const sel = item.id === value;
                  const off = bloqueados.has(item.id);
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${item.nombre}, ${item.horario}${off ? `, ${disabledLabel}` : ''}`}
                      accessibilityState={{ selected: sel, disabled: off }}
                      disabled={off}
                      onPress={() => { onChange(item.id); cerrar(); }}
                      style={({ pressed }) => [
                        styles.option,
                        sel && { backgroundColor: colors.hueso },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View style={off ? styles.apagado : null}>
                        <Chip label={`#${item.id}`} tone={off ? 'hueso' : 'sol'} />
                      </View>
                      <View style={styles.optText}>
                        <Text variant="bodyStrong" color={off ? colors.tintaSuave : colors.tinta}>{item.nombre}</Text>
                        <View style={styles.horario}>
                          <Clock size={14} strokeWidth={2} color={colors.tintaSuave} />
                          <Text variant="small" style={styles.flex}>{item.horario}</Text>
                        </View>
                      </View>
                      {off ? (
                        <View style={styles.inscrito}>
                          <CircleCheck size={16} strokeWidth={2} color={colors.hoja} />
                          <Text variant="small" color={colors.tinta} style={{ fontFamily: fonts.sansBold }}>{disabledLabel}</Text>
                        </View>
                      ) : sel ? (
                        <Check size={22} strokeWidth={2} color={colors.rosaProfundo} />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 6 },
  field: {
    minHeight: 52, borderRadius: radius.md, backgroundColor: colors.blanco, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10,
  },
  fieldSelected: { paddingVertical: 10 },
  fieldBody: { flex: 1, gap: 2 },
  horario: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.error },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,20,20,0.4)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '80%',
    backgroundColor: colors.marfil, borderTopLeftRadius: radius.bubble, borderTopRightRadius: radius.bubble, paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borde, marginBottom: 12 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  search: {
    marginHorizontal: 20, marginBottom: 8, height: 48, borderRadius: radius.md, backgroundColor: colors.blanco,
    borderWidth: 1.5, borderColor: colors.borde, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, height: '100%', fontFamily: fonts.sansRegular, fontSize: 16, color: colors.tinta, padding: 0 },
  list: { paddingHorizontal: 12, paddingBottom: 16, gap: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md },
  optText: { flex: 1, gap: 2 },
  apagado: { opacity: 0.6 },
  inscrito: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vacio: { alignItems: 'center', gap: space[2], paddingVertical: space[6], paddingHorizontal: space[5] },
});
