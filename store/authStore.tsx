import axios from "axios";
// import { useRouter } from "expo-router";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Base_Url = "https://traveazi.onrender.com/api";
axios.defaults.withCredentials = true;


interface AuthStore {
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
  }) => Promise<any>;
  logout: () => Promise<any>;
  userProfile: () => Promise<any>;
  checkAuth: () => Promise<any>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
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
        Toast.show({ type: "success", text1: data?.message || "Valid OTP" });
        console.log("Token:", data?.data.partialToken);
        // router.push('/(auth)/signup')
        return true;
      }

      set({ loading: false });
      Toast.show({ type: "error", text1: "Invalid OTP" });

      // return { statusCode: data?.statusCode};
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
  }) => {
    set({ loading: true });

    const { token } = useAuthStore.getState();
    console.log("Token:", token);

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
      portalType: "DRIVER" }),
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
    console.log("LOGIN RAW RESPONSE:", data);

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
      if(await AsyncStorage.getItem('token')){
        await AsyncStorage.removeItem("token")
      }
    
      if (response.ok && data?.success) {
        set({ loading: false, token: data?.data?.token?.accessToken, user: data?.data?.user  });
        Toast.show({ type: "success", text1: "Logged in" });

        await AsyncStorage.setItem("token", data?.data?.token?.accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(data?.data?.user));

        return true;
      } else {
        set({ user: data?.user, token: data?.token?.accessToken, loading: false });
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
    try {
      const response = await fetch(`${Base_Url}/auth/email/send-otp`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${useAuthStore.getState().token}`,
          "Content-Type": "application/json" },
      });

      const data = await response.json();

    
        Toast.show({ type: "success", text1: data?.message });
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
             useAuthStore.setState({ token: null, user: null });
      
    } catch (error) {
        console.log("Logout failed", error);
           Toast.show({ type: "error", text1: 'An error occure'});
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
    }
  },

}));
