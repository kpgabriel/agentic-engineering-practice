// TODO: replace with real JWT validation

/**
 * @description Allows the request through only when its x-api-key header matches the configured API key, otherwise responds 401.
 * @param {import('express').Request} req - The Express request.
 * @param {import('express').Response} res - The Express response.
 * @param {import('express').NextFunction} next - The next middleware callback.
 * @returns {void} Nothing; calls next() or sends a 401 response.
 */
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === (process.env.API_KEY || 'dev-key')) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { authenticate };
