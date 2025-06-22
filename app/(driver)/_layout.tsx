import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import SafeScreen from '@/components/SafeScreen'

const _layout = () => {
  return (
<SafeAreaProvider>

<SafeScreen>
    <Stack screenOptions={{ headerShown: false}} >
        <Stack.Screen name='index' />
     <Stack.Screen name='addVehicle'  />
     <Stack.Screen name='create'  />
          <Stack.Screen name='manageRide'  />
          <Stack.Screen name='destination'  />
    </Stack>
    </SafeScreen>
</SafeAreaProvider>
  )
}

export default _layout

const styles = StyleSheet.create({})