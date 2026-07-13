import { useState } from "react";
import { isAdminUser, isAuthenticated } from "../../lib/auth";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AdminListingsTable } from "./AdminListingsTable";
import { AddNewCarForm } from "./AddNewCarForm";

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

  const authenticated = isAuthenticated();
  const admin = isAdminUser();

  if (!authenticated) {
    return (
      <section className="min-h-screen py-24 px-6 lg:px-8 bg-background flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-primary text-sm font-bold tracking-[0.3em] mb-4 uppercase">
            Admin Access Required
          </p>

          <h3 className="text-4xl md:text-6xl font-bold mb-4">
            PLEASE SIGN IN
          </h3>

          <p className="text-muted-foreground text-lg mb-8">
            You need to sign in with an administrator account before accessing
            the inventory control panel.
          </p>

          {loginNotice && (
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
              {loginNotice}
            </div>
          )}

          <Button
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() =>
              setLoginNotice(
                "The login page is not available yet. This admin dashboard is already protected, and final login routing will be connected once the team confirms the auth flow."
              )
            }
          >
            Sign In Guidance
          </Button>
        </div>
      </section>
    );
  }

  if (!admin) {
    return (
      <section className="min-h-screen py-24 px-6 lg:px-8 bg-background flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-primary text-sm font-bold tracking-[0.3em] mb-4 uppercase">
            Unauthorized
          </p>

          <h3 className="text-4xl md:text-6xl font-bold mb-4">
            ADMIN PERMISSION NEEDED
          </h3>

          <p className="text-muted-foreground text-lg mb-8">
            Your account is signed in, but it does not currently have permission
            to access dealership management tools.
          </p>

          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => window.history.pushState(null, "", "/")}
          >
            Back To Home
          </Button>
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

        <Tabs defaultValue="add-vehicle" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12">
            <TabsTrigger value="add-vehicle" className="font-semibold">
              Add Vehicle
            </TabsTrigger>
            <TabsTrigger value="manage-inventory" className="font-semibold">
              Manage Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-vehicle">
            <AddNewCarForm />
          </TabsContent>

          <TabsContent value="manage-inventory">
            <AdminListingsTable vehicles={vehicles} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
