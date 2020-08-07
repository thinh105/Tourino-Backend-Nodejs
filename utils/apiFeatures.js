class APIFeatures {
  constructor(query, requestQuery) {
    this.query = query;
    this.requestQuery = requestQuery;
  }

  filter() {
    const filterQueryObject = { ...this.requestQuery };

    // remove fields for another features below
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((element) => delete filterQueryObject[element]);

    const filterQueryString = JSON.stringify(filterQueryObject);

    const mongoFilterQueryString = filterQueryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    ); // add $ to match the mongo query

    const mongoFilterQueryObject = JSON.parse(mongoFilterQueryString);

    this.query = this.query.find(mongoFilterQueryObject);

    return this;
  }

  sort() {
    if (this.requestQuery.sort) {
      const sortBy = this.requestQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy); // sort is the Mongoose method
    } else {
      this.query = this.query.sort('-ratingsAverage');
    }

    return this;
  }

  selectFields() {
    if (this.requestQuery.fields) {
      const fields = this.requestQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = Number.parseInt(this.requestQuery.page, 10) || 1;
    const limit = Number.parseInt(this.requestQuery.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
