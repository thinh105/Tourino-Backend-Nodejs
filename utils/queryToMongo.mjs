export default (query) => {
  const { page, limit, sort, fields, ...filter } = query;
  const mongoQuery = {};

  if (filter) {
    // add $ to match the mongo query
    const filterString = JSON.stringify(filter);
    const mongoFilterQuery = filterString.replaceAll(
      /\b(gte|gt|lte|lt|all|in)\b/g,
      (match) => `$${match}`,
    );

    mongoQuery.filter = JSON.parse(mongoFilterQuery);
  }

  mongoQuery.sort = sort ? sort.split(',').join(' ') : {};

  mongoQuery.fields = fields
    ? fields.split(',').join(' ')
    : '-images -timeline -__v';

  mongoQuery.page = Number.parseInt(page, 10) || 1;

  if (limit) {
    const limitInteger = Number.parseInt(limit, 10);

    // not allow someone get all data at once.
    mongoQuery.limit = limitInteger > 20 ? 20 : limitInteger;
  } else {
    mongoQuery.limit = 10;
  }

  mongoQuery.skip = (mongoQuery.page - 1) * mongoQuery.limit;

  return mongoQuery;
};
