import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video';

const App = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Script to poll for window.backgroundAudioUrl on the website
  const injectedJavaScript = `
    (function() {
      let lastUrl = '';
      setInterval(function() {
        // Check if the variable exists and has changed
        if (window.backgroundAudioUrl && window.backgroundAudioUrl !== lastUrl) {
          lastUrl = window.backgroundAudioUrl;
          // Send to Native App
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'AUDIO_URL',
            payload: lastUrl
          }));
        }
      }, 1000);
    })();
    true;
  `;

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'AUDIO_URL' && data.payload) {
        console.log('Found audio URL:', data.payload);
        setAudioUrl(data.payload);
      }
    } catch (error) {
      // Ignore messages that aren't JSON or don't match our format
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <WebView
        source={{ uri: 'https://darkred-lobster-112707.hostingersite.com/' }}
        style={styles.webview}
        allowsFullscreenVideo={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={injectedJavaScript}
        onMessage={onMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
      />

      {/* Background Audio Player */}
      {audioUrl && (
        <Video
          source={{ uri: audioUrl }}
          ref={(ref) => {
            // Player ref
          }}
          playInBackground={true}
          playWhenInactive={true}
          ignoreSilentSwitch="ignore"
          repeat={true}
          style={styles.backupPlayer} // Hidden player
          onError={(e) => console.log('Video Error:', e)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  webview: {
    flex: 1,
  },
  backupPlayer: {
    width: 0,
    height: 0,
  },
});

export default App;
