import { useMemo, useState } from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, ChevronRight, Clock, Search, SearchX, X } from 'lucide-react-native';
import {
  Banner,
  Button,
  Card,
  Chip,
  ErrorState,
  Footer,
  StateView,
  Text,
  TextField,
  refreshControl,
} from '@/components';
import { ApiError, api, mensajeDeError } from '@/api';
import { queryClient } from '@/api/queryClient';
import { useAlumno } from '@/auth';
import { qk, useInscripciones, useTalleres } from '@/hooks';
import { colors, layout, space } from '@/theme';
import type { Taller } from '@/types/api';

/** Minúsculas y sin acentos, para comparar "Música" con "musica". */
const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const entrada = (index: number) => FadeInDown.duration(300).delay(Math.min(index, 6) * 50);

export default function TalleresScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const alumno = useAlumno();
  const { data, isLoading, isError, error, refetch, isRefetching } = useTalleres();
  const inscripciones = useInscripciones(alumno.noControl);

  const [texto, setTexto] = useState('');
  const [campoError, setCampoError] = useState<string | undefined>();
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState<ReturnType<typeof mensajeDeError> | null>(null);

  const consulta = texto.trim();
  const esNumero = /^#?\d+$/.test(consulta);
  const numero = esNumero ? parseInt(consulta.replace('#', ''), 10) : NaN;

  const inscritos = useMemo(
    () => new Set((inscripciones.data ?? []).map((i) => i.taller_id)),
    [inscripciones.data],
  );

  const todos = useMemo(() => data ?? [], [data]);
  const filtrados = useMemo(() => {
    if (!consulta || esNumero) return todos;
    const q = normalizar(consulta);
    return todos.filter((t) => normalizar(t.nombre).includes(q) || normalizar(t.horario).includes(q));
  }, [todos, consulta, esNumero]);

  function cambiarTexto(t: string) {
    setTexto(t);
    setCampoError(undefined);
    setFallo(null);
  }

  async function buscarPorNumero() {
    setFallo(null);
    if (!Number.isFinite(numero) || numero <= 0) {
      setCampoError('Escribe un número de taller válido');
      return;
    }
    setCampoError(undefined);
    setBuscando(true);
    try {
      await queryClient.fetchQuery({ queryKey: qk.taller(numero), queryFn: () => api.taller(numero) });
      Keyboard.dismiss();
      router.push(`/taller/${numero}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setCampoError('Ese taller no existe');
      } else {
        setFallo(mensajeDeError(e));
      }
    } finally {
      setBuscando(false);
    }
  }

  function enviar() {
    if (esNumero) void buscarPorNumero();
    else if (filtrados.length === 1) router.push(`/taller/${filtrados[0].id}`);
    else Keyboard.dismiss();
  }

  const listaLista = !isLoading && !isError && todos.length > 0;
  const filtrando = consulta.length > 0 && !esNumero;

  const header = (
    <View style={styles.header}>
      <Text variant="display" accessibilityRole="header">
        Talleres
      </Text>
      <Text color={colors.tintaSuave} style={{ marginTop: space[1] }}>
        Toca un taller para ver su horario e inscribirte.
      </Text>
      <View style={{ marginTop: space[4], gap: space[3] }}>
        <TextField
          label="Busca por número o nombre"
          value={texto}
          onChangeText={cambiarTexto}
          returnKeyType="search"
          onSubmitEditing={enviar}
          placeholder="Ej. 3 o Ajedrez"
          autoCorrect={false}
          autoCapitalize="none"
          error={campoError}
          hint={
            campoError
              ? undefined
              : esNumero
                ? `Toca “Ver taller #${numero}” para abrirlo.`
                : undefined
          }
          right={
            texto.length > 0 ? (
              <Pressable
                onPress={() => cambiarTexto('')}
                accessibilityRole="button"
                accessibilityLabel="Borrar búsqueda"
                hitSlop={10}
              >
                <X size={20} strokeWidth={2} color={colors.tintaSuave} />
              </Pressable>
            ) : (
              <Search size={20} strokeWidth={2} color={colors.tintaSuave} />
            )
          }
        />
        {esNumero ? (
          <Button
            title={`Ver taller #${numero}`}
            variant="secondary"
            icon={Search}
            onPress={() => void buscarPorNumero()}
            loading={buscando}
            accessibilityLabel={`Buscar el taller número ${numero}`}
          />
        ) : null}
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
      <View style={styles.sectionRow}>
        <Text variant="h3">{filtrando ? 'Resultados' : 'Todos los talleres'}</Text>
        {listaLista ? (
          <Text variant="small">
            {filtrando ? `${filtrados.length} de ${todos.length}` : `${todos.length}`}
          </Text>
        ) : null}
      </View>
    </View>
  );

  let empty: React.ReactElement | undefined;
  if (isLoading) empty = <StateView kind="loading" skeletonCount={4} />;
  else if (isError) empty = <ErrorState error={error} onRetry={() => refetch()} />;
  else if (todos.length === 0)
    empty = <StateView kind="empty" message="Todavía no hay talleres disponibles. Vuelve más tarde." />;
  else if (filtrados.length === 0)
    empty = (
      <StateView
        kind="empty"
        icon={SearchX}
        title="Sin coincidencias"
        message={`No encontramos talleres con “${consulta}”. Prueba con otra palabra o con el número.`}
        actionLabel="Borrar búsqueda"
        onAction={() => cambiarTexto('')}
      />
    );

  return (
    <FlatList<Taller>
      data={isLoading || isError ? [] : filtrados}
      keyExtractor={(t) => String(t.id)}
      style={styles.list}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top + space[4],
        paddingHorizontal: layout.gutter,
        paddingBottom: space[6],
      }}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={Separador}
      renderItem={({ item, index }) => (
        <Animated.View entering={entrada(index)}>
          <TallerCard
            taller={item}
            inscrito={inscritos.has(item.id)}
            onPress={() => router.push(`/taller/${item.id}`)}
          />
        </Animated.View>
      )}
      ListFooterComponent={<Footer />}
      refreshControl={refreshControl(isRefetching && !isLoading, () => {
        refetch();
        if (alumno.noControl) inscripciones.refetch();
      })}
    />
  );
}

function Separador() {
  return <View style={{ height: layout.cardGap }} />;
}

function TallerCard({ taller, inscrito, onPress }: { taller: Taller; inscrito: boolean; onPress: () => void }) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`Taller ${taller.id}, ${taller.nombre}, ${taller.horario}.${inscrito ? ' Ya estás inscrito.' : ''}`}
    >
      <View style={styles.row}>
        <View style={{ flex: 1, gap: space[2] }}>
          <View style={styles.chips}>
            <Chip label={`#${taller.id}`} tone="sol" />
            {inscrito ? <Chip label="Inscrito" tone="hoja" icon={Check} /> : null}
          </View>
          <Text variant="h3">{taller.nombre}</Text>
          <View style={styles.horario}>
            <Clock size={20} strokeWidth={2} color={colors.tinta} />
            <Text style={{ flex: 1 }}>{taller.horario}</Text>
          </View>
        </View>
        <ChevronRight size={24} strokeWidth={2} color={colors.tintaSuave} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.marfil },
  header: { marginBottom: space[1] },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: space[5],
    marginBottom: space[3],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  chips: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  horario: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
