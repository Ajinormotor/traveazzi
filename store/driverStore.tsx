// store/useDriverRide.ts
import axios from "axios";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import { useAuthStore } from "./authStore";


const Base_Url = "https://traveazi.onrender.com/api";
axios.defaults.withCredentials = true;


interface RidePayload {
  vehicleId: string;
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  originAddress: string;
  destinationAddress: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  preferences: string[];
}

export interface VehiclePayload {
  make: string,
  model: string,
  year: number,
  color: string,
  plateNumber: string,
  seatsAvailable: number,
  features: string[]
}

interface RideState {
  loading: boolean;
  rides: string[];
  vehicles: any;
  createRide: (rideData: RidePayload) => Promise<void>;
  getAllRides: () => Promise<any>
  singleRides: (id: string) => Promise<any>
  startRides: (id: string) => Promise<any>
  getRideBySearch: () => Promise<any>
  addVehicle: (vehicelData: VehiclePayload) => Promise<void>
  allVehicle: () => Promise<any>
  getPassengerRides: (id: string) => Promise<any> 
  acceptPassengerRides: (id: string) => Promise<any>     
   rejectPassengerRides: (id: string) => Promise<any>   
     cancelBookIngRide: (id: string) => Promise<any> 
       completeBookingRide: (id: string) => Promise<any>     

}

export const useDriverRideStore = create<RideState>((set) => ({
  loading: false,
  rides: [],
  vehicles:[],

  createRide: async (rideData) => {
    set({ loading: true });
    try {
        const token = useAuthStore.getState().token;
      // console.log('Create ride', token)

      const response = await axios.post(`${Base_Url}/rides`, rideData, {

        headers: {
           Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" },
      });

      Toast.show({
        type: "success",
        text1: "Ride created successfully",
      });
      set({loading: false})

      console.log("Ride Created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating ride:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to create ride",
      });
      set({ loading: false})
    } finally {
      set({ loading: false });
    }
  },

  
  getAllRides: async () => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;

      const response = await axios.get(`${Base_Url}/rides`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ rides: response.data.data, loading: false });

      console.log("Get all Rides:", response.data.data);
  
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching rides:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch rides",
      });
      set({ loading: false });
    }
  },

   singleRides: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;

      const response = await axios.get(`${Base_Url}/rides/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ rides: response.data.data, loading: false });

      // console.log("Fetched Single Rides:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching rides:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch rides",
      });
      set({ loading: false });
    }
  },
   startRides: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      // console.log('Start ride token', token)

      const response =await axios.patch(
  `${Base_Url}/rides/${id}/start`,
  {}, // No body
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      Toast.show({
        type: "success",    
        text1: "Ride started successfully",
      });
      set({ loading: false });

      console.log("Starts Rides:", response.data.rides);
      return {success: true}
     
    } catch (error: any) {
      console.error("Error starting rides:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to start rides",
      });
      set({ loading: false });
    }
  },
  getRideBySearch: async() => {
       set({ loading: true });
    try {
      const response = await axios.get(`${Base_Url}/rides/search`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
    set({ rides: response.data?.data })
    console.log('Searched result:', response.data.data)



    } catch (error: any) {
      console.error("Error creating ride:", error?.response?.data || error);
    } finally {
      set({ loading: false });
    }

  },

  addVehicle : async (vehicleData) => {

        set({ loading: true });
    try {

      const token = useAuthStore.getState().token;
      // console.log('Add vehicle', token)

       const response = await axios.post(`${Base_Url}/driver/vehicles/register`, vehicleData ,{
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization : `Bearer ${token}`
         },
      });
            set({ loading: false });

        Toast.show({
        type: "success",
        text1: "Vehicle created",
      });

  } catch (error: any) {
      console.error("Error creating ride:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: error?.response?.data || error,
      });
        set({ loading: false });
      
    } finally {
      set({ loading: false });
    }

  },

  allVehicle: async () => {
  set({ loading: true });
  try {

     const accessToken = useAuthStore.getState().token;
    // console.log("Access Token:", accessToken);
     

    const response = await axios.get(`${Base_Url}/driver/profile-status`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // console.log("Vehicle Data:", response?.data?.data);
    set({ vehicles: response?.data?.data.vehicles });
  } catch (error: any) {
    console.error("Error fetching vehicle:", error?.response?.data || error);
  } finally {
    set({ loading: false });
  }
  },

  getPassengerRides: async (id) => {      
    set({ loading: true });
    try {   
      const token = useAuthStore.getState().token;

      const response = await axios.get(`${Base_Url}/driver/rides/${id}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ loading: false });

      // console.log("Fetched Passenger Rides:", response.data);
      return { data: response.data };
    } catch (error: any) {    
      console.error("Error fetching passenger rides:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch passenger rides",
      });
      set({ loading: false });
    } 
  },
  acceptPassengerRides: async (id) => {      
    set({ loading: true });
    try {   
      const token = useAuthStore.getState().token;

      const response =await axios.patch(`${Base_Url}/driver/bookings/${id}/confirm`, {}, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


      set({ loading: false });
       Toast.show({
        type: "success",
        text1: "Ride accepted successfully",
      });
      // console.log('Accepted token:', token)
      return { data: response.data };
    } catch (error: any) {    
      console.error("Error accepting passenger rides:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to accept passenger rides",
      });
      set({ loading: false });
    } 
  },
  rejectPassengerRides: async (id) => {      
    set({ loading: true });
    try {   
      const token = useAuthStore.getState().token;

      const response = await axios.patch(`${Base_Url}/driver/bookings/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ loading: false });
       Toast.show({
        type: "success",
        text1: "Ride rejected",
      });
      //  console.log('Rejected token:', token)
      return { data: response.data };
           
    } catch (error: any) {    
      console.error("Error rejecting passenger rides:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to reject passenger rides",
      });
      set({ loading: false });
    } 
  },
  cancelBookIngRide: async (id) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;

      const response = await axios.patch(`${Base_Url}/driver/bookings/${id}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ loading: false });
       Toast.show({
        type: "success",
        text1: "Ride cancelled successfully",
      });
      return { data: response.data };
    } catch (error: any) {
      console.error("Error cancelling ride:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to cancel ride",
      });
      set({ loading: false });
    }
  },
  completeBookingRide: async (id) => {      
    set({ loading: true });
    try {   
      const token = useAuthStore.getState().token;

      const response = await axios.patch(`${Base_Url}/driver/bookings/${id}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ loading: false });
       Toast.show({
        type: "success",
        text1: "Ride completed successfully",
      });
      return { data: response.data };
    } catch (error: any) {    
      console.error("Error completing passenger rides:", error?.response?.data || error);
      Toast.show({
        type: "error",
        text1: "Failed to complete passenger rides",
      });
      set({ loading: false });
    } 
  }

})


);
