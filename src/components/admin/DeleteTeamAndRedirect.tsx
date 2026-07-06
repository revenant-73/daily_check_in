"use client";

import { DeleteButton } from "./DeleteButton";
import { deleteTeam } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export function DeleteTeamAndRedirect({ teamId }: { teamId: string }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await deleteTeam(id);
    router.push("/admin");
  };

  return (
    <DeleteButton 
      id={teamId} 
      onDelete={handleDelete} 
      confirmMessage="Are you sure you want to delete this entire team and all its data? This cannot be undone."
      className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl"
    />
  );
}
