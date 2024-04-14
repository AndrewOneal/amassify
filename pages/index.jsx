import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import BottomNav from '../components/bottom_nav.jsx';
import Image from 'next/image';

export default function Home() {
  const {data: session} = useSession();
  const [profileData, setProfileData] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  useEffect(() => {
    async function getProfileData() {
      if (session && session.accessToken) {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        })
        const data = await response.json();
        setProfileData(data);
      }
    }

    async function getTopTracks() {
      if (session && session.accessToken) {
        const response = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        })
        const data = await response.json();
        setTopTracks(data);
        console.log(data);
      }
    }

    getProfileData();
    getTopTracks();
  },[session]);
  return (
    <main className='pt-20 pl-20'>
      <div className='flex flex-col items-start'>
        <div className="avatar">
            <div className="w-24 rounded-xl">
              <img src={profileData.images && profileData.images.length > 1 ? profileData.images[1].url : 'default_image_url'} alt="user image" />
            </div>
            <p class='text-white px-8 py-2 font-bold text-lg text-5xl'>Welcome to your profile, {profileData.display_name}!</p>
        </div>
        <div>
        <p class='text-white pt-10 py-2 font-bold text-lg text-5xl'> Top played </p>
        <div className="collapse collapse-arrow bg-base-200">
          <input type="radio" name="my-accordion-2" defaultChecked /> 
          <div className="collapse-title text-xl font-medium">
            Click to open this one and close others
          </div>
          <div className="collapse-content"> 
            <p>hello</p>
          </div>
        </div>
        <div className="collapse collapse-arrow bg-base-200">
          <input type="radio" name="my-accordion-2" /> 
          <div className="collapse-title text-xl font-medium">
            Click to open this one and close others
          </div>
          <div className="collapse-content"> 
            <p>hello</p>
          </div>
        </div>
        <div className="collapse collapse-arrow bg-base-200">
          <input type="radio" name="my-accordion-2" /> 
          <div className="collapse-title text-xl font-medium">
            Click to open this one and close others
          </div>
          <div className="collapse-content"> 
            <p>hello</p>
          </div>
        </div>
        </div>
        <div class='pt-10 pb-20'>
            <button className='text-white px-8 py-2 rounded-full bg-green-500 font-bold text-lg align' onClick={()=>signOut('spotify', { callbackUrl: "/login"}) }>Logout</button>
        </div>
      </div>
      <BottomNav class='pt-20' />
    </main>
  );
}
