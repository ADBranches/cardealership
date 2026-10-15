BEGIN;

ALTER TABLE public.cars
  RENAME COLUMN brand TO make;

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS model VARCHAR(100);

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS mileage INTEGER;

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS color VARCHAR(100);

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS vin VARCHAR(17);

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'Available';

ALTER TABLE public.cars
  ADD CONSTRAINT cars_mileage_non_negative
  CHECK (mileage IS NULL OR mileage >= 0);

ALTER TABLE public.cars
  ADD CONSTRAINT cars_vin_format
  CHECK (
    vin IS NULL
    OR vin ~ '^[A-HJ-NPR-Z0-9]{17}$'
  );

CREATE UNIQUE INDEX IF NOT EXISTS cars_vin_unique_idx
  ON public.cars (vin)
  WHERE vin IS NOT NULL;

CREATE INDEX IF NOT EXISTS cars_status_idx
  ON public.cars (status);

CREATE INDEX IF NOT EXISTS cars_make_model_idx
  ON public.cars (make, model);

COMMIT;
