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
  const isSignedIn = user && token;
  // console.log('User details:', user)
  // console.log('Token', token)

  if (!isSignedIn) return; // not signed in, do nothing

  if (inAuthScreen) {
    // check user role
    const roleName = user?.roles?.[0]?.name;
        router.replace("/(passenger)");

    if (roleName === "DRIVER") {

      router.replace("/(driver)");
              // router.replace("/(passenger)");

    } else if (roleName === "PASSENGER") {
      router.replace("/(passenger)");
    } else {
      // fallback if role is missing or unknown
      console.warn("Unknown user role, redirecting to default screen");
      router.replace("/"); 
    }
  }
}, [user, token, segments, router]);


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