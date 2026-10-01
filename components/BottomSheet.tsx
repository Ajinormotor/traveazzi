import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponderGestureState,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

const HANDLE_TOUCH_HEIGHT = 34;
const GRABBER = { width: 36, height: 4, borderRadius: 2 };
// Movement under this many px counts as a tap on the handle, not a drag.
const TAP_SLOP = 4;

type Bounds = { width: number; height: number };

export type BottomSheetProps = {
  children: React.ReactNode;
  /** Sheet height as a fraction of the measured container, before any drag. */
  initialRatio?: number;
  /** Smallest height the sheet can be dragged to, as a fraction of the container. */
  minRatio?: number;
  /** Largest height the sheet can be dragged to, as a fraction of the container. */
  maxRatio?: number;
  backgroundColor?: string;
  topRadius?: number;
  grabberColor?: string;
  /** Fired with the current sheet height in px on every resize. */
  onHeightChange?: (height: number) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Bolt-style resizable bottom sheet: it can be dragged to any height between
 * `minRatio` and `maxRatio` of its parent and stays where it is released.
 * Tapping the handle toggles between fully collapsed and fully expanded.
 *
 * Height rides on an `Animated.Value` attached to the `height` style prop, so a
 * drag writes straight to the native view without re-rendering the React tree,
 * and the `flex: 1` body re-lays out against the new height for free.
 */
export default function BottomSheet({
  children,
  initialRatio = 0.5,
  minRatio = 0.2,
  maxRatio = 0.92,
  backgroundColor = '#FFFFFF',
  topRadius = 30,
  grabberColor = '#D6D9DE',
  onHeightChange,
  style,
  contentContainerStyle,
}: BottomSheetProps) {
  // Held in state so the Animated.Value is created exactly once without
  // reaching into a ref while rendering.
  const [height] = useState(() => new Animated.Value(0));
  const [ready, setReady] = useState(false);

  // Mutable drag bookkeeping, only ever read or written from event handlers.
  const bounds = useRef<Bounds | null>(null);
  const currentHeight = useRef(0);
  const dragStartHeight = useRef(0);
  const notify = useRef(onHeightChange);
  useEffect(() => {
    notify.current = onHeightChange;
  }, [onHeightChange]);

  const limitsFor = useCallback((): { min: number; max: number } | null => {
    const box = bounds.current;
    if (!box) return null;
    return { min: box.height * minRatio, max: box.height * maxRatio };
  }, [maxRatio, minRatio]);

  const applyHeight = useCallback(
    (next: number) => {
      const limits = limitsFor();
      if (!limits) return;
      const clamped = Math.min(Math.max(next, limits.min), limits.max);
      currentHeight.current = clamped;
      height.setValue(clamped);
      notify.current?.(clamped);
    },
    [height, limitsFor],
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height: boxHeight } = e.nativeEvent.layout;
      if (boxHeight <= 0) return;

      // Re-express the current height as a ratio of the *previous* box, so a
      // rotation or split view keeps the same visual size instead of clamping a
      // stale pixel value against the new bounds.
      const prev = bounds.current;
      const shownRatio =
        prev && prev.height > 0 && currentHeight.current > 0
          ? currentHeight.current / prev.height
          : initialRatio;

      bounds.current = { width, height: boxHeight };
      applyHeight(boxHeight * Math.min(Math.max(shownRatio, minRatio), maxRatio));
      setReady(true);
    },
    [applyHeight, initialRatio, maxRatio, minRatio],
  );

  const onGrant = useCallback(() => {
    dragStartHeight.current = currentHeight.current;
  }, []);

  // The responder system hands these a `gestureState` as a second argument at
  // runtime (that is how PanResponder is built), but ViewProps types it as a
  // single-argument callback, so the parameter is optional here.
  const onMove = useCallback(
    (_e: GestureResponderEvent, g?: PanResponderGestureState) => {
      if (!g) return;
      // dy > 0 is a downward drag, which shortens the sheet.
      applyHeight(dragStartHeight.current - g.dy);
    },
    [applyHeight],
  );

  const onRelease = useCallback(
    (_e: GestureResponderEvent, g?: PanResponderGestureState) => {
      const limits = limitsFor();
      const dy = g?.dy ?? 0;
      const dx = g?.dx ?? 0;
      const isTap = Math.abs(dy) <= TAP_SLOP && Math.abs(dx) <= TAP_SLOP;

      if (isTap && limits) {
        // Tap on the handle: go to whichever end is further away.
        const target =
          currentHeight.current > (limits.min + limits.max) / 2 ? limits.min : limits.max;
        currentHeight.current = target;
        notify.current?.(target);
        Animated.spring(height, { toValue: target, useNativeDriver: false, bounciness: 4, speed: 14 }).start();
        return;
      }

      // Free positioning: it keeps the height it was released at. The spring
      // only absorbs the last pixels of finger jitter.
      Animated.spring(height, {
        toValue: currentHeight.current,
        useNativeDriver: false,
        bounciness: 0,
        speed: 40,
      }).start();
    },
    [height, limitsFor],
  );

  // A ScrollView that takes over mid-drag ends the gesture without a release,
  // so this only settles the sheet where it already is.
  const onSettle = useCallback(() => {
    Animated.spring(height, {
      toValue: currentHeight.current,
      useNativeDriver: false,
      bounciness: 0,
      speed: 40,
    }).start();
  }, [height]);

  // The responder props live on the handle only, so a drag resizes the sheet
  // while the body keeps its own scroll behaviour.
  const handleResponderProps = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: (_e: GestureResponderEvent, g?: PanResponderGestureState) =>
      Math.abs(g?.dy ?? 0) > 2,
    onResponderGrant: onGrant,
    onResponderMove: onMove,
    onResponderRelease: onRelease,
    onResponderTerminate: onSettle,
    onResponderTerminationRequest: () => true,
  };

  return (
    <View style={[styles.root, style]} onLayout={handleLayout} pointerEvents="box-none" collapsable={false}>
      {ready ? (
        <Animated.View
          style={[
            styles.sheet,
            { height, backgroundColor, borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius },
          ]}
        >
          <View {...handleResponderProps} style={styles.handle} collapsable={false}>
            <View style={[styles.grabber, { backgroundColor: grabberColor }]} />
          </View>
          <View style={[styles.body, contentContainerStyle]}>{children}</View>
        </Animated.View>
      ) : null}
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
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handle: {
    width: '100%',
    height: HANDLE_TOUCH_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grabber: {
    ...GRABBER,
  },
  body: {
    flex: 1,
  },
});
