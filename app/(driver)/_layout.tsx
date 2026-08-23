import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import SafeScreen from '@/components/SafeScreen'


const DriverLayout = () => {
  return (
<SafeAreaProvider>

<SafeScreen>
    <Stack screenOptions={{ headerShown: false}} >
        <Stack.Screen name='index' />
             <Stack.Screen name='vehicle'  />
     <Stack.Screen name='addVehicle'  />
     <Stack.Screen name='create'  />
           <Stack.Screen name='profile'  />
          <Stack.Screen name='[id]/startRide'  />
              <Stack.Screen name='manageRide/[id]'  />
          <Stack.Screen name='destination'  />
    </Stack>

            {/* <Slot/> */}
    </SafeScreen>
</SafeAreaProvider>
  )
}

export default DriverLayout

const styles = StyleSheet.create({})