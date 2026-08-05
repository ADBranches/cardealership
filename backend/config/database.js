// ============================================
// DATABASE CONFIGURATION
// ============================================
// This file handles database connections and configuration
// For now, we're using in-memory data, but this is set up for MongoDB

import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'panda_motors',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// In-memory database (for development without MongoDB)
class InMemoryDatabase {
    constructor() {
        this.collections = {
            cars: [],
            bookings: [],
            users: [],
            sales: [],
            search_logs: []
        };
        
        // Initialize with sample data if empty
        this.initializeSampleData();
    }

    initializeSampleData() {
        // Sample cars
        if (this.collections.cars.length === 0) {
            this.collections.cars = [
                { id: 1, make: 'Toyota', model: 'Land Cruiser', year: 2023, price: 285000000, condition: 'new', transmission: 'automatic', fuelType: 'diesel', createdAt: new Date() },
                { id: 2, make: 'Mercedes', model: 'G-Wagon', year: 2023, price: 350000000, condition: 'new', transmission: 'automatic', fuelType: 'petrol', createdAt: new Date() },
                { id: 3, make: 'BMW', model: 'X5', year: 2022, price: 220000000, condition: 'used', transmission: 'automatic', fuelType: 'diesel', createdAt: new Date() },
                { id: 4, make: 'Lexus', model: 'LX570', year: 2023, price: 310000000, condition: 'new', transmission: 'automatic', fuelType: 'petrol', createdAt: new Date() },
                { id: 5, make: 'Toyota', model: 'Hilux', year: 2022, price: 180000000, condition: 'used', transmission: 'manual', fuelType: 'diesel', createdAt: new Date() },
                { id: 6, make: 'Range Rover', model: 'Sport', year: 2023, price: 420000000, condition: 'new', transmission: 'automatic', fuelType: 'diesel', createdAt: new Date() },
                { id: 7, make: 'Audi', model: 'Q7', year: 2022, price: 250000000, condition: 'used', transmission: 'automatic', fuelType: 'petrol', createdAt: new Date() }
            ];
        }

        // Sample bookings
        if (this.collections.bookings.length === 0) {
            this.collections.bookings = [
                { id: 1, userId: 1, carId: 1, carModel: 'Toyota Land Cruiser', date: '2026-08-05', timeSlot: '10:00', status: 'confirmed', user_name: 'John Doe', user_email: 'john@example.com', user_phone: '+256 770 123 456', createdAt: new Date() },
                { id: 2, userId: 2, carId: 3, carModel: 'BMW X5', date: '2026-08-06', timeSlot: '14:00', status: 'confirmed', user_name: 'Jane Smith', user_email: 'jane@example.com', user_phone: '+256 772 234 567', createdAt: new Date() }
            ];
        }

        // Sample users
        if (this.collections.users.length === 0) {
            this.collections.users = [
                { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: new Date() },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: new Date() },
                { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: new Date() }
            ];
        }

