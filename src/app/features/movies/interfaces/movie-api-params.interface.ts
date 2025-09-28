/**
 * Interface para parámetros de API
 * Responsabilidad: Definir parámetros para llamadas a la API
 */

export interface MovieApiParams {
  page?: number;
  language?: string;
  region?: string;
  include_adult?: boolean;
  primary_release_year?: number;
  sort_by?: string;
}

export interface SearchParams extends MovieApiParams {
  query: string;
}

export interface DiscoverParams extends MovieApiParams {
  with_genres?: string;
  release_date_gte?: string;
  release_date_lte?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
}
