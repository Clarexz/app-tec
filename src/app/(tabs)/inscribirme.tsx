import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CircleCheck, RefreshCw } from 'lucide-react-native';
import { Banner, Button, Card, Chip, ErrorState, Screen, StateView, TallerPicker, Text } from '@/components';
import { useInscribir, useInscripciones, useTalleres } from '@/hooks';
import { ApiError, mensajeDeError, mensajeExito } from '@/api';
import { useAlumno } from '@/auth';
import { colors, fonts, space } from '@/theme';

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[1]?.[0] ?? '') : '');
  return letras.toUpperCase() || '?';
}

export default function InscribirmeScreen() {
  const { taller } = useLocalSearchParams<{ taller?: string }>();
  const { noControl, nombre } = useAlumno();
  const talleres = useTalleres();
  const inscripciones = useInscripciones(noControl);
  const mutation = useInscribir();
  const { reset } = mutation;

  const [tallerId, setTallerId] = useState<number | undefined>(undefined);

  // `?taller=ID` preselecciona el taller. Se consume el parámetro para que volver a
  // llegar con el mismo ID (desde el detalle) lo vuelva a aplicar.
  const [paramVisto, setParamVisto] = useState<string | undefined>(undefined);
  if (taller !== paramVisto) {
    setParamVisto(taller);
    const n = Number(taller);
    if (taller && Number.isInteger(n) && n > 0) setTallerId(n);
  }
  useEffect(() => {
    if (taller === undefined || taller === '') return;
    reset();
    router.setParams({ taller: undefined });
  }, [taller, reset]);

  const lista = useMemo(() => talleres.data ?? [], [talleres.data]);
  const inscritos = useMemo(
    () => (inscripciones.data ?? []).map((i) => i.taller_id),
    [inscripciones.data],
  );
  const seleccionado = lista.find((t) => t.id === tallerId);
  const yaInscrito = tallerId !== undefined && inscritos.includes(tallerId);
  const noExiste = tallerId !== undefined && talleres.isSuccess && !seleccionado;
  const listo = !!noControl && !!nombre.trim() && !!seleccionado && !yaInscrito;

  const elegir = (id: number) => {
    setTallerId(id);
    reset();
  };

  const enviar = () => {
    if (!seleccionado) return;
    mutation.mutate(
      { matricula: noControl, nombre: nombre.trim(), taller_id: seleccionado.id },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        },
      },
    );
  };

  const irAMis = () => router.navigate('/mis-inscripciones');

  // ——— Éxito ———
  if (mutation.isSuccess) {
    const ins = mutation.data;
    const t = lista.find((x) => x.id === ins.taller_id);
    const msg = mensajeExito(t, ins.taller_id);
    return (
      <Screen scroll>
        <View style={styles.page}>
          <Card>
            <View style={styles.exito} accessibilityLiveRegion="polite">
              <CircleCheck size={56} color={colors.hoja} strokeWidth={2} accessibilityLabel="Inscripción lista" />
              <Text variant="display" accessibilityRole="header">{msg.titulo}</Text>
              <Text>
                {t ? (
                  <>
                    Te esperamos en <Text variant="bodyStrong">{t.nombre}</Text>, {t.horario}.
                  </>
                ) : (
                  msg.texto
                )}
              </Text>
              <View style={styles.folioRow}>
                <Chip label={`Folio #${ins.id}`} tone="hueso" />
                <View style={styles.anotacion}>
                  <Text variant="annotation">¡nos vemos ahí!</Text>
                </View>
              </View>
            </View>
          </Card>
          <Button title="Ver mis inscripciones" arrow onPress={irAMis} />
          <Button
            title="Inscribirme a otro"
            variant="secondary"
            onPress={() => {
              reset();
              setTallerId(undefined);
            }}
          />
        </View>
      </Screen>
    );
  }

  // ——— Formulario ———
  const error = mutation.error;
  const msg = error ? mensajeDeError(error) : undefined;
  const es409 = error instanceof ApiError && error.status === 409;

  let seleccion;
  if (talleres.isError && lista.length === 0) {
    seleccion = (
      <Card>
        <ErrorState error={talleres.error} onRetry={() => void talleres.refetch()} />
      </Card>
    );
  } else if (talleres.isSuccess && lista.length === 0) {
    seleccion = (
      <Card>
        <StateView
          kind="empty"
          title="Por ahora no hay talleres abiertos"
          message="Vuelve más tarde para ver los nuevos talleres."
          actionLabel="Volver a revisar"
          icon={RefreshCw}
          onAction={() => void talleres.refetch()}
        />
      </Card>
    );
  } else {
    seleccion = (
      <View style={{ gap: space[2] }}>
        <TallerPicker
          value={tallerId}
          onChange={elegir}
          talleres={lista}
          loading={talleres.isLoading}
          disabledIds={inscritos}
          disabledLabel="Ya inscrito"
          error={noExiste ? `No encontramos el taller #${tallerId}. Elige otro de la lista.` : undefined}
        />
        {yaInscrito ? (
          <Banner
            tone="info"
            title="Ya estás inscrito en este taller"
            message="Elige otro o revísalo en Mis inscripciones."
          />
        ) : null}
      </View>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.page}>
        <View style={{ gap: space[2] }}>
          <Text variant="kicker">Inscripción</Text>
          <Text variant="display" accessibilityRole="header">Inscríbete a un taller</Text>
          <Text color={colors.tintaSuave}>Elige el taller y listo: tus datos ya están aquí.</Text>
        </View>

        <Identidad nombre={nombre} noControl={noControl} />

        {seleccion}

        {msg ? (
          <View style={{ gap: space[2] }}>
            <Banner tone="error" title={msg.titulo} message={msg.texto} detail={msg.detalle} onClose={reset} />
            {es409 ? <Button title="Ver mis inscripciones" variant="ghost" onPress={irAMis} /> : null}
          </View>
        ) : null}

        <Button
          title="Inscribirme"
          arrow
          disabled={!listo}
          loading={mutation.isPending}
          onPress={enviar}
          accessibilityLabel={seleccionado ? `Inscribirme a ${seleccionado.nombre}` : 'Inscribirme'}
        />
        {!seleccionado && !talleres.isError && lista.length > 0 ? (
          <Text variant="small" center>Elige un taller para continuar.</Text>
        ) : null}
      </View>
    </Screen>
  );
}

