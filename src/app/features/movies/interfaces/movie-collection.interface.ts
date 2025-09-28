/**
 * Interface para colecciones de películas
 * Responsabilidad: Definir agrupaciones y colecciones
 */
import { Movie } from './movie.interface';

export interface MovieCollection {
  id: string;
  name: string;
  description: string;
  movies: Movie[];
  createdAt: Date;
  updatedAt: Date;
  isSystem: boolean;
}

export interface MovieCollectionSummary {
  id: string;
  name: string;
  description: string;
  movieCount: number;
  lastUpdated: Date;
  coverImage?: string;
}
