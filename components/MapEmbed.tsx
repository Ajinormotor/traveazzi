import React, { useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';
const DEFAULT_CENTER = { lat: 4.8156, lng: 7.0498 }; // Port Harcourt
const DEFAULT_ZOOM = 13;

export type MapEmbedProps = {
  mode: 'view' | 'directions';
  center?: { lat: number; lng: number };
  zoom?: number;
  origin?: string;
  destination?: string;
  fallback: ImageSourcePropType;
};

function buildUrl(props: MapEmbedProps): string | null {
  if (!MAPS_KEY) return null;
  if (props.mode === 'directions') {
    const origin = props.origin?.trim() ?? '';
    const destination = props.destination?.trim() ?? '';
    if (origin && destination) {
      return `https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    }
    // empty leg: fall through to area view
  }
  const c = props.center ?? DEFAULT_CENTER;
  const z = props.zoom ?? DEFAULT_ZOOM;
  return `https://www.google.com/maps/embed/v1/view?key=${MAPS_KEY}&center=${c.lat},${c.lng}&zoom=${z}`;
}

export default function MapEmbed(props: MapEmbedProps) {
  const [failed, setFailed] = useState(false);
  const url = buildUrl(props);
  if (!url || failed) {
    return <Image source={props.fallback} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }
  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        onError={(e) => {
          if (__DEV__) console.warn('[MapEmbed] WebView error, using static fallback:', e.nativeEvent.description);
          setFailed(true);
        }}
        onHttpError={(e) => {
          if (__DEV__) console.warn('[MapEmbed] embed request failed, using static fallback. HTTP', e.nativeEvent.statusCode, '— check the API key and that Maps Embed API is enabled.');
          setFailed(true);
        }}
      />
    </View>
  );
}
