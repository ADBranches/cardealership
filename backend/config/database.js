// ============================================
// DATABASE CONFIGURATION
// ============================================
// In-Memory Database with MongoDB-like API
// For development and testing without MongoDB

import bcrypt from 'bcryptjs';

// ============================================
// IN-MEMORY DATABASE CLASS
// ============================================
class InMemoryDatabase {
    constructor() {
        this.collections = {
            cars: [],
            bookings: [],
            users: [],
            sales: [],
            search_logs: []
        };
        
        // Initialize with sample data
        this.initializeSampleData();
    }

    // ============================================
    // INITIALIZE SAMPLE DATA
    // ============================================
    initializeSampleData() {
        // ----------------------------------------
        // SAMPLE CARS
        // ----------------------------------------
        this.collections.cars = [
            { 
                id: 1, 
                make: 'Toyota', 
                model: 'Land Cruiser', 
                year: 2023, 
                price: 285000000, 
                condition: 'new', 
                transmission: 'automatic', 
                fuelType: 'diesel',
                mileage: 0,
                color: 'White',
                status: 'Available',
                isFeatured: false,
                spotlightScore: 0,
                spotlightTier: null,
                createdAt: new Date('2026-07-01').toISOString()
            },
            { 
                id: 2, 
                make: 'Mercedes', 
                model: 'G-Wagon', 
                year: 2023, 
                price: 350000000, 
                condition: 'new', 
                transmission: 'automatic', 
                fuelType: 'petrol',
                mileage: 0,
                color: 'Black',
                status: 'Available',
                isFeatured: false,
                spotlightScore: 0,
                spotlightTier: null,
                createdAt: new Date('2026-07-05').toISOString()
            },
            { 
                id: 3, 
                make: 'BMW', 
                model: 'X5', 
                year: 2022, 
                price: 220000000, 
                condition: 'used', 
                transmission: 'automatic', 
                fuelType: 'diesel',
                mileage: 25000,
                color: 'Blue',
                status: 'Available',
                isFeatured: false,
                spotlightScore: 0,
                spotlightTier: null,
                createdAt: new Date('2026-07-10').toISOString()
            },
            { 
                id: 4, 
                make: 'Lexus', 
                model: 'LX570', 
                year: 2023, 
                price: 310000000, 
                condition: 'new', 
                transmission: 'automatic', 
                fuelType: 'petrol',
                mileage: 0,
                color: 'Pearl White',
                status: 'Available',
                isFeatured: false,
                spotlightScore: 0,
                spotlightTier: null,
                createdAt: new Date('2026-07-15').toISOString()
            },
            { 
                id: 5, 
                make: 'Toyota', 
                model: 'Hilux', 
                year: 2022, 
                price: 180000000, 
                condition: 'used', 
                transmission: 'manual', 
                fuelType: 'diesel',
                mileage: 45000,
                color: 'Silver',
                status: 'Available',
                isFeatured: false,
                spotlightScore: 0,
                spotlightTier: null,
                createdAt: new Date('2026-07-20').toISOString()
            },
            { 
                id: 6, 
                make: 'Range Rover', 
                model: 'Sport', 
                year: 2023, 
                price: 420000000, 
                condition: 'new', 
                transmission: 'automatic', 
                fuelType: 'diesel',
                mileage: 0,
                color: 'Black',
                status: 'Available',
                isFeatured: false,
                spotlightScore: 0,
                spotlightTier: null,
                createdAt: new Date('2026-08-01').toISOString()
            },
            { 
                id: 7, 
                make: 'Audi', 
                model: 'Q7', 
                year: 2022, 
                price: 250000000, 
                condition: 'used', 
                transmission: 'automatic', 
                fuelType: 'petrol',
                mileage: 30000,
                color: 'Grey',
                status: 'Available',
                isFeatured: false,
                spotlightScore: 0,
                spotlightTier: null,
                createdAt: new Date('2026-08-05').toISOString()
            }
        ];

        // ----------------------------------------
        // SAMPLE USERS (passwords hashed with bcrypt)
        // ----------------------------------------
        // All passwords are: "password123"
        const defaultPasswordHash = bcrypt.hashSync('password123', 10);
        
        this.collections.users = [
            { 
                id: 1, 
                name: 'Admin User', 
                email: 'admin@pandamotors.com', 
                password: defaultPasswordHash,
                role: 'admin', 
                phone: '+256 770 826 951',
                createdAt: new Date('2026-07-01').toISOString(),
                updatedAt: new Date('2026-07-01').toISOString()
            },
            { 
                id: 2, 
                name: 'John Doe', 
                email: 'john@example.com', 
                password: defaultPasswordHash,
                role: 'user', 
                phone: '+256 772 234 567',
                createdAt: new Date('2026-07-10').toISOString(),
                updatedAt: new Date('2026-07-10').toISOString()
            },
            { 
                id: 3, 
                name: 'Jane Smith', 
                email: 'jane@example.com', 
                password: defaultPasswordHash,
                role: 'user', 
                phone: '+256 773 345 678',
                createdAt: new Date('2026-07-15').toISOString(),
                updatedAt: new Date('2026-07-15').toISOString()
            },
            { 
                id: 4, 
                name: 'Steven Ssebuma', 
                email: 'steven@pandamotors.com', 
                password: defaultPasswordHash,
                role: 'admin', 
                phone: '+256 774 456 789',
                createdAt: new Date('2026-07-20').toISOString(),
                updatedAt: new Date('2026-07-20').toISOString()
            }
        ];

        // ----------------------------------------
        // SAMPLE BOOKINGS
        // ----------------------------------------
        this.collections.bookings = [
            { 
                id: 1, 
                userId: 2, 
                carId: 1, 
                carModel: 'Toyota Land Cruiser', 
                date: '2026-08-15', 
                timeSlot: '10:00', 
                status: 'confirmed', 
                user_name: 'John Doe', 
                user_email: 'john@example.com', 
                user_phone: '+256 772 234 567',
                notes: 'Interested in diesel variant',
                createdAt: new Date('2026-08-10').toISOString(),
                updatedAt: new Date('2026-08-10').toISOString()
            },
            { 
                id: 2, 
                userId: 3, 
                carId: 3, 
                carModel: 'BMW X5', 
                date: '2026-08-16', 
                timeSlot: '14:00', 
                status: 'confirmed', 
                user_name: 'Jane Smith', 
                user_email: 'jane@example.com', 
                user_phone: '+256 773 345 678',
                notes: 'First time buyer',
                createdAt: new Date('2026-08-11').toISOString(),
                updatedAt: new Date('2026-08-11').toISOString()
            },
            { 
                id: 3, 
                userId: 2, 
                carId: 2, 
                carModel: 'Mercedes G-Wagon', 
                date: '2026-08-20', 
                timeSlot: '11:00', 
                status: 'completed', 
                user_name: 'John Doe', 
                user_email: 'john@example.com', 
                user_phone: '+256 772 234 567',
                notes: '',
                createdAt: new Date('2026-08-12').toISOString(),
                updatedAt: new Date('2026-08-20').toISOString()
            }
        ];

        // ----------------------------------------
        // SAMPLE SALES
        // ----------------------------------------
        this.collections.sales = [
            { 
                id: 1, 
                carId: 1, 
                amount: 285000000, 
                date: '2026-07-15', 
                carMake: 'Toyota', 
                carModel: 'Land Cruiser', 
                customer: 'John Doe',
                customerEmail: 'john@example.com',
                salesperson: 'Admin User',
                createdAt: new Date('2026-07-15').toISOString()
            },
            { 
                id: 2, 
                carId: 3, 
                amount: 220000000, 
                date: '2026-07-20', 
                carMake: 'BMW', 
                carModel: 'X5', 
                customer: 'Jane Smith',
                customerEmail: 'jane@example.com',
                salesperson: 'Admin User',
                createdAt: new Date('2026-07-20').toISOString()
            },
            { 
                id: 3, 
                carId: 4, 
                amount: 310000000, 
                date: '2026-07-25', 
                carMake: 'Lexus', 
                carModel: 'LX570', 
                customer: 'Bob Johnson',
                customerEmail: 'bob@example.com',
                salesperson: 'Steven Ssebuma',
                createdAt: new Date('2026-07-25').toISOString()
            },
            { 
                id: 4, 
                carId: 6, 
                amount: 420000000, 
                date: '2026-08-01', 
                carMake: 'Range Rover', 
                carModel: 'Sport', 
                customer: 'Alice Brown',
                customerEmail: 'alice@example.com',
                salesperson: 'Admin User',
                createdAt: new Date('2026-08-01').toISOString()
            },
            { 
                id: 5, 
                carId: 5, 
                amount: 180000000, 
                date: '2026-08-05', 
                carMake: 'Toyota', 
                carModel: 'Hilux', 
                customer: 'Charlie Davis',
                customerEmail: 'charlie@example.com',
                salesperson: 'Steven Ssebuma',
                createdAt: new Date('2026-08-05').toISOString()
            }
        ];

        // ----------------------------------------
        // SAMPLE SEARCH LOGS
        // ----------------------------------------
        this.collections.search_logs = [
            { id: 1, userId: 2, make: 'Toyota', model: 'Land Cruiser', timestamp: new Date('2026-08-01').toISOString() },
            { id: 2, userId: 3, make: 'Mercedes', model: 'G-Wagon', timestamp: new Date('2026-08-02').toISOString() },
            { id: 3, userId: 2, make: 'Toyota', model: 'Hilux', timestamp: new Date('2026-08-03').toISOString() },
            { id: 4, userId: 3, make: 'BMW', model: 'X5', timestamp: new Date('2026-08-04').toISOString() },
            { id: 5, userId: 2, make: 'Toyota', model: 'Land Cruiser', timestamp: new Date('2026-08-05').toISOString() }
        ];

        console.log('?? Sample data loaded:');
        console.log(`   - Cars: ${this.collections.cars.length}`);
        console.log(`   - Users: ${this.collections.users.length}`);
        console.log(`   - Bookings: ${this.collections.bookings.length}`);
        console.log(`   - Sales: ${this.collections.sales.length}`);
        console.log(`   - Search Logs: ${this.collections.search_logs.length}`);
        console.log('?? Default password for all users: password123');
    }

