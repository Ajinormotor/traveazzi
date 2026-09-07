import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack, useRouter } from 'expo-router'
import SafeScreen from '@/components/SafeScreen'
import { useAuthStore } from '@/store/authStore'

const PassengerLayout = () => {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!user || !token) return; // unauthenticated: root guard handles /(auth) redirect
    if (user?.roles?.[0]?.name !== 'PASSENGER') {
      router.replace('/(driver)')
    }
  }, [user, token, router])
  return (
<SafeAreaProvider>

<SafeScreen>
    <Stack screenOptions={{ headerShown: false}} >

   <Stack.Screen name='index' />
  <Stack.Screen name='home'  />
   <Stack.Screen name='rides'  />
      <Stack.Screen name='history'  />
            <Stack.Screen name='profile'  />
         <Stack.Screen name='favoritesDriver'  />
   <Stack.Screen name='confirmRide/[id]'  />  
      <Stack.Screen name='payRide/[id]'  />  

    </Stack>
    </SafeScreen>
</SafeAreaProvider>
  )
}

export default PassengerLayout 

const styles = StyleSheet.create({})