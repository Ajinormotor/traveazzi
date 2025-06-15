import { Stack } from "expo-router"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

export default function AuthLayout (){
    return (

        <SafeAreaProvider>

      
        <Stack screenOptions={{ headerShown: false}}>
      <Stack.Screen name="index"  />
    <Stack.Screen name="signup"   />
      <Stack.Screen name="forgotpassword"   />

        
        </Stack>
          </SafeAreaProvider>
    )
}