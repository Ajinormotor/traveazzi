import React, { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native'

const BrandSplash = () => {
  const { width } = useWindowDimensions()
  // same visual size on regular phones, scales down on small screens / up slightly on tablets
  const brandSize = Math.min(48, Math.max(28, width * 0.11))
  const taglineSize = Math.min(16, Math.max(12, width * 0.038))
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, scale])

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.brand,
          { opacity, transform: [{ scale }], fontSize: brandSize },
        ]}
      >
        Traveazi
      </Animated.Text>
      <Animated.Text
        style={[styles.tagline, { opacity, fontSize: taglineSize }]}
      >
        Your ride, your way
      </Animated.Text>
    </View>
  )
}

export default BrandSplash

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
    backgroundColor: '#245AB0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'SpaceMono',
    color: '#DCE6F5',
    marginTop: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
})
