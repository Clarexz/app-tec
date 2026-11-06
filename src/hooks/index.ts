import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { api } from '@/api';
import type { SaludResultado } from '@/api';
import { ApiError } from '@/api/errors';
import type { Aviso, Inscripcion, NuevaInscripcion, Servicio, Taller } from '@/types/api';

export const qk = {
  avisos: ['avisos'] as ['avisos'],
  talleres: ['talleres'] as ['talleres'],
  taller: (id: number) => ['taller', id] as ['taller', number],
  inscripciones: (m: string) => ['inscripciones', m] as ['inscripciones', string],
  salud: ['salud'] as ['salud'],
};

const normMatricula = (m: string) => m.trim().toUpperCase();

export function useAvisos(): UseQueryResult<Aviso[], ApiError> {
  return useQuery<Aviso[], ApiError>({ queryKey: qk.avisos, queryFn: () => api.avisos() });
}

export function useTalleres(): UseQueryResult<Taller[], ApiError> {
  return useQuery<Taller[], ApiError>({ queryKey: qk.talleres, queryFn: () => api.talleres(), staleTime: 30_000 });
}

export function useTaller(id: number | undefined): UseQueryResult<Taller, ApiError> {
  return useQuery<Taller, ApiError>({
    queryKey: qk.taller(id ?? -1),
    queryFn: () => api.taller(id as number),
    enabled: typeof id === 'number' && Number.isFinite(id),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 1,
  });
}

export function useInscripciones(matricula: string | undefined): UseQueryResult<Inscripcion[], ApiError> {
  const m = normMatricula(matricula ?? '');
  return useQuery<Inscripcion[], ApiError>({
    queryKey: qk.inscripciones(m),
    queryFn: () => api.inscripciones(m),
    enabled: m.length > 0,
  });
}

export function useInscribir(): UseMutationResult<Inscripcion, ApiError, NuevaInscripcion> {
  const qc = useQueryClient();
  return useMutation<Inscripcion, ApiError, NuevaInscripcion>({
    mutationFn: (n) => api.inscribir({ ...n, matricula: normMatricula(n.matricula), nombre: n.nombre.trim() }),
    onSuccess: (_d, n) => {
      qc.invalidateQueries({ queryKey: qk.inscripciones(normMatricula(n.matricula)) });
    },
  });
}

const SERVICIOS: Servicio[] = ['avisos', 'talleres', 'inscripciones'];

export function useSalud(): UseQueryResult<SaludResultado[], never> {
  return useQuery<SaludResultado[], never>({
    queryKey: qk.salud,
    queryFn: () => Promise.all(SERVICIOS.map((s) => api.salud(s))),
    staleTime: 0,
  });
}

/** Busca un taller en la caché de la lista de talleres. */
export function useTallerNombre(): (id: number) => Taller | undefined {
  const qc = useQueryClient();
  return (id) => qc.getQueryData<Taller[]>(qk.talleres)?.find((t) => t.id === id);
}
