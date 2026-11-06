import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CloudAlert, Inbox, TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react-native';
import { colors, layout, radius, space } from '@/theme';
import { mensajeDeError } from '@/api/errors';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Text } from './Text';

export interface StateViewProps {
  kind: 'loading' | 'empty' | 'error';
  title?: string;
  message?: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  skeletonCount?: number;
}

export function StateView({
  kind, title, message, detail, actionLabel, onAction, icon, skeletonCount = 3,
}: StateViewProps) {
  if (kind === 'loading') {
    return (
      <View style={styles.skeletons} accessibilityLabel="Cargando" accessibilityLiveRegion="polite">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} height={96} radius={radius.lg} />
        ))}
      </View>
    );
  }
  const Icon = icon ?? (kind === 'error' ? WifiOff : Inbox);
  return (
    <View style={styles.center}>
      <View style={styles.bubble}>
        <Icon size={28} strokeWidth={2} color={kind === 'error' ? colors.error : colors.tinta} />
      </View>
      {title ? <Text variant="h3" center>{title}</Text> : null}
      {message ? <Text center color={colors.tintaSuave}>{message}</Text> : null}
      {detail ? <Text variant="small" center>{detail}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  actionLabel?: string;
}

export function ErrorState({ error, onRetry, actionLabel = 'Reintentar' }: ErrorStateProps) {
  const m = mensajeDeError(error);
  const status = (error as { status?: number } | null)?.status;
  const icon = status === 0 ? WifiOff : typeof CloudAlert !== 'undefined' ? CloudAlert : TriangleAlert;
  return (
    <StateView
      kind="error"
      icon={icon}
      title={m.titulo}
      message={m.texto}
      detail={m.detalle}
      actionLabel={onRetry ? actionLabel : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  skeletons: { gap: layout.cardGap },
  center: { alignItems: 'center', justifyContent: 'center', gap: space[3], paddingVertical: space[6], paddingHorizontal: space[4] },
  bubble: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.hueso, alignItems: 'center', justifyContent: 'center' },
  action: { marginTop: space[2], alignSelf: 'center' },
});
