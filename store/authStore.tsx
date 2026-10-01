import Toast from "react-native-toast-message";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncPushRegistration, removePushRegistration } from "@/lib/notifications";

const Base_Url =
  process.env.EXPO_PUBLIC_API_URL ?? "https://traveazi.onrender.com/api";


interface AuthStore {
  isHydrated: boolean;
  userEmail: string | null;
  loading: boolean;
  token: any;
  user: any;
  registerMail: (email: string) => Promise<any>;
  registerMailOtp: (otp: any, email?: string) => Promise<any>;
  login: (params: { email: string; password: string }) => Promise<any>;
  createProfile: (data: {
    firstName: string;
    lastName: string;
    gender: string;
    password: string;
    confirmPassword: string;
    portalType: "DRIVER" | "PASSENGER";
  }) => Promise<any>;
  logout: () => Promise<any>;
  userProfile: () => Promise<any>;
  checkAuth: () => Promise<any>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (code: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isHydrated: false,
  userEmail: null,
  loading: false,
  token: null,
  user: null,

  registerMail: async (email: string) => {
    set({ loading: true });

    try {
      const response = await fetch(`${Base_Url}/auth/email/send-otp`, {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        set({ userEmail: email, loading: false });
        Toast.show({ type: "success", text1: "OTP sent" });
        return true;
      }

      set({ loading: false });
      Toast.show({ type: "error", text1: "Failed to send OTP" });
      return false;
    } catch (error: any) {
      console.log("ErrorLogin:", error?.data?.message);
      set({ loading: false });
      Toast.show({ type: "error", text1: "Something went wrong" });
      return false;
    }
  },

  registerMailOtp: async (otp, email) => {
    set({ loading: true });

    //  const router = useRouter()
    const { userEmail: storeEmail } = useAuthStore.getState();
    try {
      const response = await fetch(`${Base_Url}/auth/email/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ otp, email: email ?? storeEmail }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        set({ loading: false, token: data?.data.partialToken });
        // Persist: without this, an app restart before profile completion
        // leaves token null and profile/complete gets "Bearer null" (jwt malformed).
        await AsyncStorage.setItem("token", data?.data.partialToken);
        Toast.show({ type: "success", text1: data?.message || "Valid OTP" });
        // router.push('/(auth)/signup')
        return true;
      }

      set({ loading: false });
      Toast.show({ type: "error", text1: "Invalid OTP" });
      return false;
    } catch (error) {
      set({ loading: false });
      Toast.show({ type: "error", text1: "Something went wrong" });
      return false;
    }
  },

  createProfile: async ({
    firstName,
    lastName,
    gender,
    password,
    confirmPassword,
    portalType,
  }) => {
    set({ loading: true });

    const { token } = useAuthStore.getState();

    // Never call profile/complete without the OTP partial token: the server
    // rejects "Bearer null" with `jwt malformed`. Send the user back to OTP.
    if (!token) {
      set({ loading: false });
      Toast.show({
        type: "error",
        text1: "Session expired. Please verify your email again.",
      });
      return false;
    }

    try {
      if (!firstName || !lastName || !gender || !password || !confirmPassword) {
        set({ loading: false });
        Toast.show({ type: "error", text1: "Please fill in all fields" });
        return false;
      }

      if (password !== confirmPassword) {
        set({ loading: false });
        return Toast.show({ type: "error", text1: "Passwords do not match" });
      }

      const response = await fetch(`${Base_Url}/auth/profile/complete`, {
        // Update to real endpoint
        method: "PATCH",
        body: JSON.stringify({ firstName, 
          lastName, 
          gender: gender.toUpperCase(),
           password,
           country: "Nigeria", 
      termsAccepted: true,
      portalType }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data?.success) {
        Toast.show({
          type: "success",
          text1: data?.message || "Registered successfully",
        });
        set({ loading: false });
        return true;
      }

      Toast.show({
        type: "error",
        text1: data?.message || "Registration failed",
      });
      console.log("create profile:", data?.message);
      set({ loading: false });
      return false;
    } catch (error: any) {
      console.log("Error:", error);
      set({ loading: false });
      Toast.show({ type: "error", text1: "Something went wrong" });
      return false;
    }
  },

 login: async ({ email, password }) => {
  set({ loading: true });

  try {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Please fill in all fields" });
      set({ loading: false });
      return false;
    }

    const response = await fetch(`${Base_Url}/auth/login/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Remove old token
    await AsyncStorage.removeItem("token");

    if (response.ok && data?.success) {
      const token = data?.data?.token?.accessToken;
      const user = data?.data?.user;

      if (!token || !user) {
        console.log("❌ TOKEN OR USER MISSING IN SUCCESS RESPONSE");
        Toast.show({ type: "error", text1: "Invalid server response" });
        set({ loading: false });
        return false;
      }

      // Store in Zustand
      set({ token, user, loading: false });

      // Store in AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Upload this device's FCM token so the driver receives booking
      // requests. Fire-and-forget: never block or fail login on it.
      syncPushRegistration(token);

      Toast.show({ type: "success", text1: "Logged in" });

      return true;
    }

    // ❌ Failure branch — DO NOT overwrite token/user with undefined
    Toast.show({ type: "error", text1: data.message || "Login failed" });
    set({ loading: false });

    return false;

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    Toast.show({ type: "error", text1: "Something went wrong" });
    set({ loading: false });
    return false;
  }
},


 

  userProfile: async () => {
    set({ loading: true });

    try {
     
    const token  = await AsyncStorage.getItem('token')
      const response = await fetch(`${Base_Url}/auth/user`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
             Authorization: `Bearer ${token}`, },
      });

      const data = await response.json()

      if (response.ok && data?.success) {
        set({ loading: false, token: data?.data?.token?.accessToken, user: data?.data?.user  });

        await AsyncStorage.setItem("token", data?.data?.token?.accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(data?.data?.user));

        // FCM tokens rotate, so re-upload on every session restore rather
        // than trusting whatever was registered on a previous launch.
        syncPushRegistration(data?.data?.token?.accessToken);

        return true;
      } else {
        set({ loading: false });
        return false;
      }
    } catch (error: any) {
      // console.log(error?.message)
      set({ loading: false });
      Toast.show({
        type: "error",
        text1: error?.message || "Something went wrong",
      });
      return false;
    }
  },


  logout: async () => {
    const sessionToken = useAuthStore.getState().token;
    // Unregister first: once the local token is cleared we can no longer
    // authenticate the call, and a stale token would keep pushing rides
    // to the next user of this phone.
    await removePushRegistration(sessionToken);
    try {
      await fetch(`${Base_Url}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
          "Content-Type": "application/json" },
      });
    } catch (error) {
      console.log("Logout request failed", error);
    } finally {
      // always clear local session, even if the server call failed
      await AsyncStorage.multiRemove(["token", "user"]);
      useAuthStore.setState({ token: null, user: null });
    }
  },

  forgotPassword: async (email) => {
    if (!email) {
      Toast.show({ type: "error", text1: "Please enter your email" });
      return false;
    }

    set({ loading: true });
    try {
      const response = await fetch(`${Base_Url}/auth/forgot-password`, {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok && data?.success !== false) {
        set({ userEmail: email, loading: false });
        Toast.show({
          type: "success",
          text1: data?.message || "Reset code sent to your email",
        });
        return true;
      }

      set({ loading: false });
      Toast.show({ type: "error", text1: data?.message || "Failed to send reset code" });
      return false;
    } catch (error) {
      console.log("Forgot password error:", error);
      set({ loading: false });
      Toast.show({ type: "error", text1: "Something went wrong" });
      return false;
    }
  },

  resetPassword: async (code, password) => {
    if (!code || !password) {
      Toast.show({ type: "error", text1: "Please fill in all fields" });
      return false;
    }

    set({ loading: true });
    try {
      const response = await fetch(`${Base_Url}/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify({ code, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok && data?.success !== false) {
        set({ loading: false });
        Toast.show({
          type: "success",
          text1: data?.message || "Password updated. Please log in.",
        });
        return true;
      }

      set({ loading: false });
      Toast.show({ type: "error", text1: data?.message || "Invalid or expired code" });
      return false;
    } catch (error) {
      console.log("Reset password error:", error);
      set({ loading: false });
      Toast.show({ type: "error", text1: "Something went wrong" });
      return false;
    }
  },

   checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      set({ token, user });
    } catch (error) {
      console.log("Auth check failed", error);
    } finally {
      set({ isHydrated: true });
    }
  },

}));
