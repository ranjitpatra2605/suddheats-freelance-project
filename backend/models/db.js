const { PrismaClient } = require('@prisma/client');

// Initialize a single PrismaClient instance to be shared across the application
const prisma = new PrismaClient();

module.exports = prisma;

