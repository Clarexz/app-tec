import { StyleSheet, View } from 'react-native';
import { RefreshCw, Server } from 'lucide-react-native';
import { Button, Card, Chip, Footer, Screen, Skeleton, StatusDot, Text } from '@/components';
import { useSalud } from '@/hooks';
import type { SaludResultado } from '@/api';
import { config } from '@/config';
import { colors, fonts, space } from '@/theme';
import type { Servicio } from '@/types/api';

const SERVICIOS: Servicio[] = ['avisos', 'talleres', 'inscripciones'];

const NOMBRES: Record<Servicio, string> = {
  avisos: 'Avisos',
  talleres: 'Talleres',
  inscripciones: 'Inscripciones',
};

const dos = (n: number) => String(n).padStart(2, '0');
function hora(ts: number): string {
  const d = new Date(ts);
  return `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;
}

export default function EstadoScreen() {
  // No depende de la sesión: se abre también desde el inicio de sesión.
  const { data, isFetching, isPending, refetch, dataUpdatedAt } = useSalud();
  const revisar = () => void refetch();

  const enLinea = data?.filter((s) => s.ok).length ?? 0;
  const resumen = isPending
    ? 'Revisando servicios…'
    : enLinea === SERVICIOS.length
      ? 'Todo en línea'
      : enLinea === 0
        ? 'Ningún servicio responde'
        : `${enLinea} de ${SERVICIOS.length} en línea`;

  return (
    <Screen scroll refreshing={isFetching && !isPending} onRefresh={revisar}>
      <View style={styles.page}>
        <Card variant="secondary">
          <View style={styles.hostRow}>
            <Server size={22} strokeWidth={2} color={colors.tinta} />
            <View style={styles.flex}>
              <Text variant="kicker">Servidor</Text>
              <Text variant="bodyStrong" selectable>{config.host}</Text>
            </View>
          </View>
          <View style={styles.resumenRow} accessibilityLiveRegion="polite">
            <StatusDot ok={isPending ? null : enLinea === SERVICIOS.length} />
            <Text variant="bodyStrong" style={styles.flex}>{resumen}</Text>
          </View>
          <Text variant="small" style={{ marginTop: space[1] }}>
            {dataUpdatedAt > 0 ? `Última revisión: ${hora(dataUpdatedAt)}` : 'Aún sin revisar'}
          </Text>
        </Card>

        {data
          ? SERVICIOS.map((s) => {
              const r = data.find((x) => x.servicio === s);
              return r ? <ServicioCard key={s} r={r} revisando={isFetching} /> : null;
            })
          : SERVICIOS.map((s) => <ServicioCargando key={s} servicio={s} />)}

        <Button
          title="Volver a revisar"
          variant="secondary"
          icon={RefreshCw}
          onPress={revisar}
          loading={isFetching}
        />

        <Footer />
        <Text variant="small" center>
          CampusConectado v1.0 · Ravyn Studio · Equipo 1
        </Text>
      </View>
    </Screen>
  );
}

function ServicioCard({ r, revisando }: { r: SaludResultado; revisando: boolean }) {
  const nombre = NOMBRES[r.servicio];
  const estado = r.ok ? 'En línea' : 'Sin respuesta';
  return (
    <Card>
      <View
        accessible
        accessibilityLabel={`${nombre}, puerto ${config.ports[r.servicio]}, ${estado}, ${r.ms} milisegundos`}
      >
        <View style={styles.tituloRow}>
          <Text variant="h3" style={styles.flex}>{nombre}</Text>
          <Chip label={`:${config.ports[r.servicio]}`} tone="hueso" />
        </View>
        <Text variant="small" selectable numberOfLines={1} style={{ marginTop: space[1] }}>
          {r.url}
        </Text>
        <View style={styles.estadoRow}>
          <StatusDot ok={revisando ? null : r.ok} />
          <Text variant="bodyStrong" style={styles.flex} color={r.ok ? colors.tinta : colors.error}>
            {estado}
          </Text>
          <Text style={styles.ms}>{`${r.ms} ms`}</Text>
        </View>
        {!r.ok && r.error ? (
          <Text variant="small" style={{ marginTop: space[1] }}>{r.error}</Text>
        ) : null}
      </View>
    </Card>
  );
}

function ServicioCargando({ servicio }: { servicio: Servicio }) {
  return (
    <Card>
      <View style={styles.tituloRow}>
        <Text variant="h3" style={styles.flex}>{NOMBRES[servicio]}</Text>
        <Chip label={`:${config.ports[servicio]}`} tone="hueso" />
      </View>
      <Text variant="small" numberOfLines={1} style={{ marginTop: space[1] }}>
        {config.urls[servicio]}
      </Text>
      <View style={styles.estadoRow}>
        <StatusDot ok={null} />
        <Skeleton height={16} width="40%" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { gap: space[3], paddingTop: space[2], paddingBottom: space[6] },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  resumenRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[3] },
  tituloRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  estadoRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[3] },
  ms: { fontFamily: fonts.sansBold, fontSize: 14, lineHeight: 20, color: colors.tinta },
});
