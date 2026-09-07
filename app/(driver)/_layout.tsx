import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack, useRouter } from 'expo-router'
import SafeScreen from '@/components/SafeScreen'
import { useAuthStore } from '@/store/authStore'


const DriverLayout = () => {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!user || !token) return; // unauthenticated: root guard handles /(auth) redirect
    if (user?.roles?.[0]?.name !== 'DRIVER') {
      router.replace('/(passenger)/home')
    }
  }, [user, token, router])
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