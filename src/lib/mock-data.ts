export const dashboardStats = [
  { label: "RSVPs confirmed", value: "48", suffix: "/ 72", trend: "+12 today" },
  { label: "Party fund", value: "€340", suffix: "/ €500", trend: "68% funded" },
  { label: "Vendors booked", value: "3", suffix: "/ 5", trend: "Venue · DJ · Catering" },
] as const;

export const upcomingEvent = {
  title: "Sofia's 18th",
  date: "14 Jul 2026",
  location: "Madrid",
  daysLeft: 22,
} as const;
