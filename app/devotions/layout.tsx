import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth-server";

export default async function DevotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return <>{children}</>;
}
