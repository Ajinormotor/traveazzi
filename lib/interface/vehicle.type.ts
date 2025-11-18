export interface VehiclePayload {
  _id: string;
  make: string;
  model: string;
  plateNumber: string;
  vehicleVerificationStatus: "VERIFIED" | "NOT_SUBMITTED" | "PENDING" | "REJECTED";
  year: number;
}
