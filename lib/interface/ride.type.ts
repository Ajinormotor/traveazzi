export interface RidePayload {
  vehicleId: string;
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  originAddress: string;
  destinationAddress: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  preferences: string[];
  status?: string;
}