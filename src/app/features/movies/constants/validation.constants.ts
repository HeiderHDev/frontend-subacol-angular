import { Validators } from '@angular/forms';

export const VALIDATION_PATTERNS = {
  URL: /^https?:\/\/.+/,
  TITLE: /^[a-zA-ZÀ-ÿ0-9\s\-\_\:\.\!?,(\)"'&]+$/,
  YOUTUBE_ID: /^[a-zA-Z0-9_-]{11}$/,
} as const;

export const VALIDATION_LIMITS = {
  TITLE: {
    MIN: 2,
    MAX: 100,
  },
  ORIGINAL_TITLE: {
    MIN: 2,
    MAX: 100,
  },
  OVERVIEW: {
    MIN: 10,
    MAX: 500,
  },
  RATING: {
    MIN: 0,
    MAX: 10,
    STEP: 0.1,
  },
  POPULARITY: {
    MIN: 0,
    MAX: 1000,
    STEP: 10,
  },
  RUNTIME: {
    MIN: 1,
    MAX: 600,
  },
  BUDGET: {
    MIN: 0,
    MAX: 1000000000,
  },
  REVENUE: {
    MIN: 0,
    MAX: 10000000000,
  },
  TAGLINE: {
    MIN: 0,
    MAX: 200,
  },
  HOMEPAGE: {
    MIN: 0,
    MAX: 500,
  },
  VIDEO_NAME: {
    MIN: 3,
    MAX: 100,
  },
  VIDEO_KEY: {
    MIN: 11,
    MAX: 11,
  },
} as const;

export const FORM_VALIDATORS = {
  title: [
    Validators.required,
    Validators.minLength(VALIDATION_LIMITS.TITLE.MIN),
    Validators.maxLength(VALIDATION_LIMITS.TITLE.MAX),
    Validators.pattern(VALIDATION_PATTERNS.TITLE),
  ],
  originalTitle: [
    Validators.required,
    Validators.minLength(VALIDATION_LIMITS.ORIGINAL_TITLE.MIN),
    Validators.maxLength(VALIDATION_LIMITS.ORIGINAL_TITLE.MAX),
    Validators.pattern(VALIDATION_PATTERNS.TITLE),
  ],
  overview: [
    Validators.required,
    Validators.minLength(VALIDATION_LIMITS.OVERVIEW.MIN),
    Validators.maxLength(VALIDATION_LIMITS.OVERVIEW.MAX),
  ],
  releaseDate: [Validators.required],
  originalLanguage: [Validators.required],
  genreIds: [Validators.required, Validators.minLength(1)],
  voteAverage: [
    Validators.min(VALIDATION_LIMITS.RATING.MIN),
    Validators.max(VALIDATION_LIMITS.RATING.MAX),
  ],
  popularity: [
    Validators.min(VALIDATION_LIMITS.POPULARITY.MIN),
    Validators.max(VALIDATION_LIMITS.POPULARITY.MAX),
  ],
  posterPath: [],
  backdropPath: [],
  runtime: [
    Validators.min(VALIDATION_LIMITS.RUNTIME.MIN),
    Validators.max(VALIDATION_LIMITS.RUNTIME.MAX),
  ],
  budget: [
    Validators.min(VALIDATION_LIMITS.BUDGET.MIN),
    Validators.max(VALIDATION_LIMITS.BUDGET.MAX),
  ],
  revenue: [
    Validators.min(VALIDATION_LIMITS.REVENUE.MIN),
    Validators.max(VALIDATION_LIMITS.REVENUE.MAX),
  ],
  tagline: [Validators.maxLength(VALIDATION_LIMITS.TAGLINE.MAX)],
  homepage: [
    Validators.maxLength(VALIDATION_LIMITS.HOMEPAGE.MAX),
    Validators.pattern(VALIDATION_PATTERNS.URL),
  ],
  videoName: [
    Validators.required,
    Validators.minLength(VALIDATION_LIMITS.VIDEO_NAME.MIN),
    Validators.maxLength(VALIDATION_LIMITS.VIDEO_NAME.MAX),
  ],
  videoKey: [
    Validators.required,
    Validators.minLength(VALIDATION_LIMITS.VIDEO_KEY.MIN),
    Validators.maxLength(VALIDATION_LIMITS.VIDEO_KEY.MAX),
  ],
} as const;

export const VALIDATION_MESSAGES = {
  title: {
    required: 'El título es requerido',
    minlength: `El título debe tener al menos ${VALIDATION_LIMITS.TITLE.MIN} caracteres`,
    maxlength: `El título no puede exceder ${VALIDATION_LIMITS.TITLE.MAX} caracteres`,
    pattern: 'El título contiene caracteres no válidos',
  },
  originalTitle: {
    required: 'El título original es requerido',
    minlength: `El título original debe tener al menos ${VALIDATION_LIMITS.ORIGINAL_TITLE.MIN} caracteres`,
    maxlength: `El título original no puede exceder ${VALIDATION_LIMITS.ORIGINAL_TITLE.MAX} caracteres`,
    pattern: 'El título original contiene caracteres no válidos',
  },
  overview: {
    required: 'La sinopsis es requerida',
    minlength: `La sinopsis debe tener al menos ${VALIDATION_LIMITS.OVERVIEW.MIN} caracteres`,
    maxlength: `La sinopsis no puede exceder ${VALIDATION_LIMITS.OVERVIEW.MAX} caracteres`,
  },
  releaseDate: {
    required: 'La fecha de estreno es requerida',
    invalidDate: 'La fecha no es válida',
  },
  originalLanguage: {
    required: 'El idioma original es requerido',
  },
  genreIds: {
    required: 'Selecciona al menos un género',
    minlength: 'Selecciona al menos un género',
  },
  voteAverage: {
    min: `La calificación mínima es ${VALIDATION_LIMITS.RATING.MIN}`,
    max: `La calificación máxima es ${VALIDATION_LIMITS.RATING.MAX}`,
  },
  popularity: {
    min: `La popularidad mínima es ${VALIDATION_LIMITS.POPULARITY.MIN}`,
    max: `La popularidad máxima es ${VALIDATION_LIMITS.POPULARITY.MAX}`,
  },
  posterPath: {
    pattern: 'La URL del póster no es válida',
  },
  backdropPath: {
    pattern: 'La URL del backdrop no es válida',
  },
  runtime: {
    min: `La duración mínima es ${VALIDATION_LIMITS.RUNTIME.MIN} minuto`,
    max: `La duración máxima es ${VALIDATION_LIMITS.RUNTIME.MAX} minutos`,
  },
  budget: {
    min: `El presupuesto mínimo es $${VALIDATION_LIMITS.BUDGET.MIN}`,
    max: `El presupuesto máximo es $${VALIDATION_LIMITS.BUDGET.MAX.toLocaleString()}`,
  },
  revenue: {
    min: `La recaudación mínima es $${VALIDATION_LIMITS.REVENUE.MIN}`,
    max: `La recaudación máxima es $${VALIDATION_LIMITS.REVENUE.MAX.toLocaleString()}`,
  },
  tagline: {
    maxlength: `El eslogan no puede exceder ${VALIDATION_LIMITS.TAGLINE.MAX} caracteres`,
  },
  homepage: {
    maxlength: `La página web no puede exceder ${VALIDATION_LIMITS.HOMEPAGE.MAX} caracteres`,
    pattern: 'La URL de la página web no es válida',
  },
  videoName: {
    required: 'El nombre del video es requerido',
    minlength: `El nombre debe tener al menos ${VALIDATION_LIMITS.VIDEO_NAME.MIN} caracteres`,
    maxlength: `El nombre no puede exceder ${VALIDATION_LIMITS.VIDEO_NAME.MAX} caracteres`,
  },
  videoKey: {
    required: 'El ID del video de YouTube es requerido',
    minlength: `El ID debe tener exactamente ${VALIDATION_LIMITS.VIDEO_KEY.MIN} caracteres`,
    maxlength: `El ID debe tener exactamente ${VALIDATION_LIMITS.VIDEO_KEY.MAX} caracteres`,
  },
} as const;
