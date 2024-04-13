import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
  const {data: session} = useSession();
  const [x, setX] = useState('');
  const [profile, setProfile] = useState([]);
  useEffect(() => {
    async function f() {
      if (session && session.accessToken) {
        setX(session.accessToken)
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        })
        const data = await response.json();
        setProfile(data.display_name);
        console.log('data');
      }
    }
    f();
  },[session]);

  return (
    <main>
      <div>access token: {x}</div>
      <div>Username: {profile}</div>
    </main>
  );
}
