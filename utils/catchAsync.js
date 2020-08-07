/* eslint-disable promise/no-callback-in-promise */
module.exports = (fn) => {
  return (request, response, next) => fn(request, response, next).catch(next);
};
