import Tour from '../models/tourModel.mjs';
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  getDistinctValueAndCount,
} from '../utils/handlerFactory.mjs';

export const getAllTours = getAll(Tour);
export const getTour = getOne(Tour, {
  // populate: { path: 'reviews' },
});

export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

export const getTourBySlug = getOne(Tour, {
  query: 'slug', // { slug: request.params.slug },
});

export const getDestinationsAndCount = getDistinctValueAndCount(
  Tour,
  'destinations',
);

export const getTravelStyleAndCount = getDistinctValueAndCount(
  Tour,
  'travelStyle',
);

export function aliasTopFiveTours(request, response, next) {
  request.query.limit = '5';
  request.query.sort = '-rating,price,-duration';
  request.query.fields = 'name,price,rating,summary, duration';
  next();
}
