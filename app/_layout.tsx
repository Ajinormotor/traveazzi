import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/authStore";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout (){

    const { checkAuth, user, token} = useAuthStore()
    const router = useRouter()
    const segments = useSegments()

    useEffect(() => {
        checkAuth()
    },[checkAuth])

    useEffect(() => {
        const inAuthScreen = segments[0] === "(auth)";
        const isSignedIn = user && token
        // console.log('Root Token ', token)
                // console.log('User', user)
                // console.log('USer roles', user?.roles[0]?.name)

        // if(!inAuthScreen && !isSignedIn) return router.replace('/(auth)')
        //  if(isSignedIn && inAuthScreen) return router.replace("/(driver)")
          if(isSignedIn && inAuthScreen) return router.replace("/(passenger)")


            // if   (isSignedIn && inAuthScreen) {
            // if(user && user.roles[0]?.name === 'DRIVER'  )
            //     { return router.replace("/(driver)") 
            //     } else {
            // return router.replace("/(passenger)")
            //     }

            // }


    }, [user,token,segments, router])

    return (
        <SafeAreaProvider>

    <SafeScreen>
        <Stack  screenOptions={{ headerShown: false}}>
        <Stack.Screen name="index"  />
           <Stack.Screen name="(auth)"  />
         <Stack.Screen name="(schedule)"  />
      
           {/* <Stack.Screen name="(offer)"  /> */}
              <Stack.Screen name="(driver)"  />
                      <Stack.Screen name="(passenger)"  />

        </Stack>

        <Toast />
            </SafeScreen>
                
        </SafeAreaProvider>
    )

}