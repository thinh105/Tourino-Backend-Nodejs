module.exports = (data, statusCode, response) => {
  response.status(statusCode).json({
    status: 'success',
    data,
  });
};
