export function toDateInput(value: string | undefined | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

export function toDateTimeInput(value: string | undefined | null): string {
  if (!value || !value.includes('T')) return '';
  const [date, time] = value.split('T');
  return `${date}T${time.substring(0, 5)}`;
}

export function adjustHours(isoString: string, hours: number): string {
  const date = new Date(isoString);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}