function Identidad({ nombre, noControl }: { nombre: string; noControl: string }) {
  return (
    <Card variant="secondary" style={styles.idCard}>
      <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.avatarTxt}>{iniciales(nombre)}</Text>
      </View>
      <View
        style={styles.idBody}
        accessible
        accessibilityLabel={`Te inscribes como ${nombre}, número de control ${noControl}`}
      >
        <Text variant="small">Te inscribes como</Text>
        <Text variant="bodyStrong" numberOfLines={1}>{nombre}</Text>
        <Text variant="small" numberOfLines={1}>{`No. de control ${noControl}`}</Text>
      </View>
      <Pressable
        onPress={() => router.push('/perfil')}
        accessibilityRole="link"
        accessibilityLabel="¿No eres tú? Ver mi cuenta"
        hitSlop={12}
        style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
      >
        <Text variant="small" color={colors.rosaProfundo} style={{ fontFamily: fonts.sansBold }}>¿No eres tú?</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: space[5], gap: space[4] },
  exito: { gap: space[3], alignItems: 'flex-start' },
  folioRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], flexWrap: 'wrap' },
  anotacion: { transform: [{ rotate: '-3deg' }] },
  idCard: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: 14 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sol, alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { fontFamily: fonts.displayExtraBold, fontSize: 16, lineHeight: 20, color: colors.tinta },
  idBody: { flex: 1, gap: 0 },
  link: { alignSelf: 'center', paddingVertical: 4 },
});
