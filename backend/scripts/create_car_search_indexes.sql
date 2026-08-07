-- Car search indexes for faster mobile search/filter requests.
-- Safe to run multiple times.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_make ON public.cars (make);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_model ON public.cars (model);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price ON public.cars (price);

-- Optional: verify indexes exist
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename = 'cars'
--   AND indexname IN ('idx_cars_make', 'idx_cars_model', 'idx_cars_price');

-- Optional: verify usage
-- EXPLAIN ANALYZE
-- SELECT *
-- FROM public.cars
-- WHERE make = 'Toyota' AND price <= 300000000
-- ORDER BY price DESC
-- LIMIT 20;
