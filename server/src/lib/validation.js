const { body, param, query } = require('express-validator');

const positiveId = (location, field) => location(field)
    .custom(value => typeof value === 'number' || typeof value === 'string')
    .withMessage('ID must be a positive integer').bail()
    .isInt({ min: 1, max: 2147483647 }).withMessage('ID must be a positive integer')
    .bail().custom(value => Number.isSafeInteger(Number(value)))
    .withMessage('ID must be a positive integer').toInt();

module.exports = {
    bodyId: field => positiveId(body, field),
    paramId: field => positiveId(param, field),
    queryId: field => positiveId(query, field),
};
