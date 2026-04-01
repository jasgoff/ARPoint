import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { loginDemo, loginWithGoogle } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#FF4500', '#FF6B35']}
            style={styles.logoGradient}
          >
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="white" />
            </Svg>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>AR SURVEY</Text>
        <Text style={styles.subtitle}>Professional surveying tools with AR precision</Text>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke="#00FF41" strokeWidth="2" />
              <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="#00FF41" />
            </Svg>
            <Text style={styles.featureText}>3D Compass</Text>
          </View>
          <View style={styles.featureCard}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#FF4500" strokeWidth="2" />
              <Circle cx="12" cy="10" r="3" stroke="#FF4500" strokeWidth="2" />
            </Svg>
            <Text style={styles.featureText}>AR Pin Drop</Text>
          </View>
          <View style={styles.featureCard}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Line x1="4" y1="20" x2="20" y2="4" stroke="#007AFF" strokeWidth="2" />
              <Rect x="2" y="18" width="4" height="4" fill="#007AFF" />
              <Rect x="18" y="2" width="4" height="4" fill="#007AFF" />
            </Svg>
            <Text style={styles.featureText}>Distance & Bearing</Text>
          </View>
          <View style={styles.featureCard}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke="#FF4500" strokeWidth="2" />
              <Path d="M8 2v16M16 6v16" stroke="#FF4500" strokeWidth="2" />
            </Svg>
            <Text style={styles.featureText}>Satellite Map</Text>
          </View>
        </View>

        {/* Login Buttons */}
        <TouchableOpacity style={styles.googleButton} onPress={loginWithGoogle}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              fill="#0A0A0A"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <Path
              fill="#0A0A0A"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <Path
              fill="#0A0A0A"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <Path
              fill="#0A0A0A"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </Svg>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={loginDemo}>
          <Text style={styles.demoButtonText}>Try Demo Mode</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Your data stays on your device</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 40,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
    width: '100%',
  },
  featureCard: {
    width: (width - 72) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: 56,
    borderRadius: 16,
    marginBottom: 12,
  },
  googleButtonText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  demoButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
});
