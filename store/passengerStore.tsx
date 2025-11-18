import { create } from "zustand";
import { useAuthStore } from "./authStore";
import axios from "axios";
import Toast from "react-native-toast-message";

const Base_Url = "https://traveazi.onrender.com/api";
axios.defaults.withCredentials = true;


interface RequestPayload {
  rideId: string;   
  seatsNeeded: string;
  pickupAddress: string;
  dropoffAddress: string;
}

interface PassengerState {
  loading: boolean; 
  getAllBookings: () => Promise<any>;
  requestBookings: (payload: RequestPayload) => Promise<any>;
  getPassengerBookings: (id: string) => Promise<any>;
  payBookings: (id: string) => Promise<any>;
  bookings: string[];
}

export const usePassengerStore = create<PassengerState>((set) => ({
    loading: false,
    bookings: [],

     getAllBookings: async () => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;

      const response = await axios.get(`${Base_Url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ bookings: response.data.data, loading: false });

      // console.log("Fetched Rides:", response.data.rides);
      return response.data.rides;
      
    } catch (error: any) {
      // console.error("Error fetching rides:", error?.response?.data || error);
      // Toast.show({
      //   type: "error",
      //   text1: "Failed to fetch rides",
      // });
      set({ loading: false });
    }
  },

    getPassengerBookings: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;

      const response = await axios.get(`${Base_Url}/driver/rides/${id}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ loading: false });

      // console.log("Fetched Rides:", response?.data);
      return response?.data;
      
    } catch (error: any) {
      // console.error("Error fetching rides:",
      //    error?.response?.data || error);
      // Toast.show({
      //   type: "error",
      //   text1: "Failed to fetch rides",
      // });
      set({ loading: false });
    }
  },

requestBookings: async (payload) => {
  set({ loading: true });
  try {
    const token = useAuthStore.getState().token;

    const response = await axios.post(`${Base_Url}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    set({ bookings: response.data.data, loading: false });

    Toast.show({
      type: "success",
      text1: response.data.message || "Booking successful",
    });

    return response.data.data; // keep this consistent
  } catch (error: any) {
    console.error("Error requesting rides:", error?.response?.data || error);
    Toast.show({
      type: "error",
      text1: error.response?.data?.message || "Failed to request ride",
    });
    set({ loading: false });
  }
},

  payBookings: async (bookingId: string) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;

      const response = await axios.post(`${Base_Url}/passenger/bookings/${bookingId}/pay`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ loading: false });
      Toast.show({
        type: "success",
        text1: "Payment successful",
      });
      return response.data;
    } catch (error: any) {
      console.error("Error processing payment:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Payment failed",
      });
      set({ loading: false });
    }
  } 


}))