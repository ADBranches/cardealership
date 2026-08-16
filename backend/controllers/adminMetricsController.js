import db from '../config/database.js';
import { queryProfiler } from '../utils/dbOptimizer.js';

export const adminMetricsController = {
  // GET /api/admin/metrics - Full admin dashboard metrics
  async getMetrics(req, res) {
    try {
      const startTime = Date.now();

      // Run all aggregations in parallel for performance
      const [
        inventoryMetrics,
        bookingMetrics,
        searchMetrics,
        revenueMetrics,
        userMetrics
      ] = await Promise.all([
        this.getInventoryMetrics(),
        this.getBookingMetrics(),
        this.getSearchMetrics(),
        this.getRevenueMetrics(),
        this.getUserMetrics()
      ]);

      const duration = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          inventory: inventoryMetrics,
          bookings: bookingMetrics,
          searches: searchMetrics,
          revenue: revenueMetrics,
          users: userMetrics,
          timestamp: new Date().toISOString()
        },
        meta: {
          generationTime: `${duration}ms`
        }
      });

    } catch (error) {
      console.error('Metrics error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admin/metrics/inventory - Inventory metrics only
  async getInventoryMetrics(req, res) {
    try {
      const metrics = await this.getInventoryMetrics();
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Inventory metrics error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admin/metrics/bookings - Booking metrics only
  async getBookingMetrics(req, res) {
    try {
      const metrics = await this.getBookingMetrics();
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Booking metrics error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ==================== PRIVATE METHODS ====================

  // Inventory metrics aggregation
  async getInventoryMetrics() {
    return await queryProfiler.profileQuery(
      'admin_inventory_metrics',
      async () => {
        const pipeline = [
          {
            $facet: {
              // Total value and counts
              summary: [
                {
                  $group: {
                    _id: null,
                    totalValue: { $sum: '$price' },
                    averagePrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    count: { $sum: 1 }
                  }
                }
              ],
              // By make (for most searched)
              byMake: [
                {
                  $group: {
                    _id: '$make',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$price' },
                    avgPrice: { $avg: '$price' }
                  }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
              ],
              // By year
              byYear: [
                {
                  $group: {
                    _id: '$year',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$price' }
                  }
                },
                { $sort: { _id: -1 } },
                { $limit: 10 }
              ],
              // By condition
              byCondition: [
                {
                  $group: {
                    _id: '$condition',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                  }
                }
              ],
              // Recent additions
              recent: [
                { $sort: { createdAt: -1 } },
                { $limit: 5 },
                {
                  $project: {
                    make: 1,
                    model: 1,
                    year: 1,
                    price: 1,
                    condition: 1
                  }
                }
              ]
            }
          }
        ];

        const result = await db.collection('cars').aggregate(pipeline).toArray();
        return result[0] || {};
      }
    );
  },

  // Booking metrics aggregation
  async getBookingMetrics() {
    return await queryProfiler.profileQuery(
      'admin_booking_metrics',
      async () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfMonthStr = firstDayOfMonth.toISOString().split('T')[0];

        const pipeline = [
          {
            $facet: {
              // Total bookings summary
              summary: [
                {
                  $group: {
                    _id: null,
                    total: { $sum: 1 },
                    confirmed: {
                      $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    cancelled: {
                      $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    completed: {
                      $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                  }
                }
              ],
              // This month's bookings
              thisMonth: [
                {
                  $match: {
                    date: { $gte: firstDayOfMonthStr }
                  }
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    confirmed: {
                      $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    }
                  }
                }
              ],
              // By car model
              byCar: [
                {
                  $group: {
                    _id: '$carModel',
                    count: { $sum: 1 }
                  }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
              ],
              // Daily bookings for last 30 days
              daily: [
                {
                  $group: {
                    _id: '$date',
                    count: { $sum: 1 },
                    confirmed: {
                      $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    }
                  }
                },
                { $sort: { _id: -1 } },
                { $limit: 30 }
              ],
              // Upcoming bookings
              upcoming: [
                {
                  $match: {
                    date: { $gte: new Date().toISOString().split('T')[0] },
                    status: 'confirmed'
                  }
                },
                { $sort: { date: 1, timeSlot: 1 } },
                { $limit: 10 }
              ]
            }
          }
        ];

        const result = await db.collection('bookings').aggregate(pipeline).toArray();
        return result[0] || {};
      }
    );
  },

  // Search metrics aggregation
  async getSearchMetrics() {
    return await queryProfiler.profileQuery(
      'admin_search_metrics',
      async () => {
        // Check if search_logs collection exists, if not use cars collection
        const collections = await db.listCollections().toArray();
        const hasSearchLogs = collections.some(c => c.name === 'search_logs');

        if (hasSearchLogs) {
          const pipeline = [
            {
              $facet: {
                // Most searched makes
                mostSearchedMakes: [
                  {
                    $group: {
                      _id: '$make',
                      count: { $sum: 1 }
                    }
                  },
                  { $sort: { count: -1 } },
                  { $limit: 10 }
                ],
                // Search trends by day
                dailyTrends: [
                  {
                    $group: {
                      _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                      count: { $sum: 1 }
                    }
                  },
                  { $sort: { _id: -1 } },
                  { $limit: 30 }
                ],
                // Total searches
                total: [
                  { $count: 'total' }
                ]
              }
            }
          ];

          const result = await db.collection('search_logs').aggregate(pipeline).toArray();
          return result[0] || {};
        } else {
          // Fallback: Use car makes as search popularity
          const pipeline = [
            {
              $group: {
                _id: '$make',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ];

          const result = await db.collection('cars').aggregate(pipeline).toArray();
          return {
            mostSearchedMakes: result,
            total: { total: result.reduce((sum, item) => sum + item.count, 0) }
          };
        }
      }
    );
  },

  // Revenue metrics aggregation
  async getRevenueMetrics() {
    return await queryProfiler.profileQuery(
      'admin_revenue_metrics',
      async () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const pipeline = [
          {
            $facet: {
              // Total revenue
              total: [
                {
                  $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalSales: { $sum: 1 },
                    averageSale: { $avg: '$amount' }
                  }
                }
              ],
              // Monthly revenue (last 12 months)
              monthly: [
                {
                  $group: {
                    _id: {
                      year: { $year: '$date' },
                      month: { $month: '$date' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                  }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 12 }
              ],
              // This month revenue
              thisMonth: [
                {
                  $match: {
                    date: { $gte: firstDayOfMonth }
                  }
                },
                {
                  $group: {
                    _id: null,
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                  }
                }
              ],
              // By car make
              byMake: [
                {
                  $group: {
                    _id: '$carMake',
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                  }
                },
                { $sort: { revenue: -1 } },
                { $limit: 10 }
              ]
            }
          }
        ];

        const result = await db.collection('sales').aggregate(pipeline).toArray();
        return result[0] || {};
      }
    );
  },

  // User metrics aggregation
  async getUserMetrics() {
    return await queryProfiler.profileQuery(
      'admin_user_metrics',
      async () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        const pipeline = [
          {
            $facet: {
              // Total users
              total: [
                { $count: 'total' }
              ],
              // New users this month
              newThisMonth: [
                {
                  $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                  }
                },
                { $count: 'newUsers' }
              ],
              // Users by role
              byRole: [
                {
                  $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                  }
                }
              ],
              // Active users (with bookings)
              activeUsers: [
                {
                  $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'bookings'
                  }
                },
                {
                  $match: {
                    'bookings.0': { $exists: true }
                  }
                },
                { $count: 'activeUsers' }
              ]
            }
          }
        ];

        const result = await db.collection('users').aggregate(pipeline).toArray();
        return result[0] || {};
      }
    );
  }
};