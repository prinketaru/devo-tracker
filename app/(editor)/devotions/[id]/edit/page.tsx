import { redirect, notFound } from "next/navigation";
import { getSession } from "@/app/lib/auth-server";
import EditDevotionClient from "./EditDevotionClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditDevotionPage({ params }: PageProps) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  return <EditDevotionClient devotionId={id} />;
}
