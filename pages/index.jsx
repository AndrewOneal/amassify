import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import NavBar from "../components/nav_bar.jsx";
import { useCallback } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [timeframe, setTimeframe] = useState("short_term");

  const getProfileData = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const data = await response.json();
      setProfileData(data);
    }
  }, [session]);

  const getTopTracks = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeframe}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      setTopTracks(data);
    }
  }, [session, timeframe]);

  const getTopArtists = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeframe}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      setTopArtists(data);
    }
  }, [session, timeframe]);

  useEffect(() => {
    getProfileData();
    getTopTracks();
    getTopArtists();
  }, [getProfileData, getTopTracks, getTopArtists]);

  return (
    <main>
      <NavBar className="z-1" />
      <div className="pt-5 pl-20 pr-20">
        <div className="flex flex-col">
          <div className="avatar flex items-center m-4">
            <div className="w-24 rounded-xl z-0">
              <img
                src={
                  profileData.images && profileData.images.length > 1
                    ? profileData.images[1].url
                    : "https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg"
                }
                alt="user image"
              />
            </div>
            <p className="text-white px-8 py-2 font-bold text-5xl">
              {profileData.display_name}
            </p>
          </div>
          <div className="timeframe-selector pt-10">
            <select
              value={timeframe}
              onChange={(e) => {
                setTimeframe(e.target.value);
              }}
              className="select select-bordered w-full max-w-xs"
            >
              <option value="short_term">4 Weeks</option>
              <option value="medium_term">6 Months</option>
              <option value="long_term">Lifetime</option>
            </select>
          </div>
          <div className="table-container">
            <p className="text-white pt-10 pb-10 py-2 font-bold text-4xl">
              Top Played Tracks
            </p>
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
                                      : "https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg"
                                  }
                                  alt="album_img"
                                />
                              </div>
                            </div>
                            <div className="font-bold">{track.name}</div>
                          </div>
                        </td>
                        <th>
                          <div className="font-bold">
                            {track.artists[0].name}
                          </div>
                        </th>
                        <th>
                          <div className="font-bold">{track.album.name}</div>
                        </th>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="text-white pt-10 pb-10 py-2 font-bold text-4xl">
              Top Artists
            </p>
            <div className="max-h-[20rem] overflow-y-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-left px-12"></th>
                    <th className="text-left px-12">Artist</th>
                    <th className="text-left px-12">Genre</th>
                    <th className="text-left px-12">Followers</th>
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
                                      : "https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg"
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
                        <th>
                          <div className="font-bold">
                            {artist.followers.total.toLocaleString()}
                          </div>
                        </th>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="h-20"></div>
    </main>
  );
}
