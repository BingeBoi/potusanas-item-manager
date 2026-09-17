import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ItemManagerDashboard } from "@/components/item-manager-dashboard";
import { getUserFromSession } from "@/lib/auth";
import { getItems } from "@/lib/inventory";

export default async function DashboardPage() {
  const session = (await cookies()).get("item-manager-session")?.value;
  const user = getUserFromSession(session);
  if (!user) redirect("/login");

  return <ItemManagerDashboard email={user.email} initialItems={await getItems(user.id)} />;
}
