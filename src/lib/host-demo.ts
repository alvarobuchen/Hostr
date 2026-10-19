// Illustrative figures for the host dashboard.
//
// A freshly claimed venue has no bookings, so the overview would otherwise show
// three zeroes and an empty list — impossible to demo or design against. These
// stand in until real bookings exist, and the UI labels them "Sample data" so
// they are never mistaken for real earnings.

export type DemoReservation = {
  id: string;
  title: string;
  venueName: string;
  guests: number;
  hours: number;
  status: 'confirmed' | 'pending';
  dateLabel: string;
  timeLabel: string;
  deposit: number;
  depositPaidOn: string;
  total: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

export const DEMO_RESERVATIONS: DemoReservation[] = [
  {
    id: 'demo-1',
    title: "Martina's 30th birthday",
    venueName: 'Showroom Fashion Bar',
    guests: 80,
    hours: 6,
    status: 'confirmed',
    dateLabel: '14 Aug 2026',
    timeLabel: '21:00 – 03:00',
    deposit: 1160,
    depositPaidOn: '2 Aug',
    total: 5800,
    contactName: 'Martina Ferrer',
    contactEmail: 'martina.ferrer@example.com',
    contactPhone: '+34 611 204 887',
  },
  {
    id: 'demo-2',
    title: 'Nordvik product launch',
    venueName: 'Catalonia Barcelona Plaza',
    guests: 140,
    hours: 5,
    status: 'confirmed',
    dateLabel: '22 Aug 2026',
    timeLabel: '19:00 – 00:00',
    deposit: 2340,
    depositPaidOn: '5 Aug',
    total: 11700,
    contactName: 'Elin Nordvik',
    contactEmail: 'events@nordvik.example',
    contactPhone: '+34 622 913 450',
  },
  {
    id: 'demo-3',
    title: 'Aguilar–Roig wedding after-party',
    venueName: 'Showroom Fashion Bar',
    guests: 55,
    hours: 4,
    status: 'pending',
    dateLabel: '5 Sep 2026',
    timeLabel: '23:00 – 03:00',
    deposit: 760,
    depositPaidOn: '28 Jul',
    total: 3800,
    contactName: 'Pau Aguilar',
    contactEmail: 'pau.aguilar@example.com',
    contactPhone: '+34 655 118 302',
  },
];

/** Headline figures + month-over-month movement shown beside each stat. */
export const DEMO_TRENDS = {
  revenue: 24680,
  revenueDelta: '18%',
  upcomingDelta: '12%',
};
