import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

// Your PWA URL - UPDATE THIS with your deployed URL
const PWA_URL = 'https://web-dev-101-3.preview.emergentagent.com';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <WebView
        source={{ uri: PWA_URL }}
        style={styles.webview}
        // Enable camera, GPS, and sensor permissions
        geolocationEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Allow camera access
        mediaTypes="video"
        allowsFullscreenVideo={true}
        // Better UX
        bounces={false}
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  webview: {
    flex: 1,
  },
});
