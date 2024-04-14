import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import BottomNav from "../components/nav_bar.jsx";

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
        console.log(data);
        setProfileData(data);
      }
    }
    getProfileData();
  }, [session]);
  return (
    <main>
      <style jsx>{`
        img {
          border-radius: 50%;
        }
        text {
          font-size: 140px;
        }
      `}</style>
      <div className="avatar">
        <div className="w-24 rounded-xl">
          <img
            src={
              profileData.images && profileData.images.length > 1
                ? profileData.images[1].url
                : "default_image_url"
            }
            alt="user image"
          />
        </div>
      </div>
      <p>Username: {profileData.display_name}</p>
      <button
        className="text-white px-8 py-2 rounded-full bg-green-500 font-bold text-lg"
        onClick={() => signOut("spotify", { callbackUrl: "/login" })}
      >
        Logout
      </button>
      <BottomNav />
    </main>
  );
}
