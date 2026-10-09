CREATE TABLE IF NOT EXISTS financing_leads (
  id BIGSERIAL PRIMARY KEY,
  reference_code VARCHAR(40) NOT NULL UNIQUE,
  idempotency_key VARCHAR(128) NOT NULL UNIQUE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE RESTRICT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(160) NOT NULL,
  customer_phone VARCHAR(40) NOT NULL,
  customer_email VARCHAR(254),
  vehicle_price_snapshot NUMERIC(14,2) NOT NULL CHECK (vehicle_price_snapshot > 0),
  down_payment NUMERIC(14,2) NOT NULL CHECK (down_payment >= 0),
  loan_amount NUMERIC(14,2) NOT NULL CHECK (loan_amount > 0),
  annual_interest_rate NUMERIC(6,3) NOT NULL CHECK (annual_interest_rate BETWEEN 0 AND 100),
  loan_term_months INTEGER NOT NULL CHECK (loan_term_months BETWEEN 1 AND 120),
  monthly_payment NUMERIC(14,2) NOT NULL CHECK (monthly_payment > 0),
  total_payment NUMERIC(14,2) NOT NULL CHECK (total_payment > 0),
  total_interest NUMERIC(14,2) NOT NULL CHECK (total_interest >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
  status VARCHAR(16) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','CONTACTED','QUALIFIED','CONVERTED','CLOSED')),
  contact_consent BOOLEAN NOT NULL CHECK (contact_consent = TRUE),
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_contacted_at TIMESTAMPTZ, converted_at TIMESTAMPTZ, admin_notes TEXT NOT NULL DEFAULT '' CHECK (char_length(admin_notes) <= 4000)
);
CREATE INDEX IF NOT EXISTS financing_leads_status_created_idx ON financing_leads(status, created_at DESC);
