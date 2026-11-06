import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { Button, Card, Chip, ErrorState, Screen, StateView, Text } from '@/components';
import { ApiError } from '@/api';
import { useTaller } from '@/hooks';
import { colors, space } from '@/theme';

export default function TallerDetalle() {
  const router = useRouter();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Number(idParam);
  const valido = Number.isFinite(id) && id > 0;
  const { data, isLoading, isError, error, refetch } = useTaller(valido ? id : undefined);

  const noExiste = !valido || (isError && error instanceof ApiError && error.status === 404);

  if (noExiste) {
    return (
      <Screen scroll>
        <StateView
          kind="error"
          title="Ese taller no existe"
          message="Revisa el número del taller o elige uno de la lista."
          actionLabel="Ver todos los talleres"
          onAction={() => router.navigate('/talleres')}
        />
      </Screen>
    );
  }
  if (isLoading) {
    return (
      <Screen scroll>
        <StateView kind="loading" skeletonCount={2} />
      </Screen>
    );
  }
  if (isError || !data) {
    return (
      <Screen scroll>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: space[3], paddingTop: space[2], paddingBottom: space[6] }}>
        <Text variant="kicker">TALLER</Text>
        <View style={{ flexDirection: 'row' }}>
          <Chip label={`#${data.id}`} tone="sol" size="lg" />
        </View>
        <Text variant="display">{data.nombre}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          <Clock size={20} strokeWidth={2} color={colors.tinta} />
          <Text style={{ flex: 1 }}>{data.horario}</Text>
        </View>
        <Card variant="secondary" style={{ marginTop: space[3] }}>
          <Text>Inscríbete con tu matrícula y tu nombre. Sin filas ni papeles.</Text>
        </Card>
        <Button
          title="Inscribirme aquí"
          arrow
          onPress={() => router.navigate({ pathname: '/inscribirme', params: { taller: String(data.id) } })}
          style={{ marginTop: space[2] }}
        />
      </View>
    </Screen>
  );
}
