const mapIdToUnderscoreId = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj; // Keep Date objects intact
    if (Array.isArray(obj)) {
        return obj.map(mapIdToUnderscoreId);
    }
    const newObj = {};
    for (const key in obj) {
        if (key === 'id') {
            newObj._id = obj.id;
        } else {
            newObj[key] = mapIdToUnderscoreId(obj[key]);
        }
    }
    return newObj;
};

const mapUnderscoreIdToId = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) {
        return obj.map(mapUnderscoreIdToId);
    }
    const newObj = {};
    for (const key in obj) {
        if (key === '_id') {
            newObj.id = obj._id;
        } else {
            newObj[key] = mapUnderscoreIdToId(obj[key]);
        }
    }
    return newObj;
};

// Map where conditions recursively, replacing _id with id
const mapWhereClause = (where) => {
    if (!where || typeof where !== 'object') return where;
    const newWhere = {};
    for (const key in where) {
        if (key === '_id') {
            newWhere.id = where._id;
        } else if (where[key] && typeof where[key] === 'object' && !(where[key] instanceof Date)) {
            newWhere[key] = mapWhereClause(where[key]);
        } else {
            newWhere[key] = where[key];
        }
    }
    return newWhere;
};

const wrapModel = (delegate) => {
    return {
        findUnique: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.where) mappedArgs.where = mapWhereClause(mappedArgs.where);
            const res = await delegate.findUnique(mappedArgs);
            return mapIdToUnderscoreId(res);
        },
        findFirst: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.where) mappedArgs.where = mapWhereClause(mappedArgs.where);
            const res = await delegate.findFirst(mappedArgs);
            return mapIdToUnderscoreId(res);
        },
        findMany: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.where) mappedArgs.where = mapWhereClause(mappedArgs.where);
            const res = await delegate.findMany(mappedArgs);
            return mapIdToUnderscoreId(res);
        },
        create: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.data) mappedArgs.data = mapUnderscoreIdToId(mappedArgs.data);
            const res = await delegate.create(mappedArgs);
            return mapIdToUnderscoreId(res);
        },
        createMany: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.data) mappedArgs.data = mapUnderscoreIdToId(mappedArgs.data);
            const res = await delegate.createMany(mappedArgs);
            return res;
        },
        update: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.where) mappedArgs.where = mapWhereClause(mappedArgs.where);
            if (mappedArgs.data) mappedArgs.data = mapUnderscoreIdToId(mappedArgs.data);
            const res = await delegate.update(mappedArgs);
            return mapIdToUnderscoreId(res);
        },
        upsert: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.where) mappedArgs.where = mapWhereClause(mappedArgs.where);
            if (mappedArgs.update) mappedArgs.update = mapUnderscoreIdToId(mappedArgs.update);
            if (mappedArgs.create) mappedArgs.create = mapUnderscoreIdToId(mappedArgs.create);
            const res = await delegate.upsert(mappedArgs);
            return mapIdToUnderscoreId(res);
        },
        delete: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.where) mappedArgs.where = mapWhereClause(mappedArgs.where);
            const res = await delegate.delete(mappedArgs);
            return mapIdToUnderscoreId(res);
        },
        deleteMany: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.where) mappedArgs.where = mapWhereClause(mappedArgs.where);
            return await delegate.deleteMany(mappedArgs);
        },
        count: async (args = {}) => {
            const mappedArgs = { ...args };
            if (mappedArgs.where) mappedArgs.where = mapWhereClause(mappedArgs.where);
            return await delegate.count(mappedArgs);
        }
    };
};

module.exports = { wrapModel, mapIdToUnderscoreId, mapUnderscoreIdToId };
