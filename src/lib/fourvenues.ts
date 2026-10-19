type FourvenuesTicketPayload = {
  guestName: string;
  guestEmail: string;
  clubName: string;
  eventDate?: string;
  ticketType: string;
  quantity: number;
  referenceCode: string;
};

export async function createFourvenuesTicket(payload: FourvenuesTicketPayload) {
  const apiUrl = process.env.FOURVENUES_API_URL;
  const apiKey = process.env.FOURVENUES_API_KEY;

  if (!apiUrl || !apiKey) {
    return {
      ok: false,
      reason: 'fourvenues_not_configured',
    } as const;
  }

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        ok: false,
        reason: 'fourvenues_api_error',
        message: text,
      } as const;
    }

    const data = await response.json().catch(() => ({}));
    return {
      ok: true,
      data,
    } as const;
  } catch (error) {
    return {
      ok: false,
      reason: 'fourvenues_network_error',
      message: error instanceof Error ? error.message : 'unknown',
    } as const;
  }
}

