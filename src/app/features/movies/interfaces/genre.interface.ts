/**
 * Interface para géneros de películas
 * Responsabilidad: Definir la estructura de géneros
 */

export interface Genre {
  id: number;
  name: string;
}

export interface GenreResponse {
  genres: Genre[];
}
