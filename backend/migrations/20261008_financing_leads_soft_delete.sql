-- Keep an audit trail when an administrator removes a mistaken quote from the active sales queue.
ALTER TABLE financing_leads
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

CREATE INDEX IF NOT EXISTS financing_leads_active_status_created_idx
  ON financing_leads(status, created_at DESC)
  WHERE deleted_at IS NULL;
