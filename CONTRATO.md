# Contrato interno entre módulos (para trabajo en paralelo)

Rutas en `src/app/` (Expo Router). Alias `@/*` → `src/*`. TypeScript estricto. Español de México, de tú.
Ya existen (no modificar sin avisar): `src/types/api.ts`, `src/theme/*` (`colors`, `space`, `radius`, `shadow`, `layout`, `fonts`, `text`, `TextVariant`), importables desde `@/theme`.

## A. Capa de datos (`src/config.ts`, `src/api/*`, `src/hooks/*`, `src/storage/*`)

```ts
// src/config.ts
export const config: {
  useMocks: boolean;                       // EXPO_PUBLIC_USE_MOCKS !== 'false'
  host: string;                            // EXPO_PUBLIC_API_HOST ?? 'http://2.24.29.189'
  ports: Record<Servicio, number>;
  urls: Record<Servicio, string>;          // `${host}:${port}`
  mockServices: Servicio[];                // si useMocks=true → los 3; si no, EXPO_PUBLIC_MOCK_SERVICES (coma)
  timeoutMs: number;                       // 8000
};
export function isMocked(s: Servicio): boolean;

// src/api/errors.ts
export class ApiError extends Error { status: number; serverMessage?: string; body?: unknown; context?: 'taller' | 'inscripcion' }
// status 0 = red/timeout
export interface MensajeUsuario { titulo: string; texto: string; detalle?: string } // detalle = error/mensaje del servidor
export function mensajeDeError(err: unknown): MensajeUsuario; // tabla §2.3 de la especificación
export function mensajeExito(taller: { nombre: string; horario: string } | undefined, tallerId: number): MensajeUsuario;

// src/api/services.ts
export interface SaludResultado { servicio: Servicio; ok: boolean; ms: number; url: string; mock: boolean; error?: string }
export interface CampusApi {
  salud(s: Servicio): Promise<SaludResultado>;   // nunca lanza
  avisos(): Promise<Aviso[]>;
  talleres(): Promise<Taller[]>;
  taller(id: number): Promise<Taller>;           // 404 → ApiError(404)
  inscribir(n: NuevaInscripcion): Promise<Inscripcion>; // 400/404/409/503/0
  inscripciones(matricula: string): Promise<Inscripcion[]>;
}

// src/api/mock/flags.ts — flags de simulación (solo afectan servicios mock)
export type MockFlags = { fail503: boolean; offline: boolean; slow: boolean };
export function getMockFlags(): MockFlags;
export function setMockFlag(k: keyof MockFlags, v: boolean): void;
export function useMockFlags(): [MockFlags, (k: keyof MockFlags, v: boolean) => void]; // hook reactivo

// src/api/index.ts
export const api: CampusApi;    // compone por servicio: mock o real según isMocked()
export { ApiError, mensajeDeError, mensajeExito } from './errors';

// src/hooks/index.ts  (React Query; QueryClient se crea en src/api/queryClient.ts: export const queryClient)
export const qk: { avisos: ['avisos']; talleres: ['talleres']; taller: (id:number)=>['taller',number]; inscripciones: (m:string)=>['inscripciones',string]; salud: ['salud'] };
export function useAvisos(): UseQueryResult<Aviso[], ApiError>;
export function useTalleres(): UseQueryResult<Taller[], ApiError>;          // staleTime 30 s
export function useTaller(id: number | undefined): UseQueryResult<Taller, ApiError>; // enabled si id es número; no reintenta 404
export function useInscripciones(matricula: string | undefined): UseQueryResult<Inscripcion[], ApiError>; // enabled si matricula no vacía
export function useInscribir(): UseMutationResult<Inscripcion, ApiError, NuevaInscripcion>; // invalida inscripciones(matricula) al éxito
export function useSalud(): UseQueryResult<SaludResultado[], never>;  // los 3 en paralelo
export function useTallerNombre(): (id: number) => Taller | undefined;  // busca en caché de talleres

// src/storage/perfil.ts
export interface Perfil { matricula: string; nombre: string }
export function leerPerfil(): Promise<Perfil | null>;
export function guardarPerfil(p: Perfil): Promise<void>;
export function usePerfil(): { perfil: Perfil | null; cargado: boolean; guardar: (p: Perfil) => Promise<void> };
```

## B. Componentes (`src/components/`, exportados desde `src/components/index.ts`)

```tsx
<Screen scroll? refreshing? onRefresh? padded?=true header?: ReactNode footer?: ReactNode>  // SafeArea (top) + fondo marfil, gutter 20
<Text variant?: TextVariant ='body' color? center? style? numberOfLines?>
<Button title variant?: 'primary'|'secondary'|'ghost' ='primary' onPress loading? disabled? icon?: LucideIcon iconRight?: LucideIcon arrow?: boolean haptic?: boolean accessibilityLabel? style?>
<Card variant?: 'default'|'secondary'|'highlight' onPress? style? children>   // blanco / hueso / rosa
<Chip label tone?: 'sol'|'hueso'|'rosa' size?: 'md'|'lg'>                   // "#1"
<TextField label value onChangeText error? hint? keyboardType? autoCapitalize? placeholder? returnKeyType? onSubmitEditing? right?: ReactNode inputRef?>
<TallerPicker value?: number onChange(id: number) talleres: Taller[] loading?>  // abre Modal tipo bottom sheet con la lista
<StateView kind: 'loading'|'empty'|'error' title? message? detail? actionLabel? onAction? icon?: LucideIcon skeletonCount?>
  // y helper: <ErrorState error={unknown} onRetry/>  que usa mensajeDeError
<Banner tone: 'error'|'success'|'info' title message? detail? onClose?>
<StatusDot ok: boolean | null>       // null = cargando (gris)
<Footer/>                            // "Hecho por Ravyn Studio"
<Skeleton height? width? radius?>
```

## C. Pantallas (`src/app/`)
- `_layout.tsx`: carga fuentes (`@expo-google-fonts/*`, nombres de `fonts`), SplashScreen.preventAutoHideAsync, QueryClientProvider, SafeAreaProvider, GestureHandlerRootView, `Stack` sin header para `(tabs)`; `taller/[id]` y `estado` con header propio (fondo marfil, sin sombra, título Funnel Display).
- `(tabs)/_layout.tsx`: Tabs Avisos(`Bell`) · Talleres(`BookOpen`) · Inscribirme(`CirclePlus`) · Mis inscripciones(`ClipboardList`). Activo Rosa, inactivo tintaSuave, fondo blanco, label Funnel Sans 500 12.
- `(tabs)/index.tsx` Avisos · `(tabs)/talleres.tsx` · `(tabs)/inscribirme.tsx` (param `?taller=ID`) · `(tabs)/mis-inscripciones.tsx` · `taller/[id].tsx` · `estado.tsx`.
- Desde el detalle: `router.navigate({ pathname: '/inscribirme', params: { taller: String(id) } })`.
- Estado del servidor: long-press en el logo/título de Avisos + ícono `Activity` en el header de Avisos → `router.push('/estado')`.
