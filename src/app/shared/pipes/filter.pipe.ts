import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
  pure: true,
})
export class FilterPipe implements PipeTransform {
  transform<T>(array: T[], callback: (item: T) => boolean): T[] {
    if (!array || !callback) {
      return array || [];
    }
    return array.filter(callback);
  }
}
