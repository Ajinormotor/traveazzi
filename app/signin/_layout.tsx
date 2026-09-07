import { Stack } from "expo-router";

export default function SigninLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="loginOtp" />
    </Stack>
  );
}
