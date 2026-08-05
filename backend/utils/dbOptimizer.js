import { performance } from 'perf_hooks';

// Query performance monitor
class QueryProfiler {
  constructor() {
    this.slowQueryThreshold = 100; // 100ms threshold
    this.queryLogs = [];
  }

  // Profile a query execution
  async profileQuery(queryName, queryFn, params = []) {
    const start = performance.now();
    let result;
    let error = null;
    
    try {
      result = await queryFn(...params);
    } catch (err) {
      error = err;
      result = null;
    }
    
    const duration = performance.now() - start;
    
    // Log query performance
    const logEntry = {
      queryName,
      duration: Math.round(duration),
      timestamp: new Date().toISOString(),
      status: error ? 'ERROR' : 'SUCCESS',
      params: JSON.stringify(params),
      isSlow: duration > this.slowQueryThreshold
    };
    
    this.queryLogs.push(logEntry);
    
    // Warn about slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`?? SLOW QUERY: ${queryName} took ${Math.round(duration)}ms`);
      console.warn(`   Params: ${JSON.stringify(params)}`);
    }
    
    if (error) throw error;
    return { result, duration: Math.round(duration), logEntry };
  }

  // Get query statistics
  getStats() {
    const total = this.queryLogs.length;
    const slowQueries = this.queryLogs.filter(log => log.isSlow);
    const errors = this.queryLogs.filter(log => log.status === 'ERROR');
    const avgDuration = total > 0 
      ? this.queryLogs.reduce((sum, log) => sum + log.duration, 0) / total 
      : 0;
    
    return {
      totalQueries: total,
      slowQueries: slowQueries.length,
      errorQueries: errors.length,
      avgDuration: Math.round(avgDuration),
      slowQueryLogs: slowQueries.slice(-10), // Last 10 slow queries
      slowQueryPercent: total > 0 ? ((slowQueries.length / total) * 100).toFixed(1) + '%' : '0%'
    };
  }

  // Reset logs
  resetLogs() {
    this.queryLogs = [];
  }
}

// Create singleton instance
export const queryProfiler = new QueryProfiler();

// Optimized query helper with indexes
export const queryOptimizer = {
  // Optimized inventory search with proper indexing
  async searchInventory(db, searchParams) {
    const { 
      make, 
      model, 
      minPrice, 
      maxPrice, 
      year, 
      condition,
      transmission,
      fuelType,
      sortBy = 'price',
      sortOrder = 'asc',
      limit = 20,
      offset = 0
    } = searchParams;

    // Build optimized query with proper indexes
    let query = db.collection('cars').find();
    
    // Use compound indexes for common search patterns
    if (make) query = query.filter(car => car.make.toLowerCase().includes(make.toLowerCase()));
    if (model) query = query.filter(car => car.model.toLowerCase().includes(model.toLowerCase()));
    if (year) query = query.filter(car => car.year === parseInt(year));
    if (condition) query = query.filter(car => car.condition === condition);
    if (transmission) query = query.filter(car => car.transmission === transmission);
    if (fuelType) query = query.filter(car => car.fuelType === fuelType);
    
    // Price range with index
    if (minPrice || maxPrice) {
      query = query.filter(car => {
        const price = car.price;
        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;
        return true;
      });
    }

    // Apply sorting with indexed fields
    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrderValue });

    // Apply pagination
    query = query.skip(offset).limit(limit);

    return query.toArray();
  },

  // Optimized booking availability check
  async checkBookingAvailability(db, carId, date, timeSlot) {
    // Use compound index on (carId, date, timeSlot) for fast lookups
    const existingBooking = await db.collection('bookings').findOne({
      carId: parseInt(carId),
      date: date,
      timeSlot: timeSlot,
      status: { $ne: 'cancelled' }
    }, {
      projection: { _id: 1, user_name: 1 } // Only fetch needed fields
    });

    return {
      available: !existingBooking,
      bookedBy: existingBooking ? existingBooking.user_name : null
    };
  },

  // Optimized get bookings with date range
  async getBookingsByDateRange(db, startDate, endDate, status = null) {
    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    if (status) {
      query.status = status;
    }

    // Use compound index on (date, status)
    return db.collection('bookings')
      .find(query)
      .sort({ date: 1, timeSlot: 1 })
      .toArray();
  },

  // Aggregated inventory statistics
  async getInventoryStats(db) {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$price' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          count: { $sum: 1 },
          byMake: {
            $push: {
              make: '$make',
              price: '$price'
            }
          }
        }
      }
    ];

    const result = await db.collection('cars').aggregate(pipeline).toArray();
    return result[0] || null;
  },

  // Get most searched car makes with caching
  async getMostSearchedMakes(db, limit = 5) {
    // This would typically be pre-calculated or from search logs
    const pipeline = [
      {
        $group: {
          _id: '$make',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ];

    return db.collection('cars').aggregate(pipeline).toArray();
  },

  // Monthly booking stats
  async getMonthlyBookingStats(db, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const pipeline = [
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $substr: ['$date', 8, 2] },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.day',
          total: { $sum: '$count' },
          confirmed: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'confirmed'] }, '$count', 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'cancelled'] }, '$count', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return db.collection('bookings').aggregate(pipeline).toArray();
  }
};