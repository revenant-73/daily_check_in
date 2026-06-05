import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminData } from "@/app/actions/admin";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  try {
    const data = await getAdminData();
    return (
      <AdminDashboardClient 
        initialData={data} 
        userName={session.user.name} 
      />
    );
  } catch (error) {
    console.error("Error fetching admin data:", error);
    throw error;
  }
}
