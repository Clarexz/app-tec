import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useSesion } from '@/auth';
import { colors, layout, space } from '@/theme';
import { Button } from './Button';
import { Chip } from './Chip';
import { Text } from './Text';
import { TextField } from './TextField';

/** Limpia espacios repetidos y extremos. */
export const limpiarNombre = (s: string) => s.trim().replace(/\s+/g, ' ');

/** Un nombre completo válido tiene al menos 2 palabras (nombre y un apellido) con letras. */
export function nombreValido(s: string): boolean {
  const partes = limpiarNombre(s).split(' ').filter((p) => /\p{L}/u.test(p));
  return partes.length >= 2 && partes.every((p) => p.length >= 2);
}

/**
 * Pide el nombre completo al alumno cuando la sesión no lo tiene (primer inicio de sesión).
 * Se monta una vez dentro de las pantallas protegidas; se muestra sola cuando hace falta.
 */
export function NombreGate() {
  const { sesion, guardarNombre, cerrarSesion } = useSesion();
  const visible = !!sesion && !sesion.nombre;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {
        // No se puede cerrar sin capturar el nombre.
      }}
    >
      {visible ? (
        <SafeAreaProvider>
          <Contenido
            noControl={sesion.noControl}
            onGuardar={guardarNombre}
            onSalir={cerrarSesion}
          />
        </SafeAreaProvider>
      ) : null}
    </Modal>
  );
}

function Contenido({
  noControl,
  onGuardar,
  onSalir,
}: {
  noControl: string;
  onGuardar: (nombre: string) => Promise<void>;
  onSalir: () => Promise<void>;
}) {
  const [nombre, setNombre] = useState('');
  const [tocado, setTocado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const valido = nombreValido(nombre);
  const mostrarError = tocado && !valido && nombre.trim().length > 0;

  async function continuar() {
    setTocado(true);
    if (!valido || guardando) return;
    setGuardando(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await onGuardar(limpiarNombre(nombre));
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <Text variant="kicker">Un último paso</Text>
            <Text variant="display" accessibilityRole="header">
              ¿Cómo te llamas?
            </Text>
            <Text variant="annotation" style={styles.nota}>
              ¡ya casi entras!
            </Text>
            <Text style={styles.desc}>
              Lo usamos para inscribirte a los talleres. Escríbelo como aparece en tu credencial del Tec.
            </Text>
            <View style={styles.chip} accessible accessibilityLabel={`Número de control ${noControl}`}>
              <Chip tone="hueso" label={`No. de control ${noControl}`} />
            </View>
          </View>

          <View style={styles.form}>
            <TextField
              label="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              onBlur={() => setTocado(true)}
              placeholder="Ej. María Cárdenas Barrios"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => void continuar()}
              maxLength={80}
              error={mostrarError ? 'Escribe tu nombre y al menos un apellido.' : undefined}
              hint="Nombre y apellidos."
            />
            <Button
              title="Continuar"
              arrow
              onPress={() => void continuar()}
              disabled={!valido}
              loading={guardando}
            />
            <Button
              title="No soy yo, cerrar sesión"
              variant="ghost"
              onPress={() => void onSalir()}
              disabled={guardando}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.marfil },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingTop: space[7],
    paddingBottom: space[5],
    gap: space[6],
  },
  top: { gap: space[2] },
  nota: { transform: [{ rotate: '-3deg' }], alignSelf: 'flex-start', marginLeft: space[1] },
  desc: { marginTop: space[2] },
  chip: { marginTop: space[3], alignSelf: 'flex-start' },
  form: { gap: space[4] },
});
