export type DemoVenue = {
  name: string;
  description: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  image: string;
  // Real photo gallery (local assets). Only set for venues with real photography;
  // venues without it fall back to the generative branded glyph.
  images?: string[];
  addOns: Array<{
    name: string;
    description: string;
    price: number;
  }>;
};

export const demoVenues: DemoVenue[] = [
  {
    name: 'Showroom Fashion Bar',
    description:
      "An avant-garde event space in Barcelona's elegant Sant Gervasi, where neon geometric lighting, a sculptural illuminated bar, and a mirrored runway turn every celebration into a fashion-forward night. The venue unfolds across three connected areas — a welcome GALLERY for receptions, photocalls and product exhibitions, a main hall built for dinners, parties and fashion shows, and a private lounge — pairing immersive design with creative Mediterranean fusion cuisine touched by Thai, Indian and Venezuelan flavors. With professional sound, a DJ booth, panoramic projectors and a glowing dance floor, it hosts everything from birthday parties and galas to corporate presentations and weddings.",
    location: "Carrer d'Alfons XII 8, Barcelona",
    capacity: 250,
    pricePerHour: 300,
    image: '/venues/showroom-fashion-bar/1.jpg',
    images: [
      '/venues/showroom-fashion-bar/1.jpg',
      '/venues/showroom-fashion-bar/2.jpg',
      '/venues/showroom-fashion-bar/3.jpg',
      '/venues/showroom-fashion-bar/4.jpg',
      '/venues/showroom-fashion-bar/5.jpg',
      '/venues/showroom-fashion-bar/6.jpg',
    ],
    addOns: [
      {
        name: 'Mediterranean–Asian fusion menu',
        description:
          'Chef-curated cocktail bites and mains with Thai, Indian, and Venezuelan influences.',
        price: 32,
      },
      {
        name: 'Resident DJ & neon light show',
        description:
          "DJ booth set with panoramic projectors and the venue's signature geometric lighting.",
        price: 460,
      },
      {
        name: 'Runway & photocall styling',
        description: 'Catwalk staging and a branded photocall set in the welcome GALLERY.',
        price: 280,
      },
    ],
  },
  {
    name: 'Catalonia Barcelona Plaza',
    description:
      "A landmark hotel right on Plaça d'Espanya, crowned by its iconic clock façade and 'The Clock Terrace' — a designer rooftop with a pool, Balinese beds and a chill-out lounge offering 360° views over Montjuïc and the square. With 11 fully equipped meeting rooms, the versatile Simultáneo culture-and-leisure space for concerts, afterworks and tastings, and full hotel catering, it hosts everything from milestone birthdays and rooftop cocktail parties to galas, presentations and corporate events in the heart of Barcelona.",
    location: "Plaça d'Espanya 6-8, Barcelona",
    capacity: 400,
    pricePerHour: 360,
    image: '/venues/catalonia-barcelona-plaza/1.jpg',
    images: [
      '/venues/catalonia-barcelona-plaza/1.jpg',
      '/venues/catalonia-barcelona-plaza/2.jpg',
      '/venues/catalonia-barcelona-plaza/3.jpg',
      '/venues/catalonia-barcelona-plaza/4.jpg',
      '/venues/catalonia-barcelona-plaza/5.jpg',
      '/venues/catalonia-barcelona-plaza/6.jpg',
    ],
    addOns: [
      {
        name: 'Rooftop terrace & pool reception',
        description: "Welcome cocktails on 'The Clock Terrace' with skyline and Montjuïc views.",
        price: 38,
      },
      {
        name: 'Hotel banquet catering',
        description: 'Plated dinner or buffet served by the hotel kitchen with wine service.',
        price: 46,
      },
      {
        name: 'Meeting room AV package',
        description: 'Projection, sound, microphones and on-site technical support.',
        price: 320,
      },
    ],
  },
  {
    name: 'Renaissance Barcelona Fira Hotel',
    description:
      "A striking architectural landmark in L'Hospitalet's Plaça d'Europa, beside the Fira convention centre: two 110-metre towers wrapped in a palm-leaf glass façade and joined by a panoramic sky restaurant and rooftop terrace. Inside, a vertical garden of palms and lush greenery rises 105 metres through the central atrium, connecting bridges and galleries. Eleven modular meeting rooms span 1,200 m² with skylights opening onto the garden square, hosting everything from grand galas and weddings to conferences and celebrations for well over a thousand guests.",
    location: "Plaça d'Europa 50-52, L'Hospitalet de Llobregat",
    capacity: 1000,
    pricePerHour: 420,
    image: '/venues/renaissance-barcelona-fira/1.jpg',
    images: [
      '/venues/renaissance-barcelona-fira/1.jpg',
      '/venues/renaissance-barcelona-fira/2.jpg',
      '/venues/renaissance-barcelona-fira/3.jpg',
      '/venues/renaissance-barcelona-fira/4.jpg',
      '/venues/renaissance-barcelona-fira/5.jpg',
      '/venues/renaissance-barcelona-fira/6.jpg',
    ],
    addOns: [
      {
        name: 'Panoramic sky restaurant dinner',
        description: 'Seated dinner in the rooftop restaurant linking the two towers.',
        price: 58,
      },
      {
        name: 'Vertical garden atrium reception',
        description: 'Welcome drinks and canapés beneath the 105 m palm-filled atrium.',
        price: 34,
      },
      {
        name: 'Modular conference package',
        description: 'Configurable meeting rooms with full AV, staging and staffing.',
        price: 520,
      },
    ],
  },
  {
    name: 'Velvet Garden Hall',
    description:
      'An indoor-outdoor celebration hall with floral styling, dancefloor space, and room for a long elegant dinner setup.',
    location: 'Salamanca District',
    capacity: 70,
    pricePerHour: 240,
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      {
        name: 'Garden brunch catering',
        description: 'Seasonal buffet with pastries, fruit, and hot dishes.',
        price: 24,
      },
      {
        name: 'Open bar package',
        description: 'Beer, wine, soft drinks, and standard cocktails.',
        price: 22,
      },
      {
        name: 'Photo corner styling',
        description: 'Custom backdrop, florals, and instant print station.',
        price: 260,
      },
    ],
  },
  {
    name: 'Neon Pulse Loft',
    description:
      'A modern loft built for late-night birthday parties with immersive lighting, sound, and a flexible lounge layout.',
    location: 'Chamberi',
    capacity: 90,
    pricePerHour: 320,
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      {
        name: 'Unlimited soft drinks',
        description: 'Soft drinks and mixers available throughout the event.',
        price: 8,
      },
      {
        name: 'Bottle service setup',
        description: 'Reserved service station and host for premium bottles.',
        price: 340,
      },
      {
        name: 'Late-night snack bar',
        description: 'Mini burgers, fries, and sweets for party peak hour.',
        price: 18,
      },
    ],
  },
  {
    name: 'Emerald Opera Lounge',
    description:
      'A velvet-textured lounge with chandelier lighting and a dramatic stage corner for speeches and toasts.',
    location: 'Retiro',
    capacity: 120,
    pricePerHour: 360,
    image:
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      {
        name: 'Champagne tower service',
        description: 'Ceremonial champagne tower with host presentation.',
        price: 490,
      },
      {
        name: 'Chef stations',
        description: 'Live pasta and carving stations during prime party hours.',
        price: 34,
      },
      {
        name: 'Premium lighting design',
        description: 'Custom ambience scenes matched to party phases.',
        price: 290,
      },
    ],
  },
  {
    name: 'Marble Sky Terrace',
    description:
      'A sophisticated skyline terrace with marble bar and panoramic sunset views for elevated celebrations.',
    location: 'Plaza de Espana',
    capacity: 65,
    pricePerHour: 290,
    image:
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      {
        name: 'Signature cocktail cart',
        description: 'Tableside crafted cocktails for each guest group.',
        price: 18,
      },
      {
        name: 'Canape tasting route',
        description: 'Passing gourmet canapes throughout the event.',
        price: 26,
      },
      {
        name: 'Live sax performance',
        description: 'Two 45-minute curated live sets.',
        price: 380,
      },
    ],
  },
  {
    name: 'Palacio Verde Hall',
    description:
      'A timeless hall inspired by classic salons, ideal for larger birthday nights with formal dinner layouts.',
    location: 'Las Letras',
    capacity: 180,
    pricePerHour: 420,
    image:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      {
        name: 'Grand banquet catering',
        description: 'Three-course plated dinner with premium dessert.',
        price: 42,
      },
      {
        name: 'After-dinner open bar',
        description: 'Cocktails, wine, beer, and premium soft drinks.',
        price: 24,
      },
      {
        name: 'Luxury photo and video',
        description: 'Event coverage with next-day teaser delivery.',
        price: 620,
      },
    ],
  },
  {
    name: 'Noir Secret Garden',
    description:
      'An intimate garden-style venue with dark botanical design, ambient candles, and private-party exclusivity.',
    location: 'Conde Duque',
    capacity: 55,
    pricePerHour: 250,
    image:
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      {
        name: 'Botanical gin bar',
        description: 'Curated botanical menu with premium tonic pairings.',
        price: 20,
      },
      {
        name: 'Late-night dessert atelier',
        description: 'Mini desserts and chocolate tasting corner.',
        price: 16,
      },
      {
        name: 'Ambient violin duo',
        description: 'Live welcome set and dinner transition performance.',
        price: 330,
      },
    ],
  },
  {
    name: 'Azotea Lumen',
    description:
      'A breezy rooftop with golden-hour light, festoon string lighting, and a relaxed lounge layout for stylish daytime-to-night parties.',
    location: 'Malasana',
    capacity: 50,
    pricePerHour: 200,
    image:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      { name: 'Aperitivo welcome cart', description: 'Spritzes and vermouth on arrival for each guest.', price: 14 },
      { name: 'Grazing table', description: 'Mediterranean grazing spread with cheese and charcuterie.', price: 22 },
      { name: 'Golden-hour photographer', description: 'Ninety minutes of candid rooftop coverage.', price: 300 },
    ],
  },
  {
    name: 'Cristal Pavilion',
    description:
      'A glass-walled pavilion flooded with light by day and lit like a jewel box by night — ideal for elegant seated celebrations.',
    location: 'Chamartin',
    capacity: 110,
    pricePerHour: 340,
    image:
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      { name: 'Crystal table styling', description: 'Glassware, candles, and floral runners per table.', price: 30 },
      { name: 'Plated tasting dinner', description: 'Four-course seasonal menu with wine pairing.', price: 48 },
      { name: 'String quartet', description: 'Two curated live sets during arrival and dinner.', price: 460 },
    ],
  },
  {
    name: 'Terracotta Courtyard',
    description:
      'A warm Mediterranean courtyard with terracotta tiles, olive trees, and candlelit corners for intimate, characterful gatherings.',
    location: 'Lavapies',
    capacity: 60,
    pricePerHour: 210,
    image:
      'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      { name: 'Wood-fired tapas station', description: 'Live-fire small plates served throughout the night.', price: 26 },
      { name: 'Sangria & wine bar', description: 'House sangria, regional wines, and soft drinks.', price: 19 },
      { name: 'Flamenco guitar set', description: 'Two atmospheric 40-minute performances.', price: 290 },
    ],
  },
  {
    name: 'Onyx Underground',
    description:
      'A speakeasy-style basement club with deep lighting, a serious sound system, and a dancefloor built for late-night birthdays.',
    location: 'Sol',
    capacity: 140,
    pricePerHour: 300,
    image:
      'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      { name: 'Resident DJ + booth', description: 'Four-hour set with lighting operator.', price: 480 },
      { name: 'Bottle & mixer package', description: 'Reserved table service with premium bottles.', price: 360 },
      { name: 'Midnight snack run', description: 'Sliders, fries, and churros at peak hour.', price: 17 },
    ],
  },
  {
    name: 'Solera Wine Cellar',
    description:
      'A historic vaulted wine cellar with exposed brick and barrel-lined walls — an unforgettable setting for an intimate dinner.',
    location: 'La Latina',
    capacity: 40,
    pricePerHour: 230,
    image:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    addOns: [
      { name: 'Sommelier wine flight', description: 'Guided tasting of five regional wines.', price: 32 },
      { name: 'Cellar dinner menu', description: 'Three-course pairing dinner from the cellar kitchen.', price: 44 },
      { name: 'Private host & service', description: 'Dedicated host for the full evening.', price: 220 },
    ],
  },
];
