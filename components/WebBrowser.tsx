import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebBrowserProps {
  url: string;
  onNavigationStateChange?: (navState: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  style?: any;
}

export default function WebBrowser({
  url,
  onNavigationStateChange,
  onLoadStart,
  onLoadEnd,
  style,
}: WebBrowserProps) {
  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={onNavigationStateChange}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});