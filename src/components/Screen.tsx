import React, { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '@/theme';

export function refreshControl(refreshing: boolean, onRefresh: () => void) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[colors.rosa]}
      tintColor={colors.rosa}
    />
  );
}

export interface ScreenProps {
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Screen({ scroll, refreshing = false, onRefresh, padded = true, header, footer, children }: ScreenProps) {
  const pad = padded ? styles.padded : null;
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header ? <View style={padded ? styles.headerPad : null}>{header}</View> : null}
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[pad, styles.scrollBottom]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={onRefresh ? refreshControl(refreshing, onRefresh) : undefined}
          >
            {children}
            {footer}
          </ScrollView>
        ) : (
          <View style={[styles.flex, pad]}>
            {children}
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.marfil },
  flex: { flex: 1 },
  padded: { paddingHorizontal: layout.gutter, paddingTop: 8 },
  headerPad: { paddingHorizontal: layout.gutter, paddingTop: 8 },
  scrollBottom: { paddingBottom: 32 },
});
