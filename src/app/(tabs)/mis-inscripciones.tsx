import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Clock, ClipboardList } from 'lucide-react-native';
import { Card, Chip, ErrorState, Screen, Skeleton, StateView, Text } from '@/components';
import { useInscripciones, useTalleres } from '@/hooks';
import { useAlumno } from '@/auth';
import { colors, fonts, space } from '@/theme';
import type { Taller } from '@/types/api';

export default function MisInscripcionesScreen() {
  const { noControl } = useAlumno();
  const q = useInscripciones(noControl);
  // Se pide la lista de talleres para mostrar nombre y horario de cada inscripción.
  const talleres = useTalleres();
  const [refrescando, setRefrescando] = useState(false);

  const porId = useMemo(() => {
    const m = new Map<number, Taller>();
    for (const t of talleres.data ?? []) m.set(t.id, t);
    return m;
  }, [talleres.data]);

  // Las más recientes primero.
  const lista = useMemo(() => [...(q.data ?? [])].sort((a, b) => b.id - a.id), [q.data]);
  const total = lista.length;

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    try {
      await Promise.all([q.refetch(), talleres.refetch()]);
    } finally {
      setRefrescando(false);
    }
  }, [q, talleres]);

  let cuerpo;
  if (q.isPending) {
    cuerpo = <StateView kind="loading" skeletonCount={3} />;
  } else if (q.isError && !q.data) {
    cuerpo = <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  } else if (total === 0) {
    cuerpo = (
      <StateView
        kind="empty"
        icon={ClipboardList}
        title="Todavía nada por aquí"
        message="Aún no tienes inscripciones. ¿Buscamos un taller?"
        actionLabel="Ver talleres"
        onAction={() => router.navigate('/talleres')}
      />
    );
  } else {
    cuerpo = (
      <View style={styles.lista}>
        {lista.map((i) => {
          const t = porId.get(i.taller_id);
          const nombre = t?.nombre ?? `Taller #${i.taller_id}`;
          return (
            <Card
              key={i.id}
              onPress={() => router.push({ pathname: '/taller/[id]', params: { id: String(i.taller_id) } })}
              accessibilityLabel={`${nombre}${t ? `, ${t.horario}` : ''}. Folio ${i.id}. Ver taller`}
            >
              <View style={styles.fila}>
                <View style={styles.cuerpo}>
                  <View style={styles.chips}>
                    <Chip label={`#${i.taller_id}`} />
                    <Text variant="small">{`Folio #${i.id}`}</Text>
                  </View>
                  <Text variant="h3">{nombre}</Text>
                  {t ? (
                    <View style={styles.horario}>
                      <Clock size={18} color={colors.tinta} strokeWidth={2} />
                      <Text variant="small" style={styles.flex}>{t.horario}</Text>
                    </View>
                  ) : talleres.isPending ? (
                    <Skeleton height={14} width="55%" />
                  ) : null}
                </View>
                <ChevronRight size={22} color={colors.tinta} strokeWidth={2} />
              </View>
            </Card>
          );
        })}
      </View>
    );
  }

  return (
    <Screen scroll refreshing={refrescando} onRefresh={() => void refrescar()}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="kicker">Tus talleres</Text>
            <Text variant="display" accessibilityRole="header">Mis inscripciones</Text>
            <Text variant="small">{`No. de control ${noControl}`}</Text>
          </View>
          {q.isSuccess && total > 0 ? (
            <View
              style={styles.contador}
              accessible
              accessibilityLabel={`${total} ${total === 1 ? 'inscripción' : 'inscripciones'}`}
            >
              <Text style={styles.contadorNum}>{total}</Text>
              <Text variant="small" color={colors.tinta}>{total === 1 ? 'taller' : 'talleres'}</Text>
            </View>
          ) : null}
        </View>
        {cuerpo}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { paddingTop: space[5], gap: space[4] },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: space[3] },
  headerText: { flex: 1, gap: space[1] },
  contador: {
    minWidth: 64, paddingHorizontal: space[3], paddingVertical: space[2], borderRadius: 18,
    backgroundColor: colors.sol, alignItems: 'center',
  },
  contadorNum: { fontFamily: fonts.displayExtraBold, fontSize: 24, lineHeight: 28, color: colors.tinta },
  lista: { gap: space[3] },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  cuerpo: { flex: 1, gap: space[2] },
  chips: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  horario: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
