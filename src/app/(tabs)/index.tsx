import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Megaphone, UserRound } from 'lucide-react-native';
import { Card, ErrorState, Footer, Header, Skeleton, StateView, Text, refreshControl } from '@/components';
import { useAlumno } from '@/auth';
import { useAvisos } from '@/hooks';
import { colors, fonts, layout, radius, shadow, space } from '@/theme';
import type { Aviso } from '@/types/api';

/** Iniciales de "Nombre Apellido …" → "NA". */
function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';
  const a = partes[0][0] ?? '';
  const b = partes.length > 1 ? (partes[1][0] ?? '') : '';
  return (a + b).toUpperCase();
}

function Avatar({ nombre, onPress }: { nombre: string; onPress: () => void }) {
  const ini = iniciales(nombre);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Mi cuenta"
      accessibilityHint="Abre tus datos y la opción para cerrar sesión"
      hitSlop={6}
      style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
    >
      {ini ? (
        <Text style={styles.avatarText}>{ini}</Text>
      ) : (
        <UserRound size={22} strokeWidth={2} color={colors.tinta} />
      )}
    </Pressable>
  );
}

const entrada = (index: number) => FadeInDown.duration(320).delay(Math.min(index, 6) * 60);

export default function AvisosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const alumno = useAlumno();
  const { data, isLoading, isError, error, refetch, isRefetching } = useAvisos();

  const primerNombre = alumno.nombre.trim().split(/\s+/)[0];
  const saludo = primerNombre ? `¡Hola, ${primerNombre}!` : 'Hola';
  const avisos = isLoading || isError ? [] : (data ?? []);

  const abrirEstado = useCallback(() => router.push('/estado'), [router]);

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Pressable
          onLongPress={abrirEstado}
          delayLongPress={600}
          accessibilityLabel="CampusConectado"
          style={styles.brand}
        >
          <View style={styles.logo} />
          <Text variant="small" style={styles.brandText}>
            CampusConectado
          </Text>
        </Pressable>
        <Avatar nombre={alumno.nombre} onPress={() => router.push('/perfil')} />
      </View>
      <Header kicker={saludo} title="Avisos del campus" onLongPressTitle={abrirEstado} />
      {avisos.length > 0 ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <Text variant="small" style={styles.count}>
            {avisos.length === 1 ? '1 aviso para ti' : `${avisos.length} avisos para ti`}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );

  let empty: React.ReactElement | undefined;
  if (isLoading) empty = <AvisosSkeleton />;
  else if (isError) empty = <ErrorState error={error} onRetry={() => refetch()} />;
  else
    empty = (
      <StateView
        kind="empty"
        icon={Megaphone}
        title="Todo tranquilo"
        message="Por ahora no hay avisos. Vuelve más tarde."
      />
    );

  return (
    <FlatList<Aviso>
      data={avisos}
      keyExtractor={(a) => String(a.id)}
      style={styles.list}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top + space[3],
        paddingHorizontal: layout.gutter,
        paddingBottom: space[6],
      }}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={Separador}
      renderItem={({ item, index }) => (
        <Animated.View entering={entrada(index)}>
          {index === 0 ? <AvisoDestacado aviso={item} /> : <AvisoCard aviso={item} />}
        </Animated.View>
      )}
      ListFooterComponent={<Footer />}
      refreshControl={refreshControl(isRefetching && !isLoading, () => {
        refetch();
      })}
    />
  );
}

function Separador() {
  return <View style={{ height: layout.cardGap }} />;
}

function AvisoDestacado({ aviso }: { aviso: Aviso }) {
  return (
    <Card variant="highlight" style={styles.destacado}>
      <View accessible accessibilityLabel={`Aviso destacado. ${aviso.titulo}. ${aviso.mensaje}`}>
        <View style={styles.destacadoIcon}>
          <Megaphone size={22} strokeWidth={2} color={colors.marfil} />
        </View>
        <Text variant="h2" color={colors.marfil}>
          {aviso.titulo}
        </Text>
        <Text style={styles.highlightMsg}>{aviso.mensaje}</Text>
      </View>
    </Card>
  );
}

function AvisoCard({ aviso }: { aviso: Aviso }) {
  return (
    <Card>
      <View accessible accessibilityLabel={`${aviso.titulo}. ${aviso.mensaje}`} style={styles.cardRow}>
        <View style={styles.dot} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">{aviso.titulo}</Text>
          <Text style={{ marginTop: space[1] }}>{aviso.mensaje}</Text>
        </View>
      </View>
    </Card>
  );
}

function AvisosSkeleton() {
  return (
    <View accessibilityLabel="Cargando avisos" accessibilityLiveRegion="polite" style={{ gap: layout.cardGap }}>
      <Skeleton height={168} radius={radius.lg} />
      <StateView kind="loading" skeletonCount={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.marfil },
  header: { marginBottom: space[1] },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 44 },
  logo: { width: 14, height: 14, borderRadius: radius.sm, backgroundColor: colors.rosa },
  brandText: { fontFamily: fonts.sansBold, color: colors.tinta },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sol,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.blanco,
    ...shadow.card,
  },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 16, lineHeight: 20, color: colors.tinta },
  count: { marginTop: -space[2], marginBottom: space[3] },
  destacado: { paddingVertical: space[5] },
  destacadoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,246,230,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[3],
  },
  highlightMsg: {
    marginTop: space[2],
    fontSize: 19,
    lineHeight: 26,
    fontFamily: fonts.sansBold,
    color: colors.marfil,
  },
  cardRow: { flexDirection: 'row', gap: space[3] },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.rosa, marginTop: 7 },
});
