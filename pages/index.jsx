import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import BottomNav from "../components/bottom_nav.jsx";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
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

    async function getTopTracks() {
      if (session && session.accessToken) {
        const response = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?time_range=short_term",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const data = await response.json();
        setTopTracks(data);
      }
    }

    async function getTopArtists() {
      if (session && session.accessToken) {
        const response = await fetch(
          "https://api.spotify.com/v1/me/top/artists?time_range=short_term",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const data = await response.json();
        setTopArtists(data);
        console.log(data);
      }
    }

    getProfileData();
    getTopTracks();
    getTopArtists();
  }, [session]);
  return (
    <main className="pt-10 pl-20">
      <div class="text-white text-8xl pb-20 font-bold">Amassify</div>
      <div className="flex flex-col items-center text-center">
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
          <p class="text-white px-8 py-2 font-bold text-5xl">
            {profileData.display_name}
          </p>
        </div>
        <div>
          <div className="table-container">
            <p class="text-white pt-10 pb-10 py-2 font-bold text-4xl">
              Top played
            </p>
          </div>
          <div className="max-h-[20rem] overflow-y-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-left px-12"></th>
                  <th className="text-left px-12">Track</th>
                  <th className="text-left px-12">Artist</th>
                  <th className="text-left px-12">Album</th>
                  <th className="text-left px-12"></th>
                </tr>
              </thead>
              <tbody>
                {topTracks.items &&
                  topTracks.items.map((track, index) => (
                    <tr key={index}>
                      <td>
                        <div className="font-bold">#{index + 1}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-12 h-12">
                              <img
                                src={
                                  track.album
                                    ? track.album.images[0].url
                                    : "default_image_url"
                                }
                                alt="album_img"
                              />
                            </div>
                          </div>
                          <div className="font-bold">{track.name}</div>
                        </div>
                      </td>
                      <th>
                        <div className="font-bold">{track.artists[0].name}</div>
                      </th>
                      <th>
                        <div className="font-bold">{track.album.name}</div>
                      </th>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div>
            <p class="text-white pt-10 pb-10 py-2 font-bold text-4xl">
              Top Artists
            </p>
          </div>
          <div className="max-h-[20rem] overflow-y-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-left px-12"></th>
                  <th className="text-left px-12">Artist</th>
                  <th className="text-left px-12">Genre</th>
                  <th className="text-left px-12"></th>
                </tr>
              </thead>
              <tbody>
                {topArtists.items &&
                  topArtists.items.map((artist, index) => (
                    <tr key={index}>
                      <td>
                        <div className="font-bold">#{index + 1}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-12 h-12">
                              <img
                                src={
                                  artist.images && artist.images.length > 0
                                    ? artist.images[0].url
                                    : "default_image_url"
                                }
                                alt="album_img"
                              />
                            </div>
                          </div>
                          <div className="font-bold">{artist.name}</div>
                        </div>
                      </td>
                      <th>
                        <div className="font-bold">{artist.genres[0]}</div>
                      </th>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div class="pt-10 pb-20">
          <button
            className="text-white px-8 py-2 rounded-full bg-green-500 font-bold text-lg align"
            onClick={() => signOut("spotify", { callbackUrl: "/login" })}
          >
            Logout
          </button>
        </div>
      </div>
      <BottomNav class="pt-20" />
    </main>
  );
}
