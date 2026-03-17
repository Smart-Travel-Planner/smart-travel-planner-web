import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    // if (!value) return '';
    // const [year, month, day] = value.split('T')[0].split('-');
    // return `${day}/${month}/${year}`;
    if (!value) return '';
    
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    if (timePart) {
      const [hours, minutes] = timePart.split(':');
      return `${formattedDate} ${hours}:${minutes}`;
    }

    return formattedDate;
  }
}
