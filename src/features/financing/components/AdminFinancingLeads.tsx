import { useEffect, useState } from "react";
import { authenticatedApiRequest } from "../../../api/client";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useAuth } from "../../../features/auth/hooks";

type Lead = {
  id: number;
  reference_code: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp?: string | null;
  customer_email?: string | null;
  car_name: string;
  status: string;
  monthly_payment: string;
  created_at: string;
  admin_notes: string;
};
type LeadDetail = Lead & {
  car_image?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  condition?: string | null;
  vehicle_price_snapshot: string;
  down_payment: string;
  loan_amount: string;
  annual_interest_rate: string;
  loan_term_months: number;
  total_payment: string;
  total_interest: string;
  currency: string;
  consented_at: string;
  updated_at: string;
  last_contacted_at?: string | null;
  converted_at?: string | null;
};
type Metrics = {
  total: string;
  new: string;
  contacted: string;
  qualified: string;
  converted: string;
  closed: string;
  conversionPercentage: number;
};
const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"];
const money = (value: string | number, currency = "UGX") =>
  `${currency} ${Number(value).toLocaleString()}`;
const date = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "—";

export function AdminFinancingLeads() {
  const { accessToken } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<LeadDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!accessToken) return;
    try {
      const [leadResponse, metricResponse] = await Promise.all([
        authenticatedApiRequest(
          `/api/finance/leads${status ? `?status=${status}` : ""}`,
          accessToken,
        ),
        authenticatedApiRequest("/api/finance/leads/metrics", accessToken),
      ]);
      const payload = await leadResponse.json();
      const metricPayload = await metricResponse.json();
      if (!leadResponse.ok)
        throw new Error(payload.error?.message || "Unable to load leads.");
      setLeads(payload.leads);
      if (metricResponse.ok) setMetrics(metricPayload.metrics);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to load leads.",
      );
    }
  };

  useEffect(() => {
    void load();
  }, [accessToken, status]);

  const update = async (
    id: number,
    next?: string,
    detail?: LeadDetail | null,
  ) => {
    if (!accessToken) return;
    try {
      const response = await authenticatedApiRequest(
        `/api/finance/leads/${id}`,
        accessToken,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next, adminNotes: notes[id] }),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error?.message || "Unable to update this quote.",
        );
      if (detail)
        setSelected({
          ...detail,
          ...payload.lead,
          admin_notes: payload.lead.admin_notes,
        });
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update this quote.",
      );
    }
  };

  const viewLead = async (id: number) => {
    if (!accessToken) return;
    setDetailsLoading(true);
    setError("");
    try {
      const response = await authenticatedApiRequest(
        `/api/finance/leads/${id}`,
        accessToken,
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error?.message || "Unable to load quote details.",
        );
      setSelected(payload.lead);
      setNotes((current) => ({
        ...current,
        [id]: payload.lead.admin_notes || "",
      }));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load quote details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const archiveLead = async (lead: LeadDetail) => {
    if (
      !accessToken ||
      !window.confirm(
        `Archive quote ${lead.reference_code}? It will disappear from the active sales queue but remain in the database audit history.`,
      )
    )
      return;
    try {
      const response = await authenticatedApiRequest(
        `/api/finance/leads/${lead.id}`,
        accessToken,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error?.message || "Unable to archive this quote.",
        );
      setSelected(null);
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to archive this quote.",
      );
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Every submitted financing request is retained as an auditable sales
        lead. Open a quote to view its vehicle, estimate, customer contact
        details, and follow-up history.
      </p>
      {metrics && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {[
            ["Total", metrics.total],
            ["New", metrics.new],
            ["Contacted", metrics.contacted],
            ["Qualified", metrics.qualified],
            ["Converted", metrics.converted],
            ["Conversion", `${metrics.conversionPercentage}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded border p-3">
              <small>{label}</small>
              <strong className="block text-lg">{value}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded border p-2"
        >
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Button variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Reference</th>
              <th>Customer & contact details</th>
              <th>Vehicle</th>
              <th>Monthly</th>
              <th>Status</th>
              <th>Notes</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b">
                <td className="p-3 font-medium">{lead.reference_code}</td>
                <td>
                  {lead.customer_name}
                  <br />
                  <span className="text-muted-foreground">
                    Phone: {lead.customer_phone}
                  </span>
                  {lead.customer_whatsapp && (
                    <>
                      <br />
                      <span className="text-muted-foreground">
                        WhatsApp: {lead.customer_whatsapp}
                      </span>
                    </>
                  )}
                  {lead.customer_email && (
                    <>
                      <br />
                      <span className="text-muted-foreground">
                        Email: {lead.customer_email}
                      </span>
                    </>
                  )}
                </td>
                <td>{lead.car_name}</td>
                <td>{money(lead.monthly_payment)}</td>
                <td>
                  <select
                    value={lead.status}
                    onChange={(event) =>
                      void update(lead.id, event.target.value)
                    }
                    className="rounded border p-1"
                  >
                    {statuses.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={notes[lead.id] ?? lead.admin_notes ?? ""}
                    onChange={(event) =>
                      setNotes({ ...notes, [lead.id]: event.target.value })
                    }
                    className="min-w-48 rounded border p-1"
                    placeholder="Follow-up note"
                  />
                </td>
                <td className="space-x-2 whitespace-nowrap p-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void viewLead(lead.id)}
                  >
                    View
                  </Button>
                  <Button size="sm" onClick={() => void update(lead.id)}>
                    Save
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads.length && (
          <p className="p-6 text-muted-foreground">
            No financing leads match this filter.
          </p>
        )}
      </div>
      <Dialog
        open={Boolean(selected) || detailsLoading}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setDetailsLoading(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailsLoading
                ? "Loading quote…"
                : `Quote ${selected?.reference_code}`}
            </DialogTitle>
            <DialogDescription>
              Full customer request and finance estimate. Updating status or
              notes preserves the quote record for sales follow-up.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <div className="grid gap-5 rounded-xl border bg-muted/30 p-4 md:grid-cols-[200px_1fr]">
                <div className="overflow-hidden rounded-lg bg-muted">
                  {selected.car_image ? (
                    <img
                      src={selected.car_image}
                      alt={selected.car_name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                      No vehicle image was uploaded for this vehicle.
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                    Requested vehicle
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">
                    {selected.car_name}
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    {[
                      selected.make,
                      selected.model,
                      selected.year,
                      selected.condition,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-3 text-lg font-semibold">
                    Vehicle value at quote:{" "}
                    {money(selected.vehicle_price_snapshot, selected.currency)}
                  </p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-xl border p-4">
                  <h4 className="font-semibold">Customer contact</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Name</dt>
                      <dd>{selected.customer_name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd>{selected.customer_phone}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">WhatsApp</dt>
                      <dd>{selected.customer_whatsapp || "Not supplied"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>{selected.customer_email || "Not supplied"}</dd>
                    </div>
                  </dl>
                </section>
                <section className="rounded-xl border p-4">
                  <h4 className="font-semibold">Finance estimate</h4>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Down payment</dt>
                      <dd>{money(selected.down_payment, selected.currency)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Loan amount</dt>
                      <dd>{money(selected.loan_amount, selected.currency)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Rate</dt>
                      <dd>{selected.annual_interest_rate}% yearly</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Term</dt>
                      <dd>{selected.loan_term_months} months</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Monthly estimate
                      </dt>
                      <dd className="font-semibold">
                        {money(selected.monthly_payment, selected.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Total interest</dt>
                      <dd>
                        {money(selected.total_interest, selected.currency)}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
              <section className="rounded-xl border p-4">
                <h4 className="font-semibold">Lead follow-up</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
                  <select
                    value={selected.status}
                    onChange={(event) =>
                      setSelected({ ...selected, status: event.target.value })
                    }
                    className="rounded border p-2"
                  >
                    {statuses.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <input
                    value={notes[selected.id] ?? selected.admin_notes ?? ""}
                    onChange={(event) =>
                      setNotes({ ...notes, [selected.id]: event.target.value })
                    }
                    className="rounded border p-2"
                    placeholder="Internal sales follow-up note"
                  />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Received: {date(selected.created_at)} · Last updated:{" "}
                  {date(selected.updated_at)} · Last contacted:{" "}
                  {date(selected.last_contacted_at)} · Converted:{" "}
                  {date(selected.converted_at)}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      void update(selected.id, selected.status, selected)
                    }
                  >
                    Save lead update
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-700 hover:text-red-800"
                    onClick={() => void archiveLead(selected)}
                  >
                    Archive quote
                  </Button>
                </div>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
