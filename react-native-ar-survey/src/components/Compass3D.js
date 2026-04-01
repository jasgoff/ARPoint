import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Polygon, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';

export default function Compass3D({ heading = 0, orientation = { alpha: 0, beta: 0, gamma: 0 } }) {
  const normalizedHeading = ((heading % 360) + 360) % 360;
  const beta = orientation.beta || 0;
  const gamma = orientation.gamma || 0;
  const clampedBeta = Math.max(-60, Math.min(60, beta));
  const clampedGamma = Math.max(-60, Math.min(60, gamma));
  const isLevel = Math.abs(beta) < 3 && Math.abs(gamma) < 3;
  const roseRotation = -normalizedHeading;

  const getDirectionLabel = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  const bubbleX = (clampedGamma / 60) * 15;
  const bubbleY = (clampedBeta / 60) * 15;

  return (
    <View style={styles.container}>
      {/* Glass marble compass */}
      <View style={[
        styles.marbleOuter,
        {
          transform: [
            { perspective: 600 },
            { rotateX: `${clampedBeta * 0.5}deg` },
            { rotateY: `${-clampedGamma * 0.5}deg` },
          ],
        },
      ]}>
        <Svg width={140} height={140} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="marbleGrad" cx="30%" cy="30%" r="70%">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <Stop offset="40%" stopColor="rgba(120,200,255,0.1)" />
              <Stop offset="100%" stopColor="rgba(0,20,40,0.4)" />
            </RadialGradient>
            <RadialGradient id="innerGrad" cx="30%" cy="30%" r="70%">
              <Stop offset="0%" stopColor="#1a1a1a" />
              <Stop offset="100%" stopColor="#0a0a0a" />
            </RadialGradient>
            <LinearGradient id="northGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FF6B35" />
              <Stop offset="100%" stopColor="#CC3700" />
            </LinearGradient>
          </Defs>

          {/* Outer glass sphere */}
          <Circle cx="50" cy="50" r="48" fill="url(#marbleGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          
          {/* Inner compass disc */}
          <Circle cx="50" cy="50" r="40" fill="url(#innerGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* Compass rose - rotates */}
          <G rotation={roseRotation} origin="50, 50">
            {/* Degree ticks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = i * 10;
              const isCardinal = angle % 90 === 0;
              const rad = (angle - 90) * Math.PI / 180;
              const outerR = 38;
              const innerR = isCardinal ? 30 : 34;
              return (
                <Line
                  key={i}
                  x1={50 + outerR * Math.cos(rad)}
                  y1={50 + outerR * Math.sin(rad)}
                  x2={50 + innerR * Math.cos(rad)}
                  y2={50 + innerR * Math.sin(rad)}
                  stroke={angle === 0 ? '#FF4500' : isCardinal ? 'white' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={isCardinal ? 2 : 0.5}
                />
              );
            })}

            {/* Cardinal labels */}
            {[{ l: 'N', a: 0, c: '#FF4500' }, { l: 'E', a: 90, c: 'white' }, { l: 'S', a: 180, c: 'white' }, { l: 'W', a: 270, c: 'white' }].map(({ l, a, c }) => {
              const rad = (a - 90) * Math.PI / 180;
              const r = 24;
              return (
                <SvgText
                  key={l}
                  x={50 + r * Math.cos(rad)}
                  y={50 + r * Math.sin(rad) + 3}
                  fill={c}
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {l}
                </SvgText>
              );
            })}

            {/* North needle */}
            <Polygon points="50,14 46,48 50,44 54,48" fill="url(#northGrad)" />
            {/* South needle */}
            <Polygon points="50,86 46,52 50,56 54,52" fill="#888" />
            {/* Center */}
            <Circle cx="50" cy="50" r="4" fill="#333" />
            <Circle cx="50" cy="50" r="2" fill="#FF4500" />
          </G>

          {/* Bubble level */}
          <Circle
            cx={50 + bubbleX}
            cy={50 + bubbleY}
            r="5"
            fill={isLevel ? '#00FF41' : '#FFD700'}
            opacity={0.8}
          />

          {/* Glass highlight */}
          <Circle cx="35" cy="35" r="15" fill="rgba(255,255,255,0.15)" />
        </Svg>
      </View>

      {/* North indicator */}
      <View style={styles.northIndicator}>
        <Svg width={20} height={14} viewBox="0 0 20 14">
          <Polygon points="10,14 0,0 20,0" fill="#FF4500" />
        </Svg>
      </View>

      {/* Heading readout */}
      <View style={styles.headingReadout}>
        <SvgText style={styles.headingDegrees}>{Math.round(normalizedHeading)}°</SvgText>
        <SvgText style={styles.headingDirection}>{getDirectionLabel(normalizedHeading)}</SvgText>
      </View>

      {/* Level indicator */}
      <View style={styles.levelIndicator}>
        <SvgText style={[styles.levelText, { color: isLevel ? '#00FF41' : '#FFD700' }]}>
          {isLevel ? '● LEVEL' : `◐ TILT ${Math.abs(clampedBeta).toFixed(0)}° / ${Math.abs(clampedGamma).toFixed(0)}°`}
        </SvgText>
      </View>
    </View>
  );
}

// G component for grouping with transform
const G = ({ children, rotation, origin }) => {
  return (
    <Svg.G transform={`rotate(${rotation}, ${origin})`}>
      {children}
    </Svg.G>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 160,
    height: 220,
  },
  marbleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: '#00FF41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  northIndicator: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
  },
  headingReadout: {
    marginTop: 8,
    alignItems: 'center',
  },
  headingDegrees: {
    color: '#00FF41',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,255,65,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headingDirection: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
  levelIndicator: {
    marginTop: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
