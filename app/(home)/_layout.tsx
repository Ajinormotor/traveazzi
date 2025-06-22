import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SafeScreen from '@/components/SafeScreen'

const _layout = () => {
  return (
<SafeAreaProvider>


<SafeScreen>


<Stack  >
    <Stack.Screen name='index' />
</Stack>

</SafeScreen>

</SafeAreaProvider>
  )
}

export default _layout

const styles = StyleSheet.create({})