// store/useDriverRide.ts
import axios from "axios";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { RidePayload } from "@/lib/interface/ride.type";


const Base_Url =
  process.env.EXPO_PUBLIC_API_URL ?? "https://traveazi.onrender.com/api";
axios.defaults.withCredentials = true;

type Coords = { lat: number; lng: number };

const isNum = (v: unknown): v is number => {
  if (typeof v === 'number') return Number.isFinite(v);
  // Some deployments hand back coordinates as strings ("6.5244"). Rejecting
  // those made a perfectly good response look like "address not found".
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n);
  }
  return false;
};

// Coerces to a number and reports whether the result is usable, so a numeric
// string still yields a real number rather than falling through the parser.
const toNum = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

// The geocode endpoint has returned more than one envelope over time (flat
// `{lat,lng}`, a Google-style `{results:[{geometry:{location:{lat,lng}}}]}`,
// and a bare array), so a single strict shape check made valid lookups report
// "Could not locate the ... address" even though the request succeeded.
// Walk whatever came back and take the first real coordinate pair.
const pickCoords = (node: any, depth = 0): Coords | null => {
  if (!node || depth > 6) return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = pickCoords(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof node !== 'object') return null;
  if (isNum(node.lat) && isNum(node.lng)) {
    return { lat: toNum(node.lat)!, lng: toNum(node.lng)! };
  }
  if (isNum(node.latitude) && isNum(node.longitude)) {
    return { lat: toNum(node.latitude)!, lng: toNum(node.longitude)! };
  }
  // Mixed naming across the two field pairs: {lat, longitude} / {latitude, lng}.
  const latA = toNum(node.lat ?? node.latitude);
  const lngA = toNum(node.lng ?? node.lon ?? node.longitude);
  if (latA !== null && lngA !== null) return { lat: latA, lng: lngA };
  // Prefer the documented sub-paths before falling back to a blind sweep.
  for (const key of ['location', 'geometry', 'data', 'result', 'results']) {
    if (key in node) {
      const hit = pickCoords(node[key], depth + 1);
      if (hit) return hit;
    }
  }
  for (const value of Object.values(node)) {
    const hit = pickCoords(value, depth + 1);
    if (hit) return hit;
  }
  return null;
};

const extractCoords = (body: any): Coords | null =>
  pickCoords(body?.data ?? body);

// geocodeAddress used to swallow the failure, toast a generic message, and
// return null. Every caller then reported a second, vaguer toast ("Could not
// locate the pickup address"), so the real reason — a 401, a 400 with the
// server's own wording, an empty 200 — was overwritten and never seen.
// It now throws a GeocodeError carrying the actual cause, and the callers
// own the single toast.
export class GeocodeError extends Error {
  userMessage: string;
  status?: number;
  constructor(userMessage: string, status?: number) {
    super(userMessage);
    this.name = 'GeocodeError';
    this.userMessage = userMessage;
    this.status = status;
  }
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
  rides: RidePayload[];
  vehicles: any;
  createRide: (rideData: RidePayload) => Promise<any>;
  getAllRides: () => Promise<any>
  singleRides: (id: string) => Promise<any>
  startRides: (id: string) => Promise<any>
  getRideBySearch: (params: {
    origin: { lat: number; lon: number };
    destination: { lat: number; lon: number };
    departureDate: string;
    seatsNeeded: number;
  }) => Promise<boolean>;
  geocodeAddress: (address: string) => Promise<Coords>;
  autocompleteAddress: (input: string) => Promise<Array<{ description: string; placeId: string }>>;
  addVehicle: (vehicelData: VehiclePayload) => Promise<boolean>
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
    if (!token) {
      // Sent "Bearer null" before, which came back 401 and read as a bad form.
      console.warn('[createRide] no token in store -> refusing to send');
      Toast.show({
        type: "error",
        text1: "Session expired. Please log in again.",
      });
      return false;
    }

    const response = await axios.post(`${Base_Url}/rides`, rideData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    Toast.show({
      type: "success",
      text1: "Ride created successfully",
    });

    console.log("[createRide] OK", JSON.stringify(response.data));
    return true; 
  } catch (error: any) {
    // The old one-liner collapsed a 400 validation body, a 401 and a network
    // failure into the same "Failed to create ride" toast, so the reason was
    // never visible. Report the status and the server's own message.
    const status = error?.response?.status;
    const body = error?.response?.data;
    console.error(
      `[createRide] FAILED status=${status} body=${JSON.stringify(body)} message=${error?.message}`
    );
    if (Array.isArray(body?.message)) {
      console.error('[createRide] validation errors:', JSON.stringify(body.message));
    }
    Toast.show({
      type: "error",
      text1: status ? `Failed to create ride (${status})` : "Failed to create ride",
      text2: Array.isArray(body?.message)
        ? body.message.join(', ')
        : body?.message ?? error?.message ?? undefined,
    });
    return false; 
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

      // console.log("Get all Rides:", response.data.data);
  
      return response.data.data;
    } catch (error: any) {
      // Toast.show({
      //   type: "error",
      //   text1: "Failed to fetch rides",
      // });
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

      // NOTE: intentionally does NOT write to `rides` — that holds the
      // ride LIST for list screens. Overwriting it with a single object
      // red-screens every `.map`/`.filter` consumer (was scheduleResult:115).
      set({ loading: false });

      // console.log("Fetched Single Rides:", response.data.data);
      return response.data.data;
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
  geocodeAddress: async (address) => {
    const trimmed = (address ?? '').trim();
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        // Without this the request went out as the literal "Bearer null" and
        // came back 401, which read as "could not find that address".
        throw new GeocodeError('Your session expired. Please log in again.', 401);
      }

      const response = await axios.get(`${Base_Url}/geolocation/geocode`, {
        params: { address: trimmed },
        headers: { Authorization: `Bearer ${token}` },
      });
      const coords = extractCoords(response.data);
      if (__DEV__) {
        console.log('[geocodeAddress]', trimmed, '->', JSON.stringify(response.data));
      }
      if (!coords) {
        // 200 OK, but nothing coordinate-shaped came back.
        console.warn(
          '[geocodeAddress] NO COORDS in a 200 response for',
          JSON.stringify(trimmed),
          JSON.stringify(response.data)
        );
        throw new GeocodeError(
          response.data?.message ?? `The server returned no location for "${trimmed}".`
        );
      }
      return coords;
    } catch (error: any) {
      if (error instanceof GeocodeError) throw error;

      const status = error?.response?.status;
      const body = error?.response?.data;
      // Failures are logged with the same detail as successes so the two can
      // be compared directly in the Metro console.
      console.warn(
        `[geocodeAddress] FAILED "${trimmed}" status=${status} body=${JSON.stringify(body)}`
      );

      let userMessage = body?.message ?? error?.message ?? 'Could not reach the location service.';
      if (status === 401 || status === 403) {
        userMessage = 'Your session expired. Please log in again.';
      } else if (status === 400) {
        userMessage = body?.message ?? `The server could not find "${trimmed}". Try a fuller address.`;
      } else if (!status) {
        userMessage = 'No connection to the server. Check your network and try again.';
      }
      throw new GeocodeError(userMessage, status);
    }
  },
  autocompleteAddress: async (input) => {
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.get(`${Base_Url}/geolocation/autocomplete`, {
        params: { input },
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = response.data?.data ?? response.data ?? [];
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  },
  getRideBySearch: async (params) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.get(`${Base_Url}/rides/search`, {
        params: {
          'origin[lat]': params.origin.lat,
          'origin[lon]': params.origin.lon,
          'destination[lat]': params.destination.lat,
          'destination[lon]': params.destination.lon,
          departureDate: params.departureDate,
          seatsNeeded: params.seatsNeeded,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ rides: response.data?.data ?? [] });
      return true;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? 'Failed to search rides',
      });
      return false;
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

      return true;

  } catch (error: any) {
      console.error("Error creating ride:", error?.response?.data || error);
      const message =
        error?.response?.data?.message ?? error?.message ?? 'Something went wrong';
      Toast.show({
        type: "error",
        text1: typeof message === 'string' ? message : 'Something went wrong',
      });
        set({ loading: false });
      return false;
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
    Toast.show({
      type: "error",
      text1: "Failed to fetch vehicles",
    });
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
      // Toast.show({
      //   type: "error",
      //   text1: "Failed to fetch passenger rides",
      // });
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
