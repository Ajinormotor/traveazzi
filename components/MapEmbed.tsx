import React, { useCallback, useRef, useState } from 'react';
import { Image, ImageSourcePropType, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';
const DEFAULT_CENTER = { lat: 4.8156, lng: 7.0498 }; // Port Harcourt
const DEFAULT_ZOOM = 13;

// The Maps Embed API measures its canvas once, on the first paint of the
// enclosing iframe, and never reflows afterwards. So a resize that does not
// remount the WebView (rotation, split view, a parent that re-lays out) leaves
// the tiles at their original size. Remounting on a coarse size grid is the
// cheapest reliable way to make the embed re-measure itself.
const SIZE_GRID = 8;
const snap = (value: number) => Math.round(value / SIZE_GRID) * SIZE_GRID;

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

// The Embed API refuses top-level loads ("must be used in an iframe"),
// so the WebView renders a minimal HTML shell that iframes the embed URL.
// `width:100%`/`height:100%` plus a matching viewport meta is what makes the
// shell fill any container size; the `key` remount handles the embed's own
// fixed-size canvas.
function buildHtml(url: string): string {
  const src = url.replaceAll('&', '&amp;');
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/><meta http-equiv="X-UA-Compatible" content="IE=edge"/><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#e5e3df;-webkit-text-size-adjust:100%}iframe{border:0;width:100%;height:100%;display:block}</style></head><body><iframe src="${src}" allowfullscreen loading="lazy"></iframe></body></html>`;
}

export default function MapEmbed(props: MapEmbedProps) {
  const [failed, setFailed] = useState(false);
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  const url = buildUrl(props);
  const html = url ? buildHtml(url) : null;

  // Keep the last measured box in a ref so `onLayout` never needs to compare
  // against state (avoids a render loop when the embed itself triggers layout).
  const lastBox = useRef<{ width: number; height: number } | null>(null);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;

    const next = { width: snap(width), height: snap(height) };
    const prev = lastBox.current;
    if (prev && prev.width === next.width && prev.height === next.height) return;

    lastBox.current = next;
    setViewport(next);
  }, []);

  if (!html || failed) {
    // `absoluteFillObject` alone is not enough on every Android build: the
    // intrinsic image size can win the measure pass and leave the fallback
    // narrower than its container. Pinning the width/height to '100%' as well
    // makes the background fill the map area at any screen or sheet size.
    return <Image source={props.fallback} style={styles.fallback} resizeMode="cover" />;
  }

  return (
    <View style={styles.root} onLayout={handleLayout} collapsable={false}>
      <WebView
        key={viewport ? `${viewport.width}x${viewport.height}` : 'map'}
        source={{ html }}
        style={styles.root}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
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

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  fallback: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
