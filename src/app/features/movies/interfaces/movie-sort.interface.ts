export type SortOption =
  | 'title_asc'
  | 'title_desc'
  | 'rating_asc'
  | 'rating_desc'
  | 'release_date_asc'
  | 'release_date_desc'
  | 'personal_rating_asc'
  | 'personal_rating_desc'
  | 'popularity_asc'
  | 'popularity_desc';

export interface SortConfig {
  option: SortOption;
  direction: 'asc' | 'desc';
}
