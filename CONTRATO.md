# Contrato interno entre módulos (para trabajo en paralelo)

Rutas en `src/app/` (Expo Router). Alias `@/*` → `src/*`. TypeScript estricto. Español de México, de tú.
Ya existen (no modificar sin avisar): `src/types/api.ts`, `src/theme/*` (`colors`, `space`, `radius`, `shadow`, `layout`, `fonts`, `text`, `TextVariant`), importables desde `@/theme`.

## A. Capa de datos (`src/config.ts`, `src/api/*`, `src/hooks/*`, `src/storage/*`)

```ts
// src/config.ts — siempre servicios reales
export const config: {
  host: string;                            // EXPO_PUBLIC_API_HOST ?? 'http://2.24.29.189'
  ports: Record<Servicio, number>;         // EXPO_PUBLIC_PORT_* o 30001/30002/30003
  urls: Record<Servicio, string>;          // `${host}:${port}`
  timeoutMs: number;                       // 8000
};

// src/api/errors.ts
export class ApiError extends Error { status: number; serverMessage?: string; body?: unknown; context?: 'taller' | 'inscripcion' }
// status 0 = red/timeout
export interface MensajeUsuario { titulo: string; texto: string; detalle?: string } // detalle = error/mensaje del servidor
export function mensajeDeError(err: unknown): MensajeUsuario; // tabla §2.3 de la especificación
export function mensajeExito(taller: { nombre: string; horario: string } | undefined, tallerId: number): MensajeUsuario;

// src/api/services.ts
export interface SaludResultado { servicio: Servicio; ok: boolean; ms: number; url: string; error?: string }
export interface CampusApi {
  salud(s: Servicio): Promise<SaludResultado>;   // nunca lanza
  avisos(): Promise<Aviso[]>;
  talleres(): Promise<Taller[]>;
  taller(id: number): Promise<Taller>;           // 404 → ApiError(404)
  inscribir(n: NuevaInscripcion): Promise<Inscripcion>; // 400/404/409/503/0
  inscripciones(matricula: string): Promise<Inscripcion[]>;
}

// src/api/index.ts
export const api: CampusApi;    // servicios reales (src/api/real.ts)
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

// src/auth (sesión del alumno)
export interface Sesion { noControl: string; nombre: string }   // noControl se manda como `matricula`
export function SesionProvider(props: { children: ReactNode }): JSX.Element;
export function useSesion(): { sesion: Sesion | null; cargando: boolean;
  iniciarSesion(noControl: string, clave: string): Promise<ResultadoLogin>;  // nunca lanza
  guardarNombre(nombre: string): Promise<void>; cerrarSesion(): Promise<void> };
export function useAlumno(): Sesion;     // en pantallas protegidas
// src/auth/cuentas.ts: verificarCredenciales(noControl, clave) — TEMPORAL local; reemplazar por el servicio de login
```

## B. Componentes (`src/components/`, exportados desde `src/components/index.ts`)

```tsx
<Screen scroll? refreshing? onRefresh? padded?=true header?: ReactNode footer?: ReactNode>  // SafeArea (top) + fondo marfil, gutter 20
<Text variant?: TextVariant ='body' color? center? style? numberOfLines?>
<Button title variant?: 'primary'|'secondary'|'ghost' ='primary' onPress loading? disabled? icon?: LucideIcon iconRight?: LucideIcon arrow?: boolean haptic?: boolean accessibilityLabel? style?>
<Card variant?: 'default'|'secondary'|'highlight' onPress? style? children>   // blanco / hueso / rosa
<Chip label tone?: 'sol'|'hueso'|'rosa'|'hoja' size?: 'md'|'lg' icon? accessibilityLabel?>  // "#1"
<TextField label value onChangeText error? hint? keyboardType? autoCapitalize? placeholder? returnKeyType? onSubmitEditing? right?: ReactNode inputRef?>
<TallerPicker value?: number onChange(id: number) talleres: Taller[] loading? disabledIds?: number[] disabledLabel? label?>  // bottom sheet con búsqueda
<NombreGate/>                        // pide el nombre si la sesión no lo tiene (montado en (tabs)/_layout)
<StateView kind: 'loading'|'empty'|'error' title? message? detail? actionLabel? onAction? icon?: LucideIcon skeletonCount?>
  // y helper: <ErrorState error={unknown} onRetry/>  que usa mensajeDeError
<Banner tone: 'error'|'success'|'info' title message? detail? onClose?>
<StatusDot ok: boolean | null>       // null = cargando (gris)
<Footer/>                            // "Hecho por Ravyn Studio"
<Skeleton height? width? radius?>
```

## C. Pantallas (`src/app/`)
- `_layout.tsx`: fuentes, splash, QueryClientProvider, `SesionProvider`. `Stack.Protected`: sin sesión → `login`; con sesión → `(tabs)`, `taller/[id]`, `perfil` (modal "Mi cuenta"). `estado` siempre accesible.
- `login.tsx`: No. de control (8 dígitos) + contraseña (4 letras de la CURP). Long-press en el logo → `/estado`.
- `(tabs)/_layout.tsx`: Avisos · Talleres · Inscribirme · Mis inscripciones, + `<NombreGate/>`.
- `(tabs)/index.tsx` Avisos (avatar → `/perfil`, long-press en la marca → `/estado`) · `(tabs)/talleres.tsx` (búsqueda por número o nombre, insignia "Inscrito") · `(tabs)/inscribirme.tsx` (param `?taller=ID`, usa la sesión) · `(tabs)/mis-inscripciones.tsx` (carga automática con la sesión) · `taller/[id].tsx` · `perfil.tsx` · `estado.tsx`.
- Desde el detalle: `router.navigate({ pathname: '/inscribirme', params: { taller: String(id) } })`.
