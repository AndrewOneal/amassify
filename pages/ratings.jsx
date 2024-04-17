import NavBar from "@/components/nav_bar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  useEffect(() => {}, [session]);
  return (
    <main>
      <NavBar />
    </main>
  );
}
