import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import NavBar from "../components/nav_bar.jsx";

export default function Home() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState([]);
  useEffect(() => {
    async function getProfileData() {
      if (session && session.accessToken) {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        const data = await response.json();
        setProfileData(data);
      }
    }
    getProfileData();
  }, [session]);
  return (
    <main>
      <NavBar />
    </main>
  );
}