        // Sample sales
        if (this.collections.sales.length === 0) {
            this.collections.sales = [
                { id: 1, carId: 1, amount: 285000000, date: '2026-07-15', carMake: 'Toyota', carModel: 'Land Cruiser', customer: 'John Doe' },
                { id: 2, carId: 3, amount: 220000000, date: '2026-07-20', carMake: 'BMW', carModel: 'X5', customer: 'Jane Smith' },
                { id: 3, carId: 4, amount: 310000000, date: '2026-07-25', carMake: 'Lexus', carModel: 'LX570', customer: 'Bob Johnson' },
                { id: 4, carId: 6, amount: 420000000, date: '2026-08-01', carMake: 'Range Rover', carModel: 'Sport', customer: 'Alice Brown' }
            ];
        }
    }

    collection(name) {
        // Return the collection object with query methods
        const collectionData = this.collections[name] || [];
        
        return {
            // Find with filter
            find: (filter = {}) => {
                let results = collectionData;
                
                // Apply filters
                if (filter) {
                    results = results.filter(item => {
                        for (const key in filter) {
                            if (filter[key] && typeof filter[key] === 'object' && filter[key].$ne) {
                                // Handle $ne operator
                                if (item[key] === filter[key].$ne) return false;
                            } else if (filter[key] && typeof filter[key] === 'object' && filter[key].$gte) {
                                // Handle $gte operator
                                if (item[key] < filter[key].$gte) return false;
                            } else if (filter[key] && typeof filter[key] === 'object' && filter[key].$lte) {
                                // Handle $lte operator
                                if (item[key] > filter[key].$lte) return false;
                            } else if (filter[key] && typeof filter[key] === 'object' && filter[key].$in) {
                                // Handle $in operator
                                if (!filter[key].$in.includes(item[key])) return false;
                            } else if (item[key] !== filter[key]) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
                
                return {
                    sort: (sortObj) => {
                        for (const key in sortObj) {
                            const direction = sortObj[key] === 1 ? 1 : -1;
                            results = results.sort((a, b) => {
                                if (a[key] < b[key]) return -1 * direction;
                                if (a[key] > b[key]) return 1 * direction;
                                return 0;
                            });
                        }
                        return {
                            skip: (offset) => {
                                return {
                                    limit: (limit) => {
                                        return Promise.resolve(results.slice(offset, offset + limit));
                                    }
                                };
                            },
                            toArray: () => Promise.resolve(results)
                        };
                    },
                    toArray: () => Promise.resolve(results),
                    limit: (limit) => Promise.resolve(results.slice(0, limit)),
                    skip: (offset) => ({
                        limit: (limit) => Promise.resolve(results.slice(offset, offset + limit))
                    })
                };
            },
            
            // Find one with filter
            findOne: (filter = {}, options = {}) => {
                let results = collectionData;
                
                // Apply filters
                if (filter) {
                    results = results.filter(item => {
                        for (const key in filter) {
                            if (filter[key] && typeof filter[key] === 'object' && filter[key].$ne) {
                                if (item[key] === filter[key].$ne) return false;
                            } else if (item[key] !== filter[key]) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
                
                // Apply projection if specified
                if (options.projection) {
                    results = results.map(item => {
                        const projected = {};
                        for (const key in options.projection) {
                            if (options.projection[key] === 1 && item[key] !== undefined) {
                                projected[key] = item[key];
                            }
                        }
                        return projected;
                    });
                }
                
                return Promise.resolve(results[0] || null);
            },
            
            // Insert one
            insertOne: (data) => {
                const newItem = {
                    id: collectionData.length + 1,
                    ...data,
                    _id: collectionData.length + 1,
                    createdAt: new Date()
                };
                collectionData.push(newItem);
                return Promise.resolve({ insertedId: newItem.id });
            },
            
            // Insert many
            insertMany: (dataArray) => {
                const inserted = [];
                dataArray.forEach(data => {
                    const newItem = {
                        id: collectionData.length + 1,
                        ...data,
                        _id: collectionData.length + 1,
                        createdAt: new Date()
                    };
                    collectionData.push(newItem);
                    inserted.push(newItem.id);
                });
                return Promise.resolve({ insertedIds: inserted });
            },
            
            // Update one
            updateOne: (filter, update) => {
                const index = collectionData.findIndex(item => {
                    for (const key in filter) {
                        if (item[key] !== filter[key]) return false;
                    }
                    return true;
                });
                
                if (index !== -1) {
                    if (update.$set) {
                        collectionData[index] = { ...collectionData[index], ...update.$set };
                    } else {
                        collectionData[index] = { ...collectionData[index], ...update };
                    }
                    return Promise.resolve({ modifiedCount: 1 });
                }
                return Promise.resolve({ modifiedCount: 0 });
            },
            
            // Update many
            updateMany: (filter, update) => {
                let count = 0;
                collectionData.forEach((item, index) => {
                    let matches = true;
                    for (const key in filter) {
                        if (item[key] !== filter[key]) {
                            matches = false;
                            break;
                        }
                    }
                    if (matches) {
                        if (update.$set) {
                            collectionData[index] = { ...collectionData[index], ...update.$set };
                        } else {
                            collectionData[index] = { ...collectionData[index], ...update };
                        }
                        count++;
                    }
                });
                return Promise.resolve({ modifiedCount: count });
            },
            
            // Delete one
            deleteOne: (filter) => {
                const index = collectionData.findIndex(item => {
                    for (const key in filter) {
                        if (item[key] !== filter[key]) return false;
                    }
                    return true;
                });
                
                if (index !== -1) {
                    collectionData.splice(index, 1);
                    return Promise.resolve({ deletedCount: 1 });
                }
                return Promise.resolve({ deletedCount: 0 });
            },
            
            // Aggregate
            aggregate: (pipeline) => {
                let results = collectionData;
                
                for (const stage of pipeline) {
                    if (stage.$match) {
                        results = results.filter(item => {
                            for (const key in stage.$match) {
                                if (item[key] !== stage.$match[key]) return false;
                            }
                            return true;
                        });
                    } else if (stage.$group) {
                        const grouped = {};
                        results.forEach(item => {
                            const groupKey = item[Object.keys(stage.$group)[0]];
                            if (!grouped[groupKey]) {
                                grouped[groupKey] = { _id: groupKey };
                            }
                            for (const field in stage.$group) {
                                if (field !== '_id') {
                                    const operation = Object.keys(stage.$group[field])[0];
                                    if (operation === '$sum') {
                                        grouped[groupKey][field] = (grouped[groupKey][field] || 0) + item[stage.$group[field][operation]];
                                    } else if (operation === '$avg') {
                                        // Simple average implementation
                                        if (!grouped[groupKey][`${field}_sum`]) {
                                            grouped[groupKey][`${field}_sum`] = 0;
                                            grouped[groupKey][`${field}_count`] = 0;
                                        }
                                        grouped[groupKey][`${field}_sum`] += item[stage.$group[field][operation]];
                                        grouped[groupKey][`${field}_count`]++;
                                        grouped[groupKey][field] = grouped[groupKey][`${field}_sum`] / grouped[groupKey][`${field}_count`];
                                    } else if (operation === '$min') {
                                        if (!grouped[groupKey][field] || item[stage.$group[field][operation]] < grouped[groupKey][field]) {
                                            grouped[groupKey][field] = item[stage.$group[field][operation]];
                                        }
                                    } else if (operation === '$max') {
                                        if (!grouped[groupKey][field] || item[stage.$group[field][operation]] > grouped[groupKey][field]) {
                                            grouped[groupKey][field] = item[stage.$group[field][operation]];
                                        }
                                    }
                                }
                            }
                        });
                        results = Object.values(grouped);
                    } else if (stage.$sort) {
                        for (const key in stage.$sort) {
                            const direction = stage.$sort[key] === 1 ? 1 : -1;
                            results = results.sort((a, b) => {
                                if (a[key] < b[key]) return -1 * direction;
                                if (a[key] > b[key]) return 1 * direction;
                                return 0;
                            });
                        }
                    } else if (stage.$limit) {
                        results = results.slice(0, stage.$limit);
                    } else if (stage.$skip) {
                        results = results.slice(stage.$skip);
                    } else if (stage.$facet) {
                        // Complex facet - simplified
                        const facets = {};
                        for (const facetName in stage.$facet) {
                            facets[facetName] = this.aggregate(stage.$facet[facetName]);
                        }
                        return Promise.resolve([facets]);
                    }
                }
                
                return { toArray: () => Promise.resolve(results) };
            },
            
            // Count documents
            count: (filter = {}) => {
                let count = collectionData.length;
                if (Object.keys(filter).length > 0) {
                    count = collectionData.filter(item => {
                        for (const key in filter) {
                            if (item[key] !== filter[key]) return false;
                        }
                        return true;
                    }).length;
                }
                return Promise.resolve(count);
            },
            
            // Create index (mock)
            createIndex: () => Promise.resolve('index_created')
        };
    }

    // Get collection names
    listCollections() {
        return {
            toArray: () => Promise.resolve(Object.keys(this.collections).map(name => ({ name })))
        };
    }
}

// Create and export database instance
const db = new InMemoryDatabase();

// Export the database connection
export default db;

// Export collection helpers
export const collection = (name) => db.collection(name);

// Export for use in other modules
export const getDb = () => db;