// Error propio con código HTTP. Los services lo lanzan (throw new HttpError(401, '...'))
// y el errorHandler central lo convierte en una respuesta JSON {"message": "..."}.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
