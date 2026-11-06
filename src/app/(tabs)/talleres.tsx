import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Clock, Search } from 'lucide-react-native';
import { Banner, Button, Card, Chip, ErrorState, Footer, StateView, Text, TextField } from '@/components';
import { ApiError, api, mensajeDeError } from '@/api';
import { queryClient } from '@/api/queryClient';
import { qk, useTalleres } from '@/hooks';
import { colors, layout, space } from '@/theme';
import type { Taller } from '@/types/api';

export default function TalleresScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, error, refetch, isRefetching } = useTalleres();

  const [texto, setTexto] = useState('');
  const [campoError, setCampoError] = useState<string | undefined>();
  const [hint, setHint] = useState<string | undefined>();
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState<ReturnType<typeof mensajeDeError> | null>(null);

  async function buscar() {
    setFallo(null);
    setHint(undefined);
    const limpio = texto.trim();
    const id = /^\d+$/.test(limpio) ? parseInt(limpio, 10) : NaN;
    if (!Number.isFinite(id) || id <= 0) {
      setCampoError('Escribe el número del taller');
      return;
    }
    setCampoError(undefined);
    setBuscando(true);
    try {
      await queryClient.fetchQuery({ queryKey: qk.taller(id), queryFn: () => api.taller(id) });
      router.push(`/taller/${id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setCampoError('Ese taller no existe');
        setHint('Revisa el número o elige uno de la lista.');
      } else {
        setFallo(mensajeDeError(e));
      }
    } finally {
      setBuscando(false);
    }
  }

  const header = (
    <View style={styles.header}>
      <Text variant="display">Talleres</Text>
      <View style={{ marginTop: space[4], gap: space[3] }}>
        <TextField
          label="Buscar por número de taller"
          value={texto}
          onChangeText={(t) => {
            setTexto(t);
            setCampoError(undefined);
            setHint(undefined);
          }}
          keyboardType="number-pad"
          returnKeyType="search"
          onSubmitEditing={buscar}
          placeholder="Ej. 3"
          error={campoError}
          hint={hint}
        />
        <Button
          title="Buscar taller"
          variant="secondary"
          icon={Search}
          onPress={buscar}
          loading={buscando}
          accessibilityLabel="Buscar taller"
        />
        {fallo ? (
          <Banner
            tone="error"
            title={fallo.titulo}
            message={fallo.texto}
            detail={fallo.detalle}
            onClose={() => setFallo(null)}
          />
        ) : null}
      </View>
      <Text variant="h3" style={{ marginTop: space[5], marginBottom: space[3] }}>
        Todos los talleres
      </Text>
    </View>
  );

  let empty: React.ReactElement | null = null;
  if (isLoading) empty = <StateView kind="loading" skeletonCount={3} />;
  else if (isError) empty = <ErrorState error={error} onRetry={() => refetch()} />;
  else if (!data || data.length === 0)
    empty = <StateView kind="empty" message="Todavía no hay talleres disponibles. Vuelve más tarde." />;

  return (
    <FlatList<Taller>
      data={isLoading || isError ? [] : (data ?? [])}
      keyExtractor={(t) => String(t.id)}
      style={styles.list}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingTop: insets.top + space[4],
        paddingHorizontal: layout.gutter,
        paddingBottom: space[6],
      }}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <View style={{ height: layout.cardGap }} />}
      renderItem={({ item }) => (
        <Card onPress={() => router.push(`/taller/${item.id}`)}>
          <View style={styles.row}>
            <View style={{ flex: 1, gap: space[2] }}>
              <View style={{ flexDirection: 'row' }}>
                <Chip label={`#${item.id}`} tone="sol" />
              </View>
              <Text variant="h3">{item.nombre}</Text>
              <View style={styles.horario}>
                <Clock size={20} strokeWidth={2} color={colors.tinta} />
                <Text style={{ flex: 1 }}>{item.horario}</Text>
              </View>
            </View>
            <ChevronRight size={24} strokeWidth={2} color={colors.tintaSuave} />
          </View>
        </Card>
      )}
      ListFooterComponent={<Footer />}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isLoading}
          onRefresh={() => refetch()}
          tintColor={colors.rosa}
          colors={[colors.rosa]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.marfil },
  header: { marginBottom: space[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  horario: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
