import { ItemManagerDashboard } from "@/components/item-manager-dashboard";
import { GUEST_USER_ID, getItems } from "@/lib/inventory";

export const dynamic = "force-dynamic";

// Login is paused for the prototype. Restore session checks later:
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { getUserFromSession } from "@/lib/auth";
//
// const session = (await cookies()).get("item-manager-session")?.value;
// const user = getUserFromSession(session);
// if (!user) redirect("/login");

export default async function DashboardPage() {
  return <ItemManagerDashboard initialItems={await getItems(GUEST_USER_ID)} />;
}
