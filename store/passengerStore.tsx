import { create } from "zustand";
import { useAuthStore } from "./authStore";
import axios from "axios";
import Toast from "react-native-toast-message";

const Base_Url =
  process.env.EXPO_PUBLIC_API_URL ?? "https://traveazi.onrender.com/api";


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
  getMyBookings: (options?: { silent?: boolean }) => Promise<any>;
  submitRating: (bookingId: string, score: number, comment?: string) => Promise<any>;
  payBookings: (id: string) => Promise<any>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  endBooking: (bookingId: string) => Promise<boolean>;
  closeRide: (rideId: string) => Promise<boolean>;
  bookings: string[];
  favorites: any[];
  getFavoriteDrivers: () => Promise<any[] | null>;
  addFavoriteDriver: (driverId: string) => Promise<boolean>;
  removeFavoriteDriver: (driverId: string) => Promise<boolean>;
}

export const usePassengerStore = create<PassengerState>((set, get) => ({
    loading: false,
    bookings: [],
    favorites: [],

     getMyBookings: async (options) => {
      set({ loading: true });
      try {
        const token = useAuthStore.getState().token;

        const response = await axios.get(`${Base_Url}/passenger/bookings?order=DESC&limit=20`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const list = response.data?.data ?? [];
        set({ bookings: list, loading: false });
        return list;
      } catch (error: any) {
        console.error("Error fetching my bookings:", error?.response?.data || error);
        // polled callers (e.g. transitRide's 5s loop) pass silent so a
        // transient failure doesn't spam toasts; one-shot callers still surface it
        if (!options?.silent) {
          Toast.show({
            type: "error",
            text1: "Failed to fetch bookings",
          });
        }
        set({ loading: false });
        return [];
      }
    },

    endBooking: async (bookingId) => {
    try {
      const token = useAuthStore.getState().token;

      await axios.patch(
        `${Base_Url}/passenger/bookings/${bookingId}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Keep the cached list honest so Manage Ride stops offering to end again.
      const list = await get().getMyBookings({ silent: true });
      return Boolean(list);
    } catch (error: any) {
      console.error("Error ending booking:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message ?? "Failed to end trip",
      });
      return false;
    }
  },

  /**
   * Close out a finished trip at the ride level.
   *
   * This is the call the End Ride button makes. It replaces the plain
   * endBooking call, which could not succeed: the driver confirms delivery
   * first, so the booking was already COMPLETED by the time the passenger
   * pressed it, and the old endpoint rejected that as a conflict. The ride
   * endpoint is idempotent and is what actually lets the ride reach COMPLETED.
   */
  closeRide: async (rideId) => {
    try {
      const token = useAuthStore.getState().token;

      await axios.patch(
        `${Base_Url}/rides/${rideId}/close`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Keep the cached booking list honest so Manage Ride stops offering to
      // end a trip that is now closed.
      await get().getMyBookings({ silent: true });
      return true;
    } catch (error: any) {
      console.error("Error closing ride:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message ?? "Failed to end trip",
      });
      return false;
    }
  },

  submitRating: async (bookingId, score, comment) => {
      set({ loading: true });
      try {
        const token = useAuthStore.getState().token;

        const response = await axios.post(`${Base_Url}/ratings`, { bookingId, score, comment }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        set({ loading: false });
        Toast.show({
          type: "success",
          text1: response.data?.message || "Thanks for rating your driver!",
        });
        return true;
      } catch (error: any) {
        console.error("Error submitting rating:", error?.response?.data || error);
        Toast.show({
          type: "error",
          text1: error.response?.data?.message || "Failed to submit rating",
        });
        set({ loading: false });
        return false;
      }
    },

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
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ loading: false });
      return (response.data?.data ?? {}) as {
        authorization_url?: string;
        reference?: string;
        access_code?: string;
      };
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? 'Payment initialization failed',
      });
      set({ loading: false });
      return null;
    }
  },

  cancelBooking: async (bookingId: string) => {
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.patch(
        `${Base_Url}/passenger/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Toast.show({
        type: 'success',
        text1: response.data?.message ?? 'Booking cancelled',
      });
      return true;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? 'Failed to cancel booking',
      });
      return false;
    }
  },

  getFavoriteDrivers: async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.get(`${Base_Url}/passenger/favorite-drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = response.data?.data ?? [];
      set({ favorites: list });
      return list;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? 'Failed to load favorites',
      });
      return null;
    }
  },

  addFavoriteDriver: async (driverId: string) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.post(
        `${Base_Url}/passenger/favorite-drivers`,
        { driverId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Toast.show({ type: 'success', text1: 'Driver added to favorites' });
      return true;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? 'Failed to add favorite',
      });
      return false;
    }
  },

  removeFavoriteDriver: async (driverId: string) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${Base_Url}/passenger/favorite-drivers/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast.show({ type: 'success', text1: 'Driver removed from favorites' });
      return true;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? 'Failed to remove favorite',
      });
      return false;
    }
  },


}))