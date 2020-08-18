module.exports = function (query) {
  const { page, limit, sort, fields, ...filter } = query;

  const mongoQuery = {};

  if (filter) {
    // add $ to match the mongo query
    const filterString = JSON.stringify(filter);
    const mongoFilterQuery = filterString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    mongoQuery.filter = JSON.parse(mongoFilterQuery);
  }

  mongoQuery.sort = sort ? sort.split(',').join(' ') : {};

  if (fields) mongoQuery.fields = fields.split(',').join(' ');

  mongoQuery.page = Number.parseInt(page, 10) || 1;
  mongoQuery.limit = Number.parseInt(limit, 10) || 10;
  mongoQuery.skip = (mongoQuery.page - 1) * mongoQuery.limit;

  return mongoQuery;
};
