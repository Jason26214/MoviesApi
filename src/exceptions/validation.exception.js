const AppException = require('./app.exceptions');

class ValidationException extends AppException {
  constructor(message, payload) {
    super(400, message, payload);
  }
}

module.exports = ValidationException;
