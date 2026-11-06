import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity } from 'lucide-react-native';
import { Card, refreshControl, ErrorState, Footer, Header, IconButton, StateView, Text } from '@/components';
import { useAvisos } from '@/hooks';
import { usePerfil } from '@/storage/perfil';
import { colors, fonts, layout, radius, space } from '@/theme';
import type { Aviso } from '@/types/api';

export default function AvisosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { perfil } = usePerfil();
  const { data, isLoading, isError, error, refetch, isRefetching } = useAvisos();

  const primerNombre = perfil?.nombre?.trim().split(/\s+/)[0];
  const saludo = primerNombre ? `¡Hola, ${primerNombre}!` : 'Hola';

  const header = (
    <View style={styles.header}>
      <Pressable
        onLongPress={() => router.push('/estado')}
        delayLongPress={600}
        accessibilityLabel="CampusConectado"
        style={styles.brand}
      >
        <View style={styles.logo} />
        <Text variant="small" style={styles.brandText}>
          CampusConectado
        </Text>
      </Pressable>
      <Header
        kicker={saludo}
        title="Avisos del campus"
        onLongPressTitle={() => router.push('/estado')}
        right={<IconButton icon={Activity} onPress={() => router.push('/estado')} accessibilityLabel="Estado del servidor" />}
      />
    </View>
  );

  let empty: React.ReactElement | undefined;
  if (isLoading) empty = <StateView kind="loading" skeletonCount={3} />;
  else if (isError) empty = <ErrorState error={error} onRetry={() => refetch()} />;
  else if (!data || data.length === 0)
    empty = <StateView kind="empty" message="Por ahora no hay avisos. Vuelve más tarde." />;

  return (
    <FlatList<Aviso>
      data={isLoading || isError ? [] : (data ?? [])}
      keyExtractor={(a) => String(a.id)}
      style={styles.list}
      contentContainerStyle={{
        paddingTop: insets.top + space[3],
        paddingHorizontal: layout.gutter,
        paddingBottom: space[6],
      }}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <View style={{ height: layout.cardGap }} />}
      renderItem={({ item, index }) =>
        index === 0 ? (
          <Card variant="highlight">
            <Text variant="h2" color={colors.marfil}>
              {item.titulo}
            </Text>
            <Text style={styles.highlightMsg}>{item.mensaje}</Text>
          </Card>
        ) : (
          <Card>
            <Text variant="h3">{item.titulo}</Text>
            <Text style={{ marginTop: space[1] }}>{item.mensaje}</Text>
          </Card>
        )
      }
      ListFooterComponent={<Footer />}
      refreshControl={refreshControl(isRefetching && !isLoading, () => {
        refetch();
      })}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.marfil },
  header: { marginBottom: space[1] },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 36, marginBottom: space[3] },
  logo: { width: 14, height: 14, borderRadius: radius.sm, backgroundColor: colors.rosa },
  brandText: { fontFamily: fonts.sansBold, color: colors.tinta },
  highlightMsg: {
    marginTop: space[2],
    fontSize: 19,
    lineHeight: 26,
    fontFamily: fonts.sansBold,
    color: colors.marfil,
  },
});
