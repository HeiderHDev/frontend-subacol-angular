export const environment = {
  production: true,
  theMovieDB: {
    apiUrl: 'https://api.themoviedb.org/3',
    apiKey: '{{TMDB_API_KEY}}',
    imageBaseUrl: 'https://image.tmdb.org/t/p/',
    imageSizes: {
      poster: 'w500',
      backdrop: 'w1280',
      profile: 'w185',
    },
  },
};
