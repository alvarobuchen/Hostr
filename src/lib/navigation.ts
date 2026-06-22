export const navItems = [
  { label: "Explore Venues", href: "/explore", description: "Discovery" },
  { label: "My Invitations", href: "/invitations", description: "RSVP hub" },
  { label: "Budget & Gifts", href: "/budget", description: "Party fund" },
] as const;

export const phases = [
  {
    id: "discovery",
    step: 1,
    title: "Discovery",
    tagline: "Find everything in one place",
    description:
      "Browse and book venues, DJs, and catering for your date — Airbnb-style filters, zero tab-hopping.",
    href: "/explore",
    cta: "Start exploring",
    accent: "from-violet-500 via-fuchsia-500 to-pink-500",
    glow: "shadow-fuchsia-500/25",
    icon: "compass",
  },
  {
    id: "invitation",
    step: 2,
    title: "Invitation",
    tagline: "RSVPs that scale",
    description:
      "A live event page for 50–100 guests — track who's coming, dietary needs, and song requests in real time.",
    href: "/invitations",
    cta: "Manage guests",
    accent: "from-rose-500 via-pink-500 to-orange-400",
    glow: "shadow-rose-500/25",
    icon: "users",
  },
  {
    id: "collection",
    step: 3,
    title: "Collection",
    tagline: "Fund the night together",
    description:
      "Guests chip in when they RSVP — built-in group gifting with a live progress bar, powered by Stripe.",
    href: "/budget",
    cta: "Set up fund",
    accent: "from-cyan-400 via-teal-400 to-emerald-400",
    glow: "shadow-cyan-500/25",
    icon: "wallet",
  },
] as const;
