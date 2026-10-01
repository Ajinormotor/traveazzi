import React, { ReactNode, useCallback, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import BottomSheet from '@/components/BottomSheet';
import MapEmbed from '@/components/MapEmbed';
import directionsIcon from '../assets/images/navigation-03.png';
import markerIcon from '../assets/images/marker.png';

const MARKER_SIZE = 100;
const ACTION_SIZE = 40;
const EDGE_GAP = 20;

export type MapSheetScreenProps = {
  children: ReactNode;
  mode?: 'view' | 'directions';
  center?: { lat: number; lng: number };
  zoom?: number;
  origin?: string;
  destination?: string;
  fallback: ImageSourcePropType;
  /** Sheet height on first paint, as a fraction of the screen. */
  initialRatio?: number;
  minRatio?: number;
  maxRatio?: number;
  sheetBackgroundColor?: string;
  sheetContentStyle?: StyleProp<ViewStyle>;
  showMarker?: boolean;
  showLocateButton?: boolean;
  onMarkerPress?: () => void;
  onLocatePress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * The map + resizable bottom sheet layout shared by every map screen, so the
 * sheet drags identically everywhere. The sheet height is tracked so the marker
 * and the locate button stay pinned to the visible slice of map instead of to a
 * fixed screen percentage.
 */
export default function MapSheetScreen({
  children,
  mode = 'view',
  center,
  zoom,
  origin,
  destination,
  fallback,
  initialRatio = 0.5,
  minRatio = 0.2,
  maxRatio = 0.92,
  sheetBackgroundColor = '#FAFAFA',
  sheetContentStyle,
  showMarker = true,
  showLocateButton = false,
  onMarkerPress,
  onLocatePress,
  style,
}: MapSheetScreenProps) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [sheetHeight, setSheetHeight] = useState(0);

  const onRootLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ width, height });
  }, []);

  const visibleMap = Math.max(0, box.height - sheetHeight);
  const markerBottom = Math.max(EDGE_GAP, visibleMap - MARKER_SIZE - EDGE_GAP);
  const actionBottom = Math.max(EDGE_GAP, visibleMap - ACTION_SIZE - EDGE_GAP);
  const markerLeft = Math.max(EDGE_GAP, (box.width - MARKER_SIZE) / 2);

  return (
    <View style={[styles.root, style]} onLayout={onRootLayout} collapsable={false}>
      <MapEmbed mode={mode} center={center} zoom={zoom} origin={origin} destination={destination} fallback={fallback} />

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {box.height > 0 ? (
          <>
            {showMarker ? (
              <TouchableOpacity
                accessibilityLabel="Pick-up location"
                onPress={onMarkerPress}
                style={[styles.marker, { left: markerLeft, bottom: markerBottom }]}
              >
                <Image source={markerIcon} alt='' style={styles.markerImage} resizeMode="contain" />
              </TouchableOpacity>
            ) : null}

            {showLocateButton ? (
              <TouchableOpacity
                accessibilityLabel="Centre map on my location"
                onPress={onLocatePress}
                style={[styles.action, { right: EDGE_GAP, bottom: actionBottom }]}
              >
                <View style={styles.actionInner}>
                  <Image source={directionsIcon} alt='' style={styles.actionImage} resizeMode="contain" />
                </View>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}
      </View>

      <BottomSheet
        initialRatio={initialRatio}
        minRatio={minRatio}
        maxRatio={maxRatio}
        backgroundColor={sheetBackgroundColor}
        onHeightChange={setSheetHeight}
        contentContainerStyle={sheetContentStyle}
      >
        {children}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  marker: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
  },
  action: {
    position: 'absolute',
    width: ACTION_SIZE,
    height: ACTION_SIZE,
  },
  actionInner: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionImage: {
    width: 20,
    height: 20,
  },
});
