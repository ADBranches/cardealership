import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerProfile } from "../types";

type ProfileSummaryCardProps = { profile: CustomerProfile };

export function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const displayName = profile.name || "Customer";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl"><UserRound size={22} />Account summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div><p className="text-sm text-muted-foreground">Display name</p><p className="font-semibold">{displayName}</p></div>
        <div><p className="text-sm text-muted-foreground">Email address</p><p className="flex items-center gap-2 break-all"><Mail size={16} />{profile.email}</p></div>
        <div><p className="text-sm text-muted-foreground">Account access</p><p className="flex items-center gap-2 capitalize"><ShieldCheck size={16} />{profile.role || "customer"}</p></div>
      </CardContent>
    </Card>
  );
}
