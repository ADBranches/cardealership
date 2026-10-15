-- Optional WhatsApp contact for financing follow-up. The primary phone remains required.
ALTER TABLE financing_leads
  ADD COLUMN IF NOT EXISTS customer_whatsapp VARCHAR(40);
