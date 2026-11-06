import { Switch, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { Button, Card, Chip, Footer, Screen, StatusDot, Text } from '@/components';
import { useSalud } from '@/hooks';
import { config } from '@/config';
import { queryClient } from '@/api/queryClient';
import { useMockFlags, type MockFlags } from '@/api/mock/flags';
import { colors, space } from '@/theme';

const SIMULACIONES: { k: keyof MockFlags; label: string }[] = [
  { k: 'fail503', label: 'Talleres no responde (503) al inscribirte' },
  { k: 'offline', label: 'Sin red' },
  { k: 'slow', label: 'Latencia alta, 3 s' },
];

const NOMBRES: Record<string, string> = {
  avisos: 'Avisos',
  talleres: 'Talleres',
  inscripciones: 'Inscripciones',
};

export default function EstadoScreen() {
  const { data, isFetching, refetch } = useSalud();
  const [flags, setFlag] = useMockFlags();

  const hayMock = config.useMocks || config.mockServices.length > 0;
  const todoMock = config.useMocks;
  const enPrueba = config.mockServices.map((s) => NOMBRES[s] ?? s).join(', ');

  function cambiar(k: keyof MockFlags, v: boolean) {
    setFlag(k, v);
    if (k === 'offline') queryClient.invalidateQueries();
  }

  return (
    <Screen
      scroll
      refreshing={isFetching}
      onRefresh={() => {
        refetch();
      }}
      footer={undefined}
    >
      <View style={{ gap: space[3], paddingTop: space[2], paddingBottom: space[6] }}>
        <Card variant="secondary">
          <Text variant="kicker">Configuración</Text>
          <Text style={{ marginTop: space[2] }}>
            <Text variant="bodyStrong">Host: </Text>
            {config.host}
          </Text>
          <Text>
            <Text variant="bodyStrong">Modo: </Text>
            {config.useMocks ? 'Datos de prueba' : 'Servidor real'}
          </Text>
          {!todoMock && config.mockServices.length > 0 ? (
            <Text>
              <Text variant="bodyStrong">En prueba: </Text>
              {enPrueba.toLowerCase()}
            </Text>
          ) : null}
        </Card>

        {(data ?? []).map((s) => (
          <Card key={s.servicio}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="h3">{NOMBRES[s.servicio] ?? s.servicio}</Text>
              <Text variant="small">{`:${config.ports[s.servicio]}`}</Text>
            </View>
            <Text variant="small" style={{ marginTop: space[1] }}>
              {s.url}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[3] }}>
              <StatusDot ok={s.ok} />
              <Text variant="bodyStrong" style={{ flex: 1 }}>
                {s.ok ? 'En línea' : 'Sin respuesta'}
              </Text>
              <Text variant="small">{`${s.ms} ms`}</Text>
            </View>
            {s.mock ? (
              <View style={{ flexDirection: 'row', marginTop: space[3] }}>
                <Chip label="Datos de prueba" tone="hueso" />
              </View>
            ) : null}
          </Card>
        ))}
        {!data ? <StatusRow /> : null}

        <Button
          title="Volver a revisar"
          variant="secondary"
          icon={RefreshCw}
          onPress={() => {
            refetch();
          }}
          loading={isFetching}
        />

        {hayMock ? (
          <Card variant="secondary" style={{ marginTop: space[3] }}>
            <Text variant="h3">Simulación</Text>
            {SIMULACIONES.map(({ k, label }) => (
              <View
                key={k}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], marginTop: space[3] }}
              >
                <Text style={{ flex: 1 }}>{label}</Text>
                <Switch
                  value={flags[k]}
                  onValueChange={(v) => cambiar(k, v)}
                  trackColor={{ false: colors.borde, true: colors.rosa }}
                  thumbColor={colors.blanco}
                  accessibilityLabel={label}
                />
              </View>
            ))}
            <Text variant="small" style={{ marginTop: space[3] }}>
              Solo afecta a los servicios con datos de prueba.
            </Text>
          </Card>
        ) : null}

        <Footer />
        <Text variant="small" center>
          CampusConectado v1.0 · Ravyn Studio · Equipo 1
        </Text>
      </View>
    </Screen>
  );
}

function StatusRow() {
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <StatusDot ok={null} />
        <Text>Revisando servicios…</Text>
      </View>
    </Card>
  );
}
