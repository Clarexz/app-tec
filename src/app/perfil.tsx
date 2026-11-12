import { useState } from 'react';
import { Alert, Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Activity, ChevronRight, CircleCheck, LogOut } from 'lucide-react-native';
import { Button, Card, Chip, Footer, Screen, Text, TextField, limpiarNombre, nombreValido } from '@/components';
import { useSesion } from '@/auth';
import { colors, fonts, radius, shadow, space } from '@/theme';

function iniciales(nombre: string): string {
  const partes = limpiarNombre(nombre).split(' ').filter(Boolean);
  if (partes.length === 0) return '?';
  const a = partes[0][0] ?? '';
  const b = partes.length > 1 ? (partes[1][0] ?? '') : '';
  return (a + b).toUpperCase();
}

export default function PerfilScreen() {
  const router = useRouter();
  const { sesion, guardarNombre, cerrarSesion } = useSesion();
  const nombreActual = sesion?.nombre ?? '';
  const noControl = sesion?.noControl ?? '';

  const [nombre, setNombre] = useState(nombreActual);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const valido = nombreValido(nombre);
  const cambio = limpiarNombre(nombre) !== nombreActual;
  const errorNombre = nombre.trim().length > 0 && !valido ? 'Escribe tu nombre y al menos un apellido.' : undefined;
  const version = Constants.expoConfig?.version ?? '—';

  async function guardar() {
    if (!valido || !cambio || guardando) return;
    setGuardando(true);
    Keyboard.dismiss();
    const limpio = limpiarNombre(nombre);
    await guardarNombre(limpio);
    setNombre(limpio);
    setGuardando(false);
    setGuardado(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  function confirmarSalida() {
    const salir = () => void cerrarSesion();
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('¿Cerrar sesión? Tendrás que volver a escribir tu número de control y contraseña.')) salir();
      return;
    }
    Alert.alert(
      '¿Cerrar sesión?',
      'Tendrás que volver a escribir tu número de control y contraseña para entrar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: salir },
      ],
    );
  }

  return (
    <Screen scroll footer={<Footer />}>
      <View style={styles.hero}>
        <View style={styles.avatar} accessible accessibilityLabel={`Iniciales ${iniciales(nombreActual)}`}>
          <Text style={styles.avatarText}>{iniciales(nombreActual)}</Text>
        </View>
        <Text variant="h2" center accessibilityRole="header">
          {nombreActual || 'Alumno del Tec'}
        </Text>
        <View accessible accessibilityLabel={`Número de control ${noControl}`}>
          <Chip tone="hueso" label={`No. de control ${noControl}`} />
        </View>
      </View>

      <View style={styles.stack}>
        <Card style={styles.cardGap}>
          <View style={styles.cardHead}>
            <Text variant="h3">Tu nombre</Text>
            <Text variant="small">Lo usamos al inscribirte a talleres.</Text>
          </View>
          <TextField
            label="Nombre completo"
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              setGuardado(false);
            }}
            placeholder="Ej. María Cárdenas Barrios"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            autoCorrect={false}
            maxLength={80}
            returnKeyType="done"
            onSubmitEditing={() => void guardar()}
            error={errorNombre}
          />
          {guardado ? (
            <View style={styles.ok} accessibilityRole="alert" accessibilityLiveRegion="polite">
              <CircleCheck size={20} strokeWidth={2} color={colors.hoja} />
              <Text variant="bodyStrong" color={colors.hoja}>
                Listo, guardamos tu nombre.
              </Text>
            </View>
          ) : null}
          <Button
            title="Guardar"
            variant="secondary"
            onPress={() => void guardar()}
            disabled={!valido || !cambio}
            loading={guardando}
          />
        </Card>

        <Card onPress={() => router.push('/estado')} accessibilityLabel="Estado del servidor">
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Activity size={22} strokeWidth={2} color={colors.tinta} />
            </View>
            <View style={styles.flex}>
              <Text variant="bodyStrong">Estado del servidor</Text>
              <Text variant="small">Revisa si los servicios están en línea.</Text>
            </View>
            <ChevronRight size={22} strokeWidth={2} color={colors.tinta} />
          </View>
        </Card>

        <Card variant="secondary">
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text variant="bodyStrong">CampusConectado</Text>
              <Text variant="small">TecNM Campus Reynosa</Text>
            </View>
            <Text variant="small" color={colors.tinta}>{`Versión ${version}`}</Text>
          </View>
        </Card>

        <Button title="Cerrar sesión" variant="secondary" icon={LogOut} onPress={confirmarSalida} style={styles.salir} />
      </View>
    </Screen>
  );
}

const AVATAR = 88;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { alignItems: 'center', gap: space[2], paddingTop: space[4], paddingBottom: space[5] },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.rosa,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
    ...shadow.card,
  },
  avatarText: { fontFamily: fonts.displayExtraBold, fontSize: 32, lineHeight: 38, color: colors.marfil },
  stack: { gap: 12 },
  cardGap: { gap: space[4] },
  cardHead: { gap: 2 },
  ok: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.hueso,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salir: { marginTop: space[3] },
});
