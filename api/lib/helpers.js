const validateUuid = require('uuid-validate');

/**
 * Checks if value is a valid uuid
 * @param {string} value incoming user query
 * @return {boolean} if value is a uuid
 */
exports.isValidUuid = (value) => {
    return validateUuid(value, 4);
}

/**
 * Checks if userId is a valid Discord userId (name#number)
 * @param {string} value incoming userId
 * @return {boolean} whether or not userId is valid
 */
exports.isValidUserId = (value) => {
    return /\D{1,32}#\d{4}/.test(value);
}