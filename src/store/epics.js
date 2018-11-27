import { combineEpics } from 'redux-observable';

import favoriteMovie from './favoriteMovie/epic';
import trendingMovies from './trendingMovies/epic';
import movieDetail from './movieDetail/epic';
import popularMovies from './popularMovies/epic';
import searchMovies from './searchMovies/epic';

export default combineEpics(
  favoriteMovie,
  movieDetail,
  popularMovies,
  trendingMovies,
  searchMovies,
);
