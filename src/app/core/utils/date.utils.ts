export function toDateInput(value: string | undefined | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

export function toDateTimeInput(value: string | undefined | null): string {
  if (!value) return '';
  const [date, time] = value.split('T');
  return `${date}T${time.substring(0, 5)}`;
}
