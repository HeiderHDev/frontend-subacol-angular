import { Result } from './tmdb-response.interface';

export interface MovieRecommendationsResponse {
  page: number;
  results: Result[];
  total_pages: number;
  total_results: number;
}
