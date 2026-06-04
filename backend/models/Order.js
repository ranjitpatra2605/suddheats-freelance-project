const prisma = require('./db');
const { wrapModel } = require('./prismaHelper');
module.exports = wrapModel(prisma.order);
