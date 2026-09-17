import { ItemManagerDashboard } from "@/components/item-manager-dashboard";
import { GUEST_USER_ID, getItems } from "@/lib/inventory";

// Login is paused for the prototype. Restore <LoginShell /> here later.
// import { LoginShell } from "@/components/login-shell";

export default async function Home() {
  return <ItemManagerDashboard initialItems={await getItems(GUEST_USER_ID)} />;
}
