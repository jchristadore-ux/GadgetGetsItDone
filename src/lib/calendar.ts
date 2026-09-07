export type Slot = { start: Date; end: Date };

export function generateDaySlots(params: {
  day: Date;
  startHour: number;
  endHour: number;
  slotMinutes: number;
  bufferMinutes?: number;
}): Slot[] {
  const slots: Slot[] = [];
  const cursor = new Date(params.day);
  cursor.setHours(params.startHour, 0, 0, 0);
  const end = new Date(params.day);
  end.setHours(params.endHour, 0, 0, 0);
  const step = params.slotMinutes + (params.bufferMinutes ?? 0);

  while (cursor < end) {
    const start = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + params.slotMinutes * 60_000);
    if (slotEnd <= end) slots.push({ start, end: slotEnd });
    cursor.setMinutes(cursor.getMinutes() + step);
  }
  return slots;
}

export async function syncToGoogleCalendarStub(event: {
  title: string;
  start: Date;
  end: Date;
  description?: string;
}) {
  if (!process.env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_ENABLED !== "true") {
    return { skipped: true as const };
  }
  console.info("[gcal:stub]", event.title, event.start.toISOString());
  return { skipped: true as const, reason: "stub_only" };
}
