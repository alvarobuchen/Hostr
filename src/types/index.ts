export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  image?: string;
  /** Gallery managed by the host; falls back to `image`, then the branded glyph. */
  images?: string[];
  // Listing terms the host controls from /host/venues/[id]/edit.
  minPrice?: number | null;
  maxHours?: number;
  maxDrinks?: number;
  drinkUnitPrice?: number;
  barraLibrePrice?: number | null;
  cateringPerGuest?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  addOns?: AddOn[];
}

export interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  venueId: string;
  createdAt: Date;
}

export interface Gift {
  id: string;
  title: string;
  description?: string;
  totalPrice: number;
  currency: string;
  targetAmount?: number;
  participantCount?: number;
  eventDate?: Date;
  createdBy: string;
  code: string;
  expiresAt?: Date;
  status: 'open' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  contributions?: GiftContribution[];
  creator?: {
    id: string;
    name?: string | null;
  };
  club?: ClubTicketOption | null;
}

export interface GiftContribution {
  id: string;
  giftId: string;
  userId: string;
  amount: number;
  isPaid: boolean;
  addClubTicket: boolean;
  ticketType?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export interface ClubTicketOption {
  id: string;
  giftId: string;
  clubName: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  date?: Date;
  createdAt: Date;
}
