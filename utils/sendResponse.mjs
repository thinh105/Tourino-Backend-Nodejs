export default (data, statusCode, response) => {
  response.status(statusCode).json({
    status: 'success',
    data,
  });
};
