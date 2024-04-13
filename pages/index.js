import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const {data: session} = useSession();
  const [profileData, setProfileData] = useState([]);
  useEffect(() => {
    async function getProfileData() {
      if (session && session.accessToken) {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        })
        const data = await response.json();
        console.log(data);
        setProfileData(data);
      }
    }
    getProfileData();
  },[session]);
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
      <img src={profileData.images && profileData.images.length > 1 ? profileData.images[1].url : 'default_image_url'} alt="user image" />
      <p>Username: {profileData.display_name}</p>
    </main>
  );
}
