import BrandSplash from "@/components/BrandSplash";
import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/authStore";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync().catch(() => {});

const SPLASH_DURATION = 2000;

export default function RootLayout (){

    const { checkAuth, isHydrated, user, token} = useAuthStore()
    const router = useRouter()
    const segments = useSegments()

    const [fontsLoaded, fontError] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });
    const [showBrandSplash, setShowBrandSplash] = useState(true);

    useEffect(() => {
        checkAuth()
    },[checkAuth])

useEffect(() => {
  if (!isHydrated) return; // wait for AsyncStorage session to load

  const PUBLIC_SEGMENTS = ["(auth)", "signin", "register"];
  const current = segments[0] as string;
  const inPublicArea =
    !current || PUBLIC_SEGMENTS.includes(current) || current === "index";
  const isSignedIn = Boolean(user && token);

  if (!isSignedIn && !inPublicArea) {
    // not signed in -> block protected areas
    router.replace("/(auth)");
    return;
  }

  if (isSignedIn && inPublicArea && current !== "index") {
    // signed in but sitting on auth screens -> send to their portal
    const roleName = user?.roles?.[0]?.name;

    if (roleName === "DRIVER") {
      router.replace("/(driver)");
    } else if (roleName === "PASSENGER") {
      router.replace("/(passenger)");
    } else {
      router.replace("/");
    }
  }
}, [isHydrated, user, token, segments, router]);

useEffect(() => {
  const appReady = (fontsLoaded || fontError) && isHydrated;
  if (!appReady || !showBrandSplash) return;

  const timer = setTimeout(() => {
    SplashScreen.hideAsync().catch(() => {});
    setShowBrandSplash(false);
  }, SPLASH_DURATION);

  return () => clearTimeout(timer);
}, [fontsLoaded, fontError, isHydrated, showBrandSplash]);

    if (!(fontsLoaded || fontError)) {
        return null; // native splash still visible
    }

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
            <Stack.Screen name="signin"  />
            <Stack.Screen name="transitRide/[id]"  />

        </Stack>

        <Toast />
            </SafeScreen>

        {/* rendered above SafeScreen so the splash covers the full screen,
            including notch / home-bar areas */}
        {showBrandSplash && <BrandSplash />}
        </SafeAreaProvider>
    )

}