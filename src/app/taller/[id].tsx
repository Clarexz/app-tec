import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CircleCheck, Clock, SearchX } from 'lucide-react-native';
import { Button, Card, Chip, ErrorState, Screen, Skeleton, StateView, Text } from '@/components';
import { ApiError } from '@/api';
import { useAlumno } from '@/auth';
import { useInscripciones, useTaller, useTallerNombre } from '@/hooks';
import { colors, radius, space } from '@/theme';

export default function TallerDetalle() {
  const router = useRouter();
  const alumno = useAlumno();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Number(idParam);
  const valido = Number.isInteger(id) && id > 0;
  const { data, isLoading, isError, error, refetch, isRefetching } = useTaller(valido ? id : undefined);
  const inscripciones = useInscripciones(alumno.noControl);
  const buscarEnCache = useTallerNombre();

  // Muestra al instante lo que ya conocemos de la lista mientras llega el detalle.
  const taller = data ?? (valido ? buscarEnCache(id) : undefined);
  const noExiste = !valido || (isError && error instanceof ApiError && error.status === 404);
  const titulo = valido ? `Taller #${id}` : 'Taller';

  if (noExiste) {
    return (
      <Screen scroll>
        <Stack.Screen options={{ title: 'Taller' }} />
        <StateView
          kind="error"
          icon={SearchX}
          title="Ese taller no existe"
          message="Revisa el número del taller o elige uno de la lista."
          actionLabel="Ver todos los talleres"
          onAction={() => router.navigate('/talleres')}
        />
      </Screen>
    );
  }
  if (!taller && isLoading) {
    return (
      <Screen scroll>
        <Stack.Screen options={{ title: titulo }} />
        <View style={styles.content} accessibilityLabel="Cargando taller" accessibilityLiveRegion="polite">
          <Skeleton height={44} width={88} radius={radius.pill} />
          <Skeleton height={36} width="80%" />
          <Skeleton height={24} width="55%" />
          <Skeleton height={96} radius={radius.lg} style={{ marginTop: space[3] }} />
          <Skeleton height={52} radius={radius.pill} style={{ marginTop: space[2] }} />
        </View>
      </Screen>
    );
  }
  if (!taller) {
    return (
      <Screen scroll>
        <Stack.Screen options={{ title: titulo }} />
        <ErrorState error={error} onRetry={() => refetch()} />
      </Screen>
    );
  }

  const inscrito = (inscripciones.data ?? []).some((i) => i.taller_id === taller.id);
  const revisandoInscripcion = inscripciones.isLoading && !!alumno.noControl;

  return (
    <Screen
      scroll
      refreshing={isRefetching}
      onRefresh={() => {
        refetch();
        if (alumno.noControl) inscripciones.refetch();
      }}
    >
      <Stack.Screen options={{ title: titulo }} />
      <Animated.View entering={FadeInDown.duration(320)} style={styles.content}>
        <Text variant="kicker">Taller</Text>
        <Chip label={`#${taller.id}`} tone="sol" size="lg" accessibilityLabel={`Taller número ${taller.id}`} />
        <Text variant="display" accessibilityRole="header">
          {taller.nombre}
        </Text>

        <Card style={{ marginTop: space[2] }}>
          <View style={styles.infoRow} accessible accessibilityLabel={`Horario: ${taller.horario}`}>
            <View style={styles.infoIcon}>
              <Clock size={22} strokeWidth={2} color={colors.tinta} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="small">Horario</Text>
              <Text variant="bodyStrong">{taller.horario}</Text>
            </View>
          </View>
        </Card>

        {revisandoInscripcion ? (
          <Skeleton height={52} radius={radius.pill} style={{ marginTop: space[3] }} />
        ) : inscrito ? (
          <Animated.View entering={FadeInDown.duration(280)} style={{ gap: space[3], marginTop: space[2] }}>
            <Card variant="secondary" accessibilityLabel="Ya estás inscrito en este taller">
              <View style={styles.inscritoRow}>
                <CircleCheck size={24} strokeWidth={2} color={colors.hoja} />
                <View style={{ flex: 1, gap: space[1] }}>
                  <Text variant="h3">Ya estás inscrito</Text>
                  <Text>Ya tienes lugar en este taller. Lo ves en Mis inscripciones.</Text>
                  <Text variant="annotation" style={{ marginTop: space[1] }}>¡nos vemos ahí!</Text>
                </View>
              </View>
            </Card>
            <Button
              title="Ver mis inscripciones"
              variant="secondary"
              onPress={() => router.navigate('/mis-inscripciones')}
            />
          </Animated.View>
        ) : (
          <View style={{ gap: space[3], marginTop: space[2] }}>
            <Card variant="secondary">
              <Text>Aparta tu lugar con tu número de control. Sin filas ni papeles.</Text>
            </Card>
            <Button
              title="Inscribirme aquí"
              arrow
              haptic
              accessibilityLabel={`Inscribirme en ${taller.nombre}`}
              onPress={() =>
                router.navigate({ pathname: '/inscribirme', params: { taller: String(taller.id) } })
              }
            />
          </View>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space[3], paddingTop: space[2], paddingBottom: space[6] },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.hueso,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inscritoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
});
