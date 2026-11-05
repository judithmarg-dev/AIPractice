function generateSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = []
  for (let h = startHour; h <= endHour; h++) {
    for (const m of [0, 30]) {
      if (h === endHour && m === 30) break
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

export const TIME_SLOTS: string[] = generateSlots(10, 21)
