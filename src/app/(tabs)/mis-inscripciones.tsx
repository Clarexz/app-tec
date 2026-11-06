import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Clock, Search } from 'lucide-react-native';
import { Button, Card, Chip, ErrorState, Screen, StateView, Text, TextField } from '@/components';
import { useInscripciones, usePerfil, useTalleres, useTallerNombre } from '@/hooks';
import { colors, space } from '@/theme';

export default function MisInscripcionesScreen() {
  const { matricula: param } = useLocalSearchParams<{ matricula?: string }>();
  const { perfil, cargado } = usePerfil();
  useTalleres();
  const nombreDeTaller = useTallerNombre();

  const [input, setInput] = useState('');
  const [consultada, setConsultada] = useState('');
  const prefilled = useRef(false);

  useEffect(() => {
    if (!cargado || prefilled.current || param) return;
    prefilled.current = true;
    if (perfil?.matricula) {
      setInput((i) => (i ? i : perfil.matricula));
      setConsultada((c) => (c ? c : perfil.matricula));
    }
  }, [cargado, perfil, param]);

  useEffect(() => {
    if (!param) return;
    prefilled.current = true;
    const m = param.trim().toUpperCase();
    setInput(m);
    setConsultada(m);
  }, [param]);

  const q = useInscripciones(consultada || undefined);

  const consultar = () => setConsultada(input.trim().toUpperCase());

  let cuerpo;
  if (!consultada) {
    cuerpo = (
      <StateView
        kind="empty"
        icon={Search}
        title="Consulta tus talleres"
        message="Escribe tu matrícula y toca Consultar."
      />
    );
  } else if (q.isLoading) {
    cuerpo = <StateView kind="loading" />;
  } else if (q.isError) {
    cuerpo = <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  } else if (!q.data || q.data.length === 0) {
    cuerpo = (
      <StateView
        kind="empty"
        title="Aún no tienes inscripciones"
        message="Aún no tienes inscripciones con esta matrícula. ¿Buscamos un taller?"
        actionLabel="Ver talleres"
        onAction={() => router.navigate('/talleres')}
      />
    );
  } else {
    const n = q.data.length;
    cuerpo = (
      <View style={{ gap: space[3] }}>
        <Text variant="small">{`${n} ${n === 1 ? 'inscripción' : 'inscripciones'} para ${consultada}`}</Text>
        {q.data.map((i) => {
          const t = nombreDeTaller(i.taller_id);
          return (
            <Card key={i.id}>
              <View style={{ gap: space[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                  <Chip label={`#${i.taller_id}`} />
                </View>
                <Text variant="h3">{t?.nombre ?? `Taller #${i.taller_id}`}</Text>
                {t ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                    <Clock size={18} color={colors.tinta} strokeWidth={2} />
                    <Text variant="small">{t.horario}</Text>
                  </View>
                ) : null}
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="small">{`Folio #${i.id}`}</Text>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    );
  }

  return (
    <Screen scroll refreshing={q.isRefetching} onRefresh={() => void q.refetch()}>
      <View style={{ paddingTop: space[5], gap: space[4] }}>
        <View style={{ gap: space[2] }}>
          <Text variant="kicker">TUS TALLERES</Text>
          <Text variant="display">Mis inscripciones</Text>
        </View>
        <TextField
          label="Matrícula"
          placeholder="Ej. A001"
          value={input}
          onChangeText={setInput}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={consultar}
        />
        <Button title="Consultar" variant="secondary" icon={Search} onPress={consultar} />
        {cuerpo}
      </View>
    </Screen>
  );
}
