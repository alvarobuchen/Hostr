import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Contribution = {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
};

export type Gift = {
  id: string;
  code: string;
  title: string;
  description?: string;
  totalPrice: number;
  participantCount: number;
  eventDate?: string;
  clubName?: string;
  clubTicketPrice?: number;
  contributions: Contribution[];
};

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const seed: Gift[] = [
  {
    id: 'g1',
    code: 'LUCIA24',
    title: 'Birthday surprise for Lucía',
    description: 'Group gift + Shoko afterparty tickets for the whole crew.',
    totalPrice: 1800,
    participantCount: 12,
    eventDate: '2026-08-15',
    clubName: 'Shoko',
    clubTicketPrice: 35,
    contributions: [
      { id: 'c1', name: 'Ana', amount: 150, createdAt: '2026-07-10' },
      { id: 'c2', name: 'Carlos', amount: 150, createdAt: '2026-07-11' },
      { id: 'c3', name: 'María', amount: 120, createdAt: '2026-07-12' },
      { id: 'c4', name: 'Jorge', amount: 150, createdAt: '2026-07-14' },
      { id: 'c5', name: 'Sofía', amount: 180, createdAt: '2026-07-15' },
    ],
  },
  {
    id: 'g2',
    code: 'MARCOS7',
    title: "Marco's farewell dinner",
    description: 'Sending Marco off to Lisbon in style — dinner at Cristal Pavilion.',
    totalPrice: 900,
    participantCount: 9,
    eventDate: '2026-09-02',
    contributions: [
      { id: 'c6', name: 'Elena', amount: 100, createdAt: '2026-07-18' },
      { id: 'c7', name: 'Pablo', amount: 100, createdAt: '2026-07-19' },
    ],
  },
];

type Ctx = {
  gifts: Gift[];
  getByCode: (code: string) => Gift | undefined;
  createGift: (input: {
    title: string;
    description?: string;
    totalPrice: number;
    participantCount: number;
    eventDate?: string;
    clubName?: string;
    clubTicketPrice?: number;
  }) => Gift;
  contribute: (code: string, name: string, amount: number) => void;
};

const GiftsContext = createContext<Ctx | null>(null);

export function GiftsProvider({ children }: { children: ReactNode }) {
  const [gifts, setGifts] = useState<Gift[]>(seed);

  const getByCode = useCallback(
    (code: string) => gifts.find((g) => g.code.toUpperCase() === code.toUpperCase()),
    [gifts],
  );

  const createGift: Ctx['createGift'] = useCallback((input) => {
    const gift: Gift = {
      id: `g${Date.now()}`,
      code: makeCode(),
      contributions: [],
      ...input,
    };
    setGifts((prev) => [gift, ...prev]);
    return gift;
  }, []);

  const contribute: Ctx['contribute'] = useCallback((code, name, amount) => {
    setGifts((prev) =>
      prev.map((g) =>
        g.code.toUpperCase() === code.toUpperCase()
          ? {
              ...g,
              contributions: [
                ...g.contributions,
                {
                  id: `c${Date.now()}`,
                  name: name || 'Guest',
                  amount,
                  createdAt: new Date().toISOString().slice(0, 10),
                },
              ],
            }
          : g,
      ),
    );
  }, []);

  return (
    <GiftsContext.Provider value={{ gifts, getByCode, createGift, contribute }}>
      {children}
    </GiftsContext.Provider>
  );
}

export function useGifts() {
  const ctx = useContext(GiftsContext);
  if (!ctx) throw new Error('useGifts must be used within GiftsProvider');
  return ctx;
}

export function paidTotal(g: Gift) {
  return g.contributions.reduce((s, c) => s + c.amount, 0);
}