    // ============================================
    // COLLECTION METHOD - Returns collection API
    // ============================================
    collection(name) {
        const collectionData = this.collections[name] || [];
        const self = this;

        return {
            // ============================================
            // FIND - Returns query builder
            // ============================================
            find: (filter = {}) => {
                let results = [...collectionData];

                // Apply filters
                if (filter && Object.keys(filter).length > 0) {
                    results = results.filter(item => {
                        for (const key in filter) {
                            const filterValue = filter[key];
                            
                            // Handle MongoDB-like operators
                            if (filterValue && typeof filterValue === 'object') {
                                // $ne - not equal
                                if ('$ne' in filterValue) {
                                    if (item[key] === filterValue.$ne) return false;
                                }
                                // $gte - greater than or equal
                                else if ('$gte' in filterValue) {
                                    if (item[key] < filterValue.$gte) return false;
                                }
                                // $lte - less than or equal
                                else if ('$lte' in filterValue) {
                                    if (item[key] > filterValue.$lte) return false;
                                }
                                // $gt - greater than
                                else if ('$gt' in filterValue) {
                                    if (item[key] <= filterValue.$gt) return false;
                                }
                                // $lt - less than
                                else if ('$lt' in filterValue) {
                                    if (item[key] >= filterValue.$lt) return false;
                                }
                                // $in - in array
                                else if ('$in' in filterValue) {
                                    if (!filterValue.$in.includes(item[key])) return false;
                                }
                                // $regex - regex match
                                else if ('$regex' in filterValue) {
                                    const regex = new RegExp(filterValue.$regex, filterValue.$options || '');
                                    if (!regex.test(item[key])) return false;
                                }
                                // $or - logical OR
                                else if ('$or' in filterValue) {
                                    const orConditions = filterValue.$or;
                                    const matches = orConditions.some(cond => {
                                        for (const orKey in cond) {
                                            if (item[orKey] === cond[orKey]) return true;
                                        }
                                        return false;
                                    });
                                    if (!matches) return false;
                                }
                            } else {
                                // Direct comparison
                                if (item[key] !== filterValue) return false;
                            }
                        }
                        return true;
                    });
                }

                // Query builder with chainable methods
                const queryBuilder = {
                    // Sort
                    sort: (sortObj) => {
                        for (const key in sortObj) {
                            const direction = sortObj[key] === 1 ? 1 : -1;
                            results.sort((a, b) => {
                                if (a[key] < b[key]) return -1 * direction;
                                if (a[key] > b[key]) return 1 * direction;
                                return 0;
                            });
                        }
                        return queryBuilder;
                    },
                    // Skip
                    skip: (offset) => {
                        results = results.slice(offset);
                        return queryBuilder;
                    },
                    // Limit
                    limit: (limit) => {
                        results = results.slice(0, limit);
                        return queryBuilder;
                    },
                    // Execute and return array
                    toArray: () => Promise.resolve(results),
                    // Count
                    count: () => Promise.resolve(results.length)
                };

                return queryBuilder;
            },

            // ============================================
            // FIND ONE - Returns single document
            // ============================================
            findOne: (filter = {}, options = {}) => {
                let results = [...collectionData];

                // Apply filters
                if (filter && Object.keys(filter).length > 0) {
                    results = results.filter(item => {
                        for (const key in filter) {
                            const filterValue = filter[key];
                            
                            if (filterValue && typeof filterValue === 'object') {
                                if ('$ne' in filterValue) {
                                    if (item[key] === filterValue.$ne) return false;
                                } else if ('$or' in filterValue) {
                                    const orConditions = filterValue.$or;
                                    const matches = orConditions.some(cond => {
                                        for (const orKey in cond) {
                                            if (item[orKey] === cond[orKey]) return true;
                                        }
                                        return false;
                                    });
                                    if (!matches) return false;
                                }
                            } else {
                                if (item[key] !== filterValue) return false;
                            }
                        }
                        return true;
                    });
                }

                // Apply projection if specified
                let result = results[0] || null;
                if (result && options.projection) {
                    const projected = {};
                    for (const key in options.projection) {
                        if (options.projection[key] === 1 && result[key] !== undefined) {
                            projected[key] = result[key];
                        }
                    }
                    result = projected;
                }

                return Promise.resolve(result);
            },

            // ============================================
            // INSERT ONE
            // ============================================
            insertOne: (data) => {
                const newItem = {
                    id: collectionData.length > 0 
                        ? Math.max(...collectionData.map(i => i.id || 0)) + 1 
                        : 1,
                    ...data,
                    _id: collectionData.length + 1,
                    createdAt: data.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                collectionData.push(newItem);
                return Promise.resolve({ 
                    insertedId: newItem.id,
                    acknowledged: true 
                });
            },

            // ============================================
            // INSERT MANY
            // ============================================
            insertMany: (dataArray) => {
                const inserted = [];
                dataArray.forEach(data => {
                    const newItem = {
                        id: collectionData.length > 0 
                            ? Math.max(...collectionData.map(i => i.id || 0)) + 1 
                            : 1,
                        ...data,
                        _id: collectionData.length + 1,
                        createdAt: data.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    collectionData.push(newItem);
                    inserted.push(newItem.id);
                });
                return Promise.resolve({ 
                    insertedIds: inserted,
                    acknowledged: true 
                });
            },

            // ============================================
            // UPDATE ONE
            // ============================================
            updateOne: (filter, update) => {
                const index = collectionData.findIndex(item => {
                    for (const key in filter) {
                        if (item[key] !== filter[key]) return false;
                    }
                    return true;
                });

                if (index !== -1) {
                    if (update.$set) {
                        collectionData[index] = { 
                            ...collectionData[index], 
                            ...update.$set,
                            updatedAt: new Date().toISOString()
                        };
                    } else {
                        collectionData[index] = { 
                            ...collectionData[index], 
                            ...update,
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return Promise.resolve({ 
                        modifiedCount: 1,
                        acknowledged: true 
                    });
                }
                return Promise.resolve({ 
                    modifiedCount: 0,
                    acknowledged: true 
                });
            },

            // ============================================
            // UPDATE MANY
            // ============================================
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
                            collectionData[index] = { 
                                ...collectionData[index], 
                                ...update.$set,
                                updatedAt: new Date().toISOString()
                            };
                        } else {
                            collectionData[index] = { 
                                ...collectionData[index], 
                                ...update,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        count++;
                    }
                });
                return Promise.resolve({ 
                    modifiedCount: count,
                    acknowledged: true 
                });
            },

            // ============================================
            // DELETE ONE
            // ============================================
            deleteOne: (filter) => {
                const index = collectionData.findIndex(item => {
                    for (const key in filter) {
                        if (item[key] !== filter[key]) return false;
                    }
                    return true;
                });

                if (index !== -1) {
                    collectionData.splice(index, 1);
                    return Promise.resolve({ 
                        deletedCount: 1,
                        acknowledged: true 
                    });
                }
                return Promise.resolve({ 
                    deletedCount: 0,
                    acknowledged: true 
                });
            },

            // ============================================
            // DELETE MANY
            // ============================================
            deleteMany: (filter = {}) => {
                let count = 0;
                for (let i = collectionData.length - 1; i >= 0; i--) {
                    let matches = true;
                    for (const key in filter) {
                        if (collectionData[i][key] !== filter[key]) {
                            matches = false;
                            break;
                        }
                    }
                    if (matches) {
                        collectionData.splice(i, 1);
                        count++;
                    }
                }
                return Promise.resolve({ 
                    deletedCount: count,
                    acknowledged: true 
                });
            },

            // ============================================
            // COUNT DOCUMENTS
            // ============================================
            countDocuments: (filter = {}) => {
                if (!filter || Object.keys(filter).length === 0) {
                    return Promise.resolve(collectionData.length);
                }

                const count = collectionData.filter(item => {
                    for (const key in filter) {
                        if (item[key] !== filter[key]) return false;
                    }
                    return true;
                }).length;

                return Promise.resolve(count);
            },

            // ============================================
            // AGGREGATE - Simplified aggregation
            // ============================================
            aggregate: (pipeline) => {
                let results = [...collectionData];

                for (const stage of pipeline) {
                    // $match - filter
                    if (stage.$match) {
                        results = results.filter(item => {
                            for (const key in stage.$match) {
                                const filterValue = stage.$match[key];
                                if (filterValue && typeof filterValue === 'object') {
                                    if ('$gte' in filterValue && item[key] < filterValue.$gte) return false;
                                    if ('$lte' in filterValue && item[key] > filterValue.$lte) return false;
                                    if ('$gt' in filterValue && item[key] <= filterValue.$gt) return false;
                                    if ('$lt' in filterValue && item[key] >= filterValue.$lt) return false;
                                } else {
                                    if (item[key] !== filterValue) return false;
                                }
                            }
                            return true;
                        });
                    }

                    // $group - group by
                    if (stage.$group) {
                        const grouped = {};
                        const groupId = stage.$group._id;

                        results.forEach(item => {
                            let groupKey;
                            if (typeof groupId === 'string') {
                                groupKey = groupId === null ? 'null' : item[groupId.replace('$', '')];
                            } else if (typeof groupId === 'object') {
                                groupKey = JSON.stringify(groupId);
                            } else {
                                groupKey = 'all';
                            }

                            if (!grouped[groupKey]) {
                                grouped[groupKey] = { _id: groupKey };
                            }

                            for (const field in stage.$group) {
                                if (field === '_id') continue;
                                
                                const operation = stage.$group[field];
                                const opKey = Object.keys(operation)[0];
                                const opValue = operation[opKey];

                                if (opKey === '$sum') {
                                    if (typeof opValue === 'number') {
                                        grouped[groupKey][field] = (grouped[groupKey][field] || 0) + opValue;
                                    } else {
                                        const fieldName = opValue.replace('$', '');
                                        grouped[groupKey][field] = (grouped[groupKey][field] || 0) + (item[fieldName] || 0);
                                    }
                                } else if (opKey === '$avg') {
                                    const fieldName = opValue.replace('$', '');
                                    if (!grouped[groupKey][`_${field}_sum`]) {
                                        grouped[groupKey][`_${field}_sum`] = 0;
                                        grouped[groupKey][`_${field}_count`] = 0;
                                    }
                                    grouped[groupKey][`_${field}_sum`] += (item[fieldName] || 0);
                                    grouped[groupKey][`_${field}_count`]++;
                                    grouped[groupKey][field] = grouped[groupKey][`_${field}_sum`] / grouped[groupKey][`_${field}_count`];
                                } else if (opKey === '$min') {
                                    const fieldName = opValue.replace('$', '');
                                    if (!grouped[groupKey][field] || item[fieldName] < grouped[groupKey][field]) {
                                        grouped[groupKey][field] = item[fieldName];
                                    }
                                } else if (opKey === '$max') {
                                    const fieldName = opValue.replace('$', '');
                                    if (!grouped[groupKey][field] || item[fieldName] > grouped[groupKey][field]) {
                                        grouped[groupKey][field] = item[fieldName];
                                    }
                                } else if (opKey === '$push') {
                                    const fieldName = opValue.replace('$', '');
                                    if (!grouped[groupKey][field]) grouped[groupKey][field] = [];
                                    grouped[groupKey][field].push(item[fieldName]);
                                }
                            }
                        });

                        results = Object.values(grouped);
                    }

                    // $sort - sorting
                    if (stage.$sort) {
                        for (const key in stage.$sort) {
                            const direction = stage.$sort[key] === 1 ? 1 : -1;
                            results.sort((a, b) => {
                                if (a[key] < b[key]) return -1 * direction;
                                if (a[key] > b[key]) return 1 * direction;
                                return 0;
                            });
                        }
                    }

                    // $limit
                    if (stage.$limit) {
                        results = results.slice(0, stage.$limit);
                    }

                    // $skip
                    if (stage.$skip) {
                        results = results.slice(stage.$skip);
                    }

                    // $facet - multi-pipeline
                    if (stage.$facet) {
                        const facets = {};
                        for (const facetName in stage.$facet) {
                            let facetResults = [...collectionData];
                            for (const facetStage of stage.$facet[facetName]) {
                                if (facetStage.$match) {
                                    facetResults = facetResults.filter(item => {
                                        for (const key in facetStage.$match) {
                                            if (item[key] !== facetStage.$match[key]) return false;
                                        }
                                        return true;
                                    });
                                }
                                if (facetStage.$group) {
                                    // Simplified group for facet
                                    const grouped = {};
                                    facetResults.forEach(item => {
                                        const key = facetStage.$group._id ? item[facetStage.$group._id.replace('$', '')] : 'all';
                                        if (!grouped[key]) grouped[key] = { _id: key };
                                        for (const field in facetStage.$group) {
                                            if (field === '_id') continue;
                                            const op = Object.keys(facetStage.$group[field])[0];
                                            if (op === '$sum') {
                                                const val = facetStage.$group[field].$sum;
                                                if (typeof val === 'number') {
                                                    grouped[key][field] = (grouped[key][field] || 0) + val;
                                                } else {
                                                    grouped[key][field] = (grouped[key][field] || 0) + (item[val.replace('$', '')] || 0);
                                                }
                                            }
                                        }
                                    });
                                    facetResults = Object.values(grouped);
                                }
                                if (facetStage.$sort) {
                                    for (const key in facetStage.$sort) {
                                        const direction = facetStage.$sort[key] === 1 ? 1 : -1;
                                        facetResults.sort((a, b) => {
                                            if (a[key] < b[key]) return -1 * direction;
                                            if (a[key] > b[key]) return 1 * direction;
                                            return 0;
                                        });
                                    }
                                }
                                if (facetStage.$limit) {
                                    facetResults = facetResults.slice(0, facetStage.$limit);
                                }
                            }
                            facets[facetName] = facetResults;
                        }
                        return Promise.resolve([facets]);
                    }
                }

                return Promise.resolve(results);
            },

            // ============================================
            // CREATE INDEX (Mock)
            // ============================================
            createIndex: (keys, options = {}) => {
                const indexName = options.name || `idx_${Object.keys(keys).join('_')}`;
                console.log(`   ?? Created index: ${indexName} on ${name}`);
                return Promise.resolve(indexName);
            },

            // ============================================
            // INDEXES (Mock)
            // ============================================
            indexes: () => {
                return Promise.resolve([
                    { name: '_id_', key: { _id: 1 } },
                    { name: 'idx_default', key: { id: 1 } }
                ]);
            }
        };
    }

    // ============================================
    // LIST COLLECTIONS
    // ============================================
    listCollections() {
        return {
            toArray: () => Promise.resolve(
                Object.keys(this.collections).map(name => ({ name }))
            )
        };
    }

    // ============================================
    // GET COLLECTION STATS
    // ============================================
    getStats() {
        const stats = {};
        for (const name in this.collections) {
            stats[name] = this.collections[name].length;
        }
        return stats;
    }

    // ============================================
    // CLEAR COLLECTION
    // ============================================
    clearCollection(name) {
        if (this.collections[name]) {
            this.collections[name] = [];
            console.log(`???  Cleared collection: ${name}`);
            return true;
        }
        return false;
    }

    // ============================================
    // RESET DATABASE
    // ============================================
    reset() {
        this.collections = {
            cars: [],
            bookings: [],
            users: [],
            sales: [],
            search_logs: []
        };
        this.initializeSampleData();
        console.log('?? Database reset to sample data');
    }
}

// ============================================
// CREATE AND EXPORT DATABASE INSTANCE
// ============================================
const db = new InMemoryDatabase();

// Export default database
export default db;

// Export helper functions
export const collection = (name) => db.collection(name);
export const getDb = () => db;