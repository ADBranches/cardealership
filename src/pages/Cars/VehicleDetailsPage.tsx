import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Footer } from "../../app/components/Footer/Footer";
import { Navbar } from "../../app/components/Navbar/Navbar";
import { FinancingQuoteFlow } from "../../features/financing/components/FinancingQuoteFlow";
import { getCarById } from "../../features/cars/services/carsService";
import type { Vehicle } from "../../features/cars/types";

function LoadingDetails() {
  return (
    <main
      className="mx-auto max-w-6xl px-6 pb-20 pt-32 lg:px-8"
      aria-busy="true"
    >
      <div className="mb-8 h-10 w-36 animate-pulse rounded bg-muted" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="h-20 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </main>
  );
}

export function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const vehicleId = Number(id);
    if (!Number.isInteger(vehicleId)) {
      setLoading(false);
      setNotFound(true);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setNotFound(false);
    setError("");
    getCarById(vehicleId)
      .then((vehicle) => {
        if (!active) return;
        if (vehicle) setCar(vehicle);
        else setNotFound(true);
      })
      .catch((caught) => {
        if (active)
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load this vehicle.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  let content: React.ReactNode;
  if (loading) content = <LoadingDetails />;
  else if (error)
    content = (
      <main className="mx-auto max-w-3xl px-6 py-40 text-center">
        <h1 className="text-3xl font-bold">We could not load this vehicle</h1>
        <p className="mt-3 text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={() => navigate("/")}>
          Return to inventory
        </Button>
      </main>
    );
  else if (notFound || !car)
    content = (
      <main className="mx-auto max-w-3xl px-6 py-40 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Inventory
        </p>
        <h1 className="mt-3 text-3xl font-bold">Vehicle not found</h1>
        <p className="mt-3 text-muted-foreground">
          This vehicle may no longer be available, or the link may be incorrect.
        </p>
        <Button className="mt-6" onClick={() => navigate("/")}>
          Return to inventory
        </Button>
      </main>
    );
  else
    content = (
      <main className="mx-auto max-w-6xl space-y-10 px-6 pb-20 pt-32 lg:px-8">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to inventory
        </Button>
        <section className="grid gap-8 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-2 md:p-8">
          <img
            src={car.image}
            alt={car.name}
            className="h-80 w-full rounded-xl object-cover md:h-full md:min-h-96"
          />
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              {car.status}
            </p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">{car.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {car.make} {car.model || ""} · {car.year} · {car.condition}
            </p>
            <p className="my-6 text-3xl font-bold">
              UGX {Number(car.price).toLocaleString()}
            </p>
            <p className="leading-7 text-muted-foreground">
              {car.description ||
                "Contact Panda Motors for the complete vehicle specification."}
            </p>
          </div>
        </section>
        <FinancingQuoteFlow vehicle={car} />
      </main>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {content}
      <Footer />
    </div>
  );
}
