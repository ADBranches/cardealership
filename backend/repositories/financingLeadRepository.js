import db from "../config/db.js";
export const findEligibleCar = (id) =>
  db
    .query("SELECT id,name,price,is_available,status FROM cars WHERE id=$1", [
      id,
    ])
    .then((r) => r.rows[0]);
export const findByKey = (key) =>
  db
    .query(
      "SELECT id,reference_code FROM financing_leads WHERE idempotency_key=$1",
      [key],
    )
    .then((r) => r.rows[0]);
export async function insertLead(lead) {
  const q = `INSERT INTO financing_leads (reference_code,idempotency_key,car_id,user_id,customer_name,customer_phone,customer_whatsapp,customer_email,vehicle_price_snapshot,down_payment,loan_amount,annual_interest_rate,loan_term_months,monthly_payment,total_payment,total_interest,currency,contact_consent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id,reference_code,status,created_at`;
  const p = [
    lead.referenceCode,
    lead.idempotencyKey,
    lead.carId,
    lead.userId,
    lead.customerName,
    lead.customerPhone,
    lead.customerWhatsapp,
    lead.customerEmail,
    lead.price,
    lead.downPayment,
    lead.loanAmount,
    lead.interestRate,
    lead.term,
    lead.monthlyPayment,
    lead.totalPayment,
    lead.totalInterest,
    "UGX",
    true,
  ];
  return (await db.query(q, p)).rows[0];
}
export async function listLeads({ status, limit, offset }) {
  const q = `SELECT l.*,c.name car_name,c.make,c.model FROM financing_leads l JOIN cars c ON c.id=l.car_id WHERE l.deleted_at IS NULL ${status ? "AND l.status=$1" : ""} ORDER BY l.created_at DESC LIMIT $${status ? 2 : 1} OFFSET $${status ? 3 : 2}`;
  const p = status ? [status, limit, offset] : [limit, offset];
  return (await db.query(q, p)).rows;
}
export const getLead = (id) =>
  db
    .query(
      `SELECT l.*,c.name car_name,c.make,c.model,c.year,c.condition,c.price current_vehicle_price,(SELECT ci.image_url FROM car_images ci WHERE ci.car_id=c.id ORDER BY CASE WHEN ci.image_type='primary' THEN 0 ELSE 1 END,ci.id LIMIT 1) car_image FROM financing_leads l JOIN cars c ON c.id=l.car_id WHERE l.id=$1 AND l.deleted_at IS NULL`,
      [id],
    )
    .then((r) => r.rows[0]);
export async function updateLead(id, { status, adminNotes }) {
  const q = `UPDATE financing_leads SET status=COALESCE($2,status),admin_notes=COALESCE($3,admin_notes),last_contacted_at=CASE WHEN $2 IN ('CONTACTED','QUALIFIED') THEN NOW() ELSE last_contacted_at END,converted_at=CASE WHEN $2='CONVERTED' THEN NOW() ELSE converted_at END,updated_at=NOW() WHERE id=$1 RETURNING *`;
  return (await db.query(q, [id, status ?? null, adminNotes ?? null])).rows[0];
}
export async function softDelete(id, deletedBy, deletionReason) {
  const q = `UPDATE financing_leads SET deleted_at=NOW(),deleted_by=$2,deletion_reason=$3,updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING id,reference_code`;
  return (await db.query(q, [id, deletedBy, deletionReason || null])).rows[0];
}
export async function stats() {
  const q = `SELECT COUNT(*) total,COUNT(*) FILTER(WHERE status='NEW') new,COUNT(*) FILTER(WHERE status='CONTACTED') contacted,COUNT(*) FILTER(WHERE status='QUALIFIED') qualified,COUNT(*) FILTER(WHERE status='CONVERTED') converted,COUNT(*) FILTER(WHERE status='CLOSED') closed FROM financing_leads WHERE deleted_at IS NULL`;
  return (await db.query(q)).rows[0];
}
