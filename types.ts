
export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL'
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export enum UserRole {
  PUBLIC = 'PUBLIC',
  BODA = 'BODA',
  TAXI = 'TAXI',
  LOGISTICS = 'LOGISTICS',
  NGO = 'NGO',
  ADMIN = 'ADMIN'
}

export interface Station {
  id: string;
  name: string;
  city: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  petrolPrice: number;
  dieselPrice: number;
  availability: AvailabilityStatus;
  lastUpdated: string;
  company: string;
}

export interface PriceUpdate {
  id: string;
  stationId: string;
  userId: string;
  userName: string;
  petrolPrice: number;
  dieselPrice: number;
  status: AvailabilityStatus;
  timestamp: string;
  isApproved: boolean;
}

export interface Subscription {
  cities: string[];
  fuelTypes: FuelType[];
  significantChangeOnly: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptions?: Subscription;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'PRICE_ALERT' | 'NEW_STATION' | 'SYSTEM';
  isRead: boolean;
  stationId?: string;
}

export interface PriceHistory {
  date: string;
  avgPetrol: number;
  avgDiesel: number;
}
