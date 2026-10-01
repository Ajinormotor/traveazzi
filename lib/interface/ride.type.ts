export interface RidePayload {
  vehicleId: string;
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  originAddress: string;
  destinationAddress: string;
  departureTime: string;
  availableSeats: number;
  // Sent by the backend ride schema but missing here, so the ongoing-ride
  // screen could not read total seat count. ride.schema.ts has both
  // initialSeats and availableSeats (which decrements as bookings land).
  initialSeats?: number;
  pricePerSeat: number;
  preferences: string[];
  status?: string;
  // Optional in ride.schema.ts — populated only if a backend writes it.
  estimatedArrivalTime?: string;
}