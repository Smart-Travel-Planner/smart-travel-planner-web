import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    const [year, month, day] = value.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }
}
