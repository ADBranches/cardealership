import { useState } from "react";
import { useAuth } from "../../../features/auth/hooks";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AdminListingsTable } from "./AdminListingsTable";
import { AddNewCarForm } from "./AddNewCarForm";
import { DispatchBoard } from "../../../features/admin-dispatch/components";

type AdminVehicle = {
  id: number;
  name: string;
  brand: string;
  type: string;
  year: number;
  price: number;
  condition: string;
  image: string;
  specs: {
    power: string;
    engine: string;
    drive: string;
  };
};

type AdminDashboardProps = {
  vehicles: AdminVehicle[];
};

/**
 * AdminDashboard
 *
 * Purpose:
 * Private admin dashboard entry component for dealership managers.
 *
 * Current behavior:
 * - Blocks unauthenticated users.
 * - Blocks authenticated non-admin users.
 * - Shows inventory controls only when admin access is detected.
 *
 * TODO:
 * Replace temporary localStorage-based auth checks with the team's final
 * JWT/auth provider once the backend role payload and login route are confirmed.
 */

export function AdminDashboard({ vehicles }: AdminDashboardProps) {
  const [loginNotice, setLoginNotice] = useState("");
  const [activeTab, setActiveTab] = useState("add-vehicle");

  const {
    user,
    isAuthenticated,
    isAuthReady,
  } = useAuth();

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8 h-12">
            <TabsTrigger value="add-vehicle" className="font-semibold">
              Add Vehicle
            </TabsTrigger>
            <TabsTrigger value="manage-inventory" className="font-semibold">
              Manage Inventory
            </TabsTrigger>
            <TabsTrigger value="dispatch" className="font-semibold">Dispatch Board</TabsTrigger>
          </TabsList>

          <TabsContent value="add-vehicle">
            <AddNewCarForm onPublishSuccess={() => setActiveTab("manage-inventory")} />
          </TabsContent>

          <TabsContent value="manage-inventory">
            <AdminListingsTable vehicles={vehicles} />
          </TabsContent>
          <TabsContent value="dispatch">
            <DispatchBoard />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
