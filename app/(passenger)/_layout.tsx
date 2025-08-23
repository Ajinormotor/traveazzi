import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import SafeScreen from '@/components/SafeScreen'

const PassengerLayout = () => {
  return (
<SafeAreaProvider>

<SafeScreen>
    <Stack screenOptions={{ headerShown: false}} >

   <Stack.Screen name='index' />
  <Stack.Screen name='home'  />
   <Stack.Screen name='rides'  />
   <Stack.Screen name='confirmRide/[id]'  />  
      <Stack.Screen name='payRide/[id]'  />  

    </Stack>
    </SafeScreen>
</SafeAreaProvider>
  )
}

export default PassengerLayout 

const styles = StyleSheet.create({})