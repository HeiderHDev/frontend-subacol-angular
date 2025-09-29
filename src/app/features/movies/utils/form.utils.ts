import { AbstractControl, FormGroup } from '@angular/forms';
import { VALIDATION_MESSAGES } from '../constants/validation.constants';

export class FormUtils {
  /**
   * Obtiene el mensaje de error apropiado para un campo
   */
  static getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);

    if (!field?.errors || !field?.touched) {
      return null;
    }

    const errors = field.errors;
    const messages =
      VALIDATION_MESSAGES[fieldName as keyof typeof VALIDATION_MESSAGES];

    if (!messages) {
      return 'Campo inválido';
    }

    const errorPriority = [
      'required',
      'minlength',
      'maxlength',
      'pattern',
      'min',
      'max',
    ];

    for (const errorType of errorPriority) {
      if (errors[errorType]) {
        return messages[errorType as keyof typeof messages] || 'Campo inválido';
      }
    }

    return null;
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  static hasFieldError(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field?.errors && field?.touched);
  }

  /**
   * Verifica si un campo es válido y ha sido tocado
   */
  static isFieldValid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field?.valid && field?.touched);
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  static markAllFieldsAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markAllFieldsAsTouched(control);
        }
      }
    });
  }

  /**
   * Valida que una fecha no sea futura (para películas)
   */
  static dateNotInFuture(
    control: AbstractControl
  ): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      return { futureDate: { value: control.value } };
    }

    return null;
  }

  /**
   * Valida que una fecha no sea demasiado antigua (opcional)
   */
  static dateNotTooOld(
    control: AbstractControl
  ): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const minimumDate = new Date('1888-01-01');

    if (selectedDate < minimumDate) {
      return { tooOldDate: { value: control.value } };
    }

    return null;
  }

  /**
   * Valida que al menos un género esté seleccionado
   */
  static atLeastOneGenre(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const value = control.value;

    if (!Array.isArray(value) || value.length === 0) {
      return { noGenreSelected: true };
    }

    return null;
  }

  /**
   * Limpia y formatea el texto de entrada (solo para títulos)
   */
  static sanitizeText(text: string): string {
    if (!text) return '';

    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Formatea una fecha para mostrar
   */
  static formatDate(date: Date | string): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Formatea un array de géneros para mostrar
   */
  static formatGenres(genres: Array<{ id: number; name: string }>): string {
    return genres.map((g) => g.name).join(', ');
  }

  /**
   * Valida si una URL es válida (opcional, más estricta)
   */
  static isValidUrl(url: string): boolean {
    if (!url) return true;

    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Genera un ID único para nuevas películas
   */
  static generateUniqueId(): number {
    return -Date.now();
  }

  /**
   * Valida que el rating esté en el rango correcto
   */
  static validateRating(rating: number): boolean {
    return rating >= 0 && rating <= 10;
  }

  /**
   * Redondea el rating a un decimal
   */
  static roundRating(rating: number): number {
    return Math.round(rating * 10) / 10;
  }

  /**
   * Obtiene todos los errores del formulario para debugging
   */
  static getAllFormErrors(form: FormGroup): any {
    const errors: any = {};
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  /**
   * Valida URLs de manera más flexible (Pinterest, etc.)
   */
  static isValidImageUrl(url: string): boolean {
    if (!url) return true;

    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const imageExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.svg',
      ];

      if (!validProtocols.includes(urlObj.protocol)) {
        return false;
      }

      const hostname = urlObj.hostname.toLowerCase();
      const pinterestDomains = ['pinterest.com', 'pinimg.com', 'i.pinimg.com'];
      const imageDomains = [
        'imgur.com',
        'i.imgur.com',
        'unsplash.com',
        'images.unsplash.com',
      ];

      if (
        pinterestDomains.some((domain) => hostname.includes(domain)) ||
        imageDomains.some((domain) => hostname.includes(domain))
      ) {
        return true;
      }

      const pathname = urlObj.pathname.toLowerCase();
      return imageExtensions.some((ext) => pathname.includes(ext));
    } catch {
      return false;
    }
  }

  /**
   * Extrae ID de YouTube de diferentes formatos de URL
   */
  static extractYouTubeId(url: string): string | null {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(url);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }

  /**
   * Formatea números como moneda
   */
  static formatCurrency(value: number, locale: string = 'es-ES'): string {
    if (!value || value === 0) return 'No especificado';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Formatea duración en minutos a formato legible
   */
  static formatDuration(minutes: number): string {
    if (!minutes || minutes <= 0) return '';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  }

  /**
   * Calcula el progreso del formulario basado en campos requeridos
   */
  static calculateFormProgress(
    form: FormGroup,
    requiredFields: string[]
  ): number {
    if (!form || requiredFields.length === 0) return 0;

    let completedFields = 0;

    requiredFields.forEach((fieldName) => {
      const control = form.get(fieldName);
      if (control?.value) {
        if (fieldName === 'genreIds') {
          completedFields +=
            Array.isArray(control.value) && control.value.length > 0 ? 1 : 0;
        } else if (typeof control.value === 'string') {
          completedFields += control.value.trim().length > 0 ? 1 : 0;
        } else {
          completedFields += 1;
        }
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  /**
   * Genera sugerencias de mejora para el formulario
   */
  static getFormSuggestions(form: FormGroup): string[] {
    const suggestions: string[] = [];

    if (!form.get('posterPath')?.value) {
      suggestions.push(
        'Agrega una imagen de póster para hacer tu película más atractiva'
      );
    }

    if (!form.get('tagline')?.value) {
      suggestions.push('Un eslogan pegadizo ayudará a describir tu película');
    }

    const runtime = form.get('runtime')?.value;
    if (!runtime || runtime < 60) {
      suggestions.push(
        'Considera especificar una duración realista (60+ minutos)'
      );
    }

    const budget = form.get('budget')?.value;
    if (!budget || budget === 0) {
      suggestions.push(
        'Agrega información de presupuesto para completar los detalles'
      );
    }

    return suggestions;
  }
}
