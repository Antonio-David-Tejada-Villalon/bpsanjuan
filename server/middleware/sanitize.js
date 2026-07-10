// Elimina claves que empiecen con "$" o contengan "." de body/query/params,
// para evitar inyección de operadores de MongoDB (ej. ?department[$ne]=x).
const stripMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    stripMongoOperators(obj[key]);
  }
};

const sanitizeInput = (req, res, next) => {
  stripMongoOperators(req.body);
  stripMongoOperators(req.query);
  stripMongoOperators(req.params);
  next();
};

module.exports = sanitizeInput;
