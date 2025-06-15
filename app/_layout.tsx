import SafeScreen from "@/components/SafeScreen";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout (){

    return (
        <SafeAreaProvider>

    <SafeScreen>
        <Stack  screenOptions={{ headerShown: false}}>
        <Stack.Screen name="index"  />
         <Stack.Screen  name="home"  />
         <Stack.Screen name="(schedule)"  />
         <Stack.Screen name="(auth)"  />
           <Stack.Screen name="(offer)"  />

        </Stack>
            </SafeScreen>
                
        </SafeAreaProvider>
    )

}