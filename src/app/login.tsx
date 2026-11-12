import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View, type TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { Banner, Button, Card, Footer, Text, TextField } from '@/components';
import { useSesion } from '@/auth';
import { colors, fonts, layout, radius, shadow, space } from '@/theme';

const RE_CONTROL = /^\d{8}$/;
const RE_CLAVE = /^[A-Z]{4}$/;

type Fallo = 'credenciales' | 'red' | null;

export default function LoginScreen() {
  const router = useRouter();
  const { iniciarSesion } = useSesion();
  const claveRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [noControl, setNoControl] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState<Fallo>(null);

  const valido = RE_CONTROL.test(noControl) && RE_CLAVE.test(clave);

  function cambiarControl(t: string) {
    const limpio = t.replace(/\D/g, '').slice(0, 8);
    setNoControl(limpio);
    setFallo(null);
    // Al completar los 8 dígitos pasa solo a la contraseña (el teclado numérico no tiene "Siguiente" en iOS).
    if (limpio.length === 8 && noControl.length < 8) claveRef.current?.focus();
  }

  function cambiarClave(t: string) {
    setClave(t.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4));
    setFallo(null);
  }

  async function entrar() {
    if (!valido || enviando) return;
    setEnviando(true);
    setFallo(null);
    const r = await iniciarSesion(noControl, clave);
    if (r.ok) {
      // El guard de _layout cambia solo a las pestañas.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    setFallo(r.motivo);
    setEnviando(false);
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
          {/* Marca. Long-press discreto → Estado del servidor. */}
          <Pressable
            onLongPress={() => router.push('/estado')}
            delayLongPress={800}
            accessibilityRole="header"
            accessibilityLabel="CampusConectado, TecNM Campus Reynosa"
            style={styles.brand}
          >
            <View style={styles.logo}>
              <Text style={styles.logoText}>cc</Text>
              <View style={styles.logoSol} />
            </View>
            <View style={styles.wordmark}>
              <Text style={styles.wordTinta}>
                Campus<Text style={styles.wordRosa}>Conectado</Text>
              </Text>
              <Text variant="kicker" color={colors.tinta}>
                TecNM Campus Reynosa
              </Text>
            </View>
          </Pressable>

          <View style={styles.intro}>
            <Text variant="annotation" style={styles.nota}>
              ¡qué bueno verte!
            </Text>
            <Text variant="display" accessibilityRole="header">
              Inicia sesión
            </Text>
            <Text color={colors.tintaSuave}>Entra con tu número de control para ver avisos y talleres.</Text>
          </View>

          <Card style={styles.form}>
            <TextField
              label="No. de control"
              accessibilityLabel="Número de control"
              value={noControl}
              onChangeText={cambiarControl}
              placeholder="Ej. 22580076"
              keyboardType="number-pad"
              maxLength={8}
              autoComplete="username"
              textContentType="username"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => claveRef.current?.focus()}
              editable={!enviando}
            />
            <TextField
              inputRef={claveRef}
              label="Contraseña"
              value={clave}
              onChangeText={cambiarClave}
              hint="Las 4 primeras letras de tu CURP"
              placeholder="ABCD"
              secureTextEntry={!verClave}
              autoCapitalize="characters"
              autoComplete="current-password"
              textContentType="password"
              autoCorrect={false}
              maxLength={4}
              returnKeyType="done"
              onSubmitEditing={() => void entrar()}
              editable={!enviando}
              right={
                <Pressable
                  onPress={() => setVerClave((v) => !v)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={styles.ojo}
                >
                  {verClave ? (
                    <EyeOff size={22} strokeWidth={2} color={colors.tinta} />
                  ) : (
                    <Eye size={22} strokeWidth={2} color={colors.tinta} />
                  )}
                </Pressable>
              }
            />

            {fallo === 'credenciales' ? (
              <Banner
                tone="error"
                title="Número de control o contraseña incorrectos"
                message="Revisa tus datos e inténtalo de nuevo."
              />
            ) : fallo === 'red' ? (
              <Banner
                tone="error"
                title="No pudimos conectarnos"
                message="Revisa tu internet e inténtalo de nuevo."
              />
            ) : null}

            <Button
              title="Iniciar sesión"
              onPress={() => void entrar()}
              disabled={!valido}
              loading={enviando}
              style={styles.boton}
            />
          </Card>

          <Text variant="small" center style={styles.ayuda}>
            ¿No puedes entrar? Pide ayuda en Servicios Escolares.
          </Text>

          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const LOGO = 56;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.marfil },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.gutter,
    paddingTop: space[6],
    gap: space[5],
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space[3], alignSelf: 'flex-start' },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.rosa,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  logoText: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -1.5,
    color: colors.marfil,
    marginTop: -4,
  },
  logoSol: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.sol,
    borderWidth: 3,
    borderColor: colors.marfil,
  },
  wordmark: { gap: 2 },
  wordTinta: { fontFamily: fonts.displayExtraBold, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: colors.tinta },
  wordRosa: { color: colors.rosaProfundo },
  intro: { gap: space[2], marginTop: space[3] },
  nota: { transform: [{ rotate: '-3deg' }], alignSelf: 'flex-start', marginLeft: space[1] },
  form: { gap: space[4] },
  ojo: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  boton: { marginTop: space[1] },
  ayuda: { marginTop: -space[2] },
});
