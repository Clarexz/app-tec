import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity } from 'lucide-react-native';
import { Card, ErrorState, Footer, StateView, Text } from '@/components';
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
      <View style={styles.brandRow}>
        <Pressable
          onLongPress={() => router.push('/estado')}
          delayLongPress={500}
          accessibilityRole="header"
          accessibilityLabel="CampusConectado"
          style={styles.brand}
        >
          <View style={styles.logo} />
          <Text variant="small" color={colors.tinta} style={styles.brandText}>
            CampusConectado
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/estado')}
          accessibilityRole="button"
          accessibilityLabel="Estado del servidor"
          hitSlop={8}
          style={styles.iconBtn}
        >
          <Activity size={24} strokeWidth={2} color={colors.tinta} />
        </Pressable>
      </View>
      <Text variant="kicker" style={{ marginTop: space[4] }}>
        {saludo}
      </Text>
      <Text variant="display" style={{ marginTop: space[1] }}>
        Avisos del campus
      </Text>
    </View>
  );

  let empty: React.ReactElement | null = null;
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
  header: { marginBottom: space[4] },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 44 },
  logo: { width: 14, height: 14, borderRadius: radius.sm, backgroundColor: colors.rosa },
  brandText: { fontFamily: fonts.sansBold, color: colors.tinta },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  highlightMsg: {
    marginTop: space[2],
    fontSize: 19,
    lineHeight: 26,
    fontFamily: fonts.sansBold,
    color: colors.marfil,
  },
});
