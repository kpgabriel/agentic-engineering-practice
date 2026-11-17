/**
 * @description Logs the timestamp, method, and URL of each incoming request.
 * @param {import('express').Request} req - The Express request.
 * @param {import('express').Response} res - The Express response.
 * @param {import('express').NextFunction} next - The next middleware callback.
 * @returns {void} Nothing; calls next().
 */
function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

module.exports = { requestLogger };
