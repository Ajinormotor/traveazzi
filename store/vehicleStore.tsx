import axios from "axios";
import { create } from "zustand";

const API_URL = 'https://traveazi.onrender.com/api/vehicles'; // adjust to correct endpoint
axios.defaults.withCredentials = true;


interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  [key: string]: any; 
}

interface VehicleStore {
  vehicles: Vehicle[];
  loading: boolean;
  getAllVehicle: () => Promise<void>;
  createVehicle: (newVehicle: Partial<Vehicle>) => Promise<void>;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: [],
  loading: false,

  getAllVehicle: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}`);
      set({ vehicles: response.data || [], loading: false });
    } catch (error: any) {
      console.error("getVehicles Error:", error.message);
      set({ loading: false });
    }
  },

  createVehicle: async (newVehicle) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_URL}`, newVehicle);
      set((state) => ({
        vehicles: [...state.vehicles, response.data],
        loading: false,
      }));
    } catch (error: any) {
      console.error("createVehicle Error:", error.message);
      set({ loading: false });
    }
  },
}));
