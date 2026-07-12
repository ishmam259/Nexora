import React, { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  
  // Default URL changes based on platform for ease of local testing
  const getDefaultUrl = () => {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8082/api/hello'; // Android Emulator loopback to host
    }
    return 'http://localhost:8082/api/hello'; // Web / iOS Simulator
  };

  const [backendUrl, setBackendUrl] = useState(getDefaultUrl());
  const [connectionState, setConnectionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiData, setApiData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pulse animation for status dot
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const testConnection = async () => {
    setConnectionState('loading');
    setErrorMsg(null);
    setApiData(null);

    try {
      // Timeout request after 5 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setApiData(data);
      setConnectionState('success');
    } catch (err: any) {
      setConnectionState('error');
      if (err.name === 'AbortError') {
        setErrorMsg('Connection timed out. Check if the Spring Boot server is running and accessible.');
      } else {
        setErrorMsg(err.message || 'Failed to connect to backend.');
      }
    }
  };

  // Determine status color and label
  const getStatusDetails = () => {
    switch (connectionState) {
      case 'success':
        return { color: '#10B981', label: 'Connected', bg: '#D1FAE5', darkBg: '#064E3B' };
      case 'error':
        return { color: '#EF4444', label: 'Disconnected', bg: '#FEE2E2', darkBg: '#7F1D1D' };
      case 'loading':
        return { color: '#F59E0B', label: 'Connecting...', bg: '#FEF3C7', darkBg: '#78350F' };
      default:
        return { color: '#6B7280', label: 'Not Tested', bg: '#F3F4F6', darkBg: '#374151' };
    }
  };

  const status = getStatusDetails();
  const isDark = theme.background === '#000000';
  const statusBg = isDark ? status.darkBg : status.bg;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              ⚡ Full-Stack Sync
            </ThemedText>
            <ThemedText style={{ color: theme.textSecondary, textAlign: 'center' }}>
              React Native Frontend & Spring Boot Backend
            </ThemedText>
          </View>

          {/* Connection Status Card */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.row}>
              <ThemedText style={styles.cardLabel}>Connection Status</ThemedText>
              <View style={[styles.badge, { backgroundColor: statusBg }]}>
                <Animated.View 
                  style={[
                    styles.statusDot, 
                    { 
                      backgroundColor: status.color,
                      opacity: connectionState === 'loading' ? pulseAnim : 1
                    }
                  ]} 
                />
                <ThemedText style={[styles.badgeText, { color: status.color }]}>
                  {status.label}
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Settings / Configuration Card */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardHeader}>Configuration</ThemedText>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Backend Endpoint URL
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.background 
                }
              ]}
              value={backendUrl}
              onChangeText={setBackendUrl}
              placeholder="http://localhost:8082/api/hello"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Quick URL Helpers */}
            <View style={styles.helperRow}>
              <TouchableOpacity 
                style={[styles.helperBtn, { backgroundColor: theme.backgroundSelected }]}
                onPress={() => setBackendUrl('http://localhost:8082/api/hello')}
              >
                <ThemedText type="code" style={styles.helperText}>Web / iOS (localhost)</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.helperBtn, { backgroundColor: theme.backgroundSelected }]}
                onPress={() => setBackendUrl('http://10.0.2.2:8082/api/hello')}
              >
                <ThemedText type="code" style={styles.helperText}>Android (10.0.2.2)</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: connectionState === 'loading' ? '#3B82F6' : '#2563EB' }
              ]}
              onPress={testConnection}
              disabled={connectionState === 'loading'}
            >
              {connectionState === 'loading' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Test API Connection</ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>

          {/* Response / Console Logs Card */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardHeader}>API Response</ThemedText>
            
            {connectionState === 'idle' && (
              <View style={styles.emptyState}>
                <ThemedText style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
                  Tap "Test API Connection" to fetch data from Spring Boot.
                </ThemedText>
              </View>
            )}

            {connectionState === 'loading' && (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color="#2563EB" />
                <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
                  Connecting to backend server...
                </ThemedText>
              </View>
            )}

            {connectionState === 'error' && (
              <View style={[styles.errorBox, { borderColor: '#FCA5A5', backgroundColor: isDark ? '#451A1A' : '#FEF2F2' }]}>
                <ThemedText style={[styles.errorTitle, { color: '#EF4444' }]}>Connection Failed</ThemedText>
                <ThemedText style={[styles.errorText, { color: '#EF4444' }]}>{errorMsg}</ThemedText>
              </View>
            )}

            {connectionState === 'success' && apiData && (
              <View style={styles.responseContainer}>
                <View style={styles.responseRow}>
                  <ThemedText style={styles.responseKey}>Status</ThemedText>
                  <ThemedText style={[styles.responseValue, { color: '#10B981', fontWeight: 'bold' }]}>
                    {apiData.status || 'OK'}
                  </ThemedText>
                </View>

                <View style={styles.responseRow}>
                  <ThemedText style={styles.responseKey}>Message</ThemedText>
                  <ThemedText style={styles.responseValue}>{apiData.message}</ThemedText>
                </View>

                <View style={styles.responseRow}>
                  <ThemedText style={styles.responseKey}>Timestamp</ThemedText>
                  <ThemedText style={styles.responseValue}>
                    {new Date(apiData.timestamp).toLocaleTimeString()}
                  </ThemedText>
                </View>

                <View style={styles.responseRow}>
                  <ThemedText style={styles.responseKey}>Frameworks</ThemedText>
                  <View style={styles.tagRow}>
                    {(apiData.frameworks || []).map((f: string, i: number) => (
                      <View key={i} style={[styles.tag, { backgroundColor: theme.backgroundSelected }]}>
                        <ThemedText type="code" style={styles.tagText}>{f}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.codeBlock}>
                  <ThemedText type="code" style={styles.codeBlockText}>
                    {JSON.stringify(apiData, null, 2)}
                  </ThemedText>
                </View>
              </View>
            )}
          </ThemedView>

          {/* Quick tips */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardHeader}>💡 Helpful Setup Tips</ThemedText>
            
            <View style={styles.tipItem}>
              <ThemedText type="smallBold">1. Run Backend Server</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Navigate to <ThemedText type="code">/backend</ThemedText> and execute <ThemedText type="code">./mvnw spring-boot:run</ThemedText>.
              </ThemedText>
            </View>

            <View style={styles.tipItem}>
              <ThemedText type="smallBold">2. Physical Device Connection</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Ensure your phone and computer are on the same Wi-Fi network, and use your computer's local network IP in the configuration URL (e.g., <ThemedText type="code">http://192.168.1.100:8082/api/hello</ThemedText>).
              </ThemedText>
            </View>
          </ThemedView>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
  scrollContent: {
    paddingVertical: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.three,
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one / 2,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
  },
  helperRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  helperBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
  },
  helperText: {
    fontSize: 11,
  },
  button: {
    height: 48,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
  },
  responseContainer: {
    gap: Spacing.two,
  },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
    paddingVertical: Spacing.one,
  },
  responseKey: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  responseValue: {
    fontSize: 14,
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one / 2,
    borderRadius: Spacing.one,
  },
  tagText: {
    fontSize: 11,
  },
  codeBlock: {
    backgroundColor: '#1E1E1E',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  codeBlockText: {
    color: '#9CDCFE',
    fontSize: 12,
  },
  tipItem: {
    gap: Spacing.one / 2,
    borderLeftWidth: 2,
    borderLeftColor: '#3B82F6',
    paddingLeft: Spacing.two,
    marginVertical: Spacing.one / 2,
  },
});
