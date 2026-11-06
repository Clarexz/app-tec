import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CircleCheck } from 'lucide-react-native';
import { Banner, Button, Card, Screen, TallerPicker, Text, TextField } from '@/components';
import { useInscribir, useTalleres, useTallerNombre } from '@/hooks';
import { ApiError, mensajeDeError, mensajeExito } from '@/api';
import { config, isMocked } from '@/config';
import { guardarPerfil, usePerfil } from '@/storage/perfil';
import { colors, space } from '@/theme';

export default function InscribirmeScreen() {
  const { taller } = useLocalSearchParams<{ taller?: string }>();
  const { perfil, cargado } = usePerfil();
  const talleres = useTalleres();
  const nombreDeTaller = useTallerNombre();
  const mutation = useInscribir();

  const [matricula, setMatricula] = useState('');
  const [nombre, setNombre] = useState('');
  const [tallerId, setTallerId] = useState<number | undefined>(undefined);
  const [escribirNumero, setEscribirNumero] = useState(false);
  const [numeroTexto, setNumeroTexto] = useState('');
  const nombreRef = useRef<ComponentRef<typeof TextInput>>(null);
  const prefilled = useRef(false);

  useEffect(() => {
    if (!cargado || prefilled.current) return;
    prefilled.current = true;
    if (perfil) {
      setMatricula((m) => (m ? m : perfil.matricula));
      setNombre((n) => (n ? n : perfil.nombre));
    }
  }, [cargado, perfil]);

  useEffect(() => {
    if (taller === undefined) return;
    const n = Number(taller);
    setTallerId(Number.isFinite(n) && taller !== '' ? n : undefined);
    setNumeroTexto(taller);
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taller]);

  const mock = config.useMocks || isMocked('inscripciones');
  const listo = matricula.trim().length > 0 && nombre.trim().length > 0 && tallerId !== undefined;

  const enviar = (forzar: boolean) => {
    const m = matricula.trim().toUpperCase();
    const n = nombre.trim();
    if (!forzar) void guardarPerfil({ matricula: m, nombre: n });
    mutation.mutate(
      { matricula: m, nombre: n, taller_id: Number(tallerId ?? NaN) },
      { onSuccess: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
    );
  };

  const irAMis = () =>
    router.navigate({
      pathname: '/mis-inscripciones',
      params: { matricula: matricula.trim().toUpperCase() },
    });

  if (mutation.isSuccess) {
    const ins = mutation.data;
    const t = nombreDeTaller(ins.taller_id);
    const msg = mensajeExito(t, ins.taller_id);
    return (
      <Screen scroll>
        <View style={{ paddingTop: space[5], gap: space[4] }}>
          <Card>
            <View style={{ gap: space[3], alignItems: 'flex-start' }}>
              <CircleCheck size={56} color={colors.hoja} strokeWidth={2} />
              <Text variant="display">{msg.titulo}</Text>
              <Text>
                {t ? (
                  <>
                    Te esperamos en <Text variant="bodyStrong">{t.nombre}</Text>, {t.horario}.
                  </>
                ) : (
                  msg.texto
                )}
              </Text>
              <Text variant="small">{`Folio #${ins.id}`}</Text>
              <View style={{ transform: [{ rotate: '-3deg' }] }}>
                <Text variant="annotation">¡nos vemos ahí!</Text>
              </View>
            </View>
          </Card>
          <Button title="Ver mis inscripciones" onPress={irAMis} />
          <Button
            title="Inscribirme a otro"
            variant="secondary"
            onPress={() => {
              mutation.reset();
              setTallerId(undefined);
              setNumeroTexto('');
            }}
          />
        </View>
      </Screen>
    );
  }

  const error = mutation.error;
  const msg = error ? mensajeDeError(error) : undefined;
  const es409 = error instanceof ApiError && error.status === 409;

  return (
    <Screen scroll>
      <View style={{ paddingTop: space[5], gap: space[4] }}>
        <View style={{ gap: space[2] }}>
          <Text variant="kicker">INSCRIPCIÓN</Text>
          <Text variant="display">Inscríbete a un taller</Text>
          <Text color={colors.tintaSuave}>Solo necesitas tu matrícula, tu nombre y el taller.</Text>
        </View>

        <TextField
          label="Matrícula"
          placeholder="Ej. A001"
          value={matricula}
          onChangeText={setMatricula}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => nombreRef.current?.focus()}
        />
        <TextField
          label="Nombre"
          placeholder="Tu nombre completo"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
          inputRef={nombreRef}
        />

        <View style={{ gap: space[2] }}>
          <TallerPicker
            value={tallerId}
            onChange={(id) => {
              setTallerId(id);
              setNumeroTexto(String(id));
            }}
            talleres={talleres.data ?? []}
            loading={talleres.isLoading}
          />
          <Button
            title="Escribir el número"
            variant="ghost"
            onPress={() => setEscribirNumero((v) => !v)}
          />
          {escribirNumero ? (
            <TextField
              label="Número de taller"
              value={numeroTexto}
              onChangeText={(t) => {
                const limpio = t.replace(/[^0-9]/g, '');
                setNumeroTexto(limpio);
                setTallerId(limpio === '' ? undefined : Number(limpio));
              }}
              keyboardType="number-pad"
            />
          ) : null}
        </View>

        {msg ? (
          <View style={{ gap: space[2] }}>
            <Banner tone="error" title={msg.titulo} message={msg.texto} detail={msg.detalle} />
            {es409 ? <Button title="Ver mis inscripciones" variant="ghost" onPress={irAMis} /> : null}
          </View>
        ) : null}

        <Button
          title="Inscribirme"
          arrow
          disabled={!listo}
          loading={mutation.isPending}
          onPress={() => enviar(false)}
        />
        {mock ? (
          <Button
            title="Enviar sin validar (prueba)"
            variant="ghost"
            disabled={mutation.isPending}
            onPress={() => enviar(true)}
          />
        ) : null}
      </View>
    </Screen>
  );
}
