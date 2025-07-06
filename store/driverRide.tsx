// store/useDriverRide.ts
import axios from "axios";
import Toast from "react-native-toast-message";
import { create } from "zustand";

const Base_Url = "https://traveazi.onrender.com/api";
axios.defaults.withCredentials = true;


interface RidePayload {
  vehicleId: string;
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  originAddress: string;
  destinationAddress: string;
  departureTime: string;
  pricePerSeat: number;
  preferences: string[];
}
interface VehiclePayload {
  make: string,
  model: string,
  year: string,
  color: string,
  plateNumber: string,
  seatsAvailable: string,
  features: string
}

interface RideState {
  loading: boolean;
  rides: any;
  createRide: (rideData: RidePayload) => Promise<void>;
  getRide: () => Promise<any>
}

export const useDriverRide = create<RideState>((set) => ({
  loading: false,
  rides: [],

  createRide: async (rideData) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${Base_Url}/rides`, rideData, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      Toast.show({
        type: "success",
        text1: "Ride created successfully",
      });

      console.log("Ride Created:", response.data);
    } catch (error: any) {
      console.error("Error creating ride:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to create ride",
      });
    } finally {
      set({ loading: false });
    }
  },
  getRide: async() => {
       set({ loading: true });
    try {
      const response = await axios.get(`${Base_Url}/rides/search`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
    set({ rides: response.data?.data })



    } catch (error: any) {
      console.error("Error creating ride:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to create ride",
      });
    } finally {
      set({ loading: false });
    }

  },

  addVehicle : async () => {

        set({ loading: true });
    try {

       const response = await axios.post(`${Base_Url}/driver/vehicles/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

  } catch (error: any) {
      console.error("Error creating ride:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to create ride",
      });
    } finally {
      set({ loading: false });
    }

})



);
