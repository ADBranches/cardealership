import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AdminListingsTable } from "./AdminListingsTable";
import { AddNewCarForm } from "./AddNewCarForm";
import { DispatchBoard } from "../../../features/admin-dispatch/components";
import { AdminFinancingLeads } from "../../../features/financing/components/AdminFinancingLeads";

/**
 * AdminDashboard
 *
 * Purpose:
 * Private admin inventory dashboard for dealership managers.
 *
 * Responsibilities:
 * - Verify administrator access.
 * - Provide inventory workflow navigation.
 * - Host vehicle creation, inventory management, and dispatch operations.
 *
 * Inventory data is owned by the inventory components rather than being
 * supplied by the application router.
 */
export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "financing-leads"
      ? "financing-leads"
      : "add-vehicle",
  );

  const { user, isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <section
        className="min-h-screen py-24 px-6 lg:px-8 bg-background"
        aria-busy="true"
        aria-label="Verifying administrator access"
      >
        <p role="status" aria-live="polite">
          Verifying administrator access...
        </p>
      </section>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <section className="min-h-screen py-24 px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-primary">
            Administrator access required
          </p>

          <h3 className="mb-4 text-4xl font-bold md:text-6xl">
            ACCESS UNAVAILABLE
          </h3>

          <p className="text-lg text-muted-foreground">
            A verified administrator session is required.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-primary text-sm font-bold tracking-[0.3em] mb-4 uppercase">
            Admin
          </p>

          <h3 className="text-5xl md:text-6xl font-bold mb-4">
            INVENTORY CONTROL PANEL
          </h3>

          <p className="text-muted-foreground text-lg">
            Admin access confirmed. Manage current listings, update pricing, or
            prepare sold vehicles for removal.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(tab) => {
            setActiveTab(tab);
            setSearchParams(tab === "add-vehicle" ? {} : { tab });
          }}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-8 h-12">
            <TabsTrigger value="add-vehicle" className="font-semibold">
              Add Vehicle
            </TabsTrigger>

            <TabsTrigger value="manage-inventory" className="font-semibold">
              Manage Inventory
            </TabsTrigger>

            <TabsTrigger value="dispatch" className="font-semibold">
              Dispatch Board
            </TabsTrigger>
            <TabsTrigger value="financing-leads" className="font-semibold">
              Financing Leads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-vehicle">
            <AddNewCarForm
              onPublishSuccess={() => setActiveTab("manage-inventory")}
            />
          </TabsContent>

          <TabsContent value="manage-inventory">
            <AdminListingsTable />
          </TabsContent>

          <TabsContent value="dispatch">
            <DispatchBoard />
          </TabsContent>
          <TabsContent value="financing-leads">
            <AdminFinancingLeads />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
