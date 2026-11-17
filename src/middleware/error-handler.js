/**
 * @description Converts a thrown error into a JSON error response using its status, defaulting to 500.
 * @param {Error & {status?: number}} err - The error that was thrown.
 * @param {import('express').Request} req - The Express request.
 * @param {import('express').Response} res - The Express response.
 * @param {import('express').NextFunction} next - The next middleware callback.
 * @returns {void} Nothing; sends the JSON response.
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err.stack);
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
