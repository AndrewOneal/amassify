import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import NavBar from "../components/nav_bar.jsx";
import { useCallback } from "react";

export default function Insights() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
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

  const getRecentlyPlayed = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      setRecentlyPlayed(data);
    }
  }, [session]);

  function getTrackAveragePopularity() {
    let sum = 0;
    topTracks.items.forEach((track) => {
      sum += track.popularity;
    });
    return sum / topTracks.items.length;
  }

  function getArtistAveragePopularity() {
    let sum = 0;
    console.log(topArtists.items);
    topArtists.items.forEach((artist) => {
      sum += artist.popularity;
    });
    console.log(sum / topArtists.items.length);
    return sum / topArtists.items.length;
  }

  function getTopArtistGenres() {
    let genres = {};
    topArtists.items.forEach((artist) => {
      artist.genres.forEach((genre) => {
        if (genres[genre]) {
          genres[genre] += 1;
        } else {
          genres[genre] = 1;
        }
      });
    });
    let sortedGenres = Object.keys(genres).sort(
      (a, b) => genres[b] - genres[a]
    );
    return sortedGenres.slice(0, 5);
  }

  async function getTopTrackGenres() {
    if (session && session.accessToken) {
      const artistIds = [
        ...new Set(topTracks.items.map((item) => item.artists[0].id)),
      ].join(",");

      const response = await fetch(
        `https://api.spotify.com/v1/artists/?ids=${artistIds}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const artistData = await response.json();

      let genres = {};
      artistData.artists.forEach((artist) => {
        artist.genres.forEach((genre) => {
          if (genres[genre]) {
            genres[genre] += 1;
          } else {
            genres[genre] = 1;
          }
        });
      });
      let sortedGenres = Object.keys(genres).sort(
        (a, b) => genres[b] - genres[a]
      );
      return sortedGenres.slice(0, 5);
    }
  }

  async function getRecentTrackGenres() {
    if (session && session.accessToken) {
      const artistIds = [
        ...new Set(
          recentlyPlayed.items.map((item) => item.track.artists[0].id)
        ),
      ].join(",");

      const response = await fetch(
        `https://api.spotify.com/v1/artists/?ids=${artistIds}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const artistData = await response.json();

      let genres = {};
      artistData.artists.forEach((artist) => {
        artist.genres.forEach((genre) => {
          if (genres[genre]) {
            genres[genre] += 1;
          } else {
            genres[genre] = 1;
          }
        });
      });
      let sortedGenres = Object.keys(genres).sort(
        (a, b) => genres[b] - genres[a]
      );
      console.log(sortedGenres.slice(0, 5));
      return sortedGenres.slice(0, 5);
    }
  }

  async function getTopAudioFeatures() {
    if (session && session.accessToken) {
      const trackIds = topTracks.items.map((item) => item.id).join(",");
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features/?ids=${trackIds}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const trackFeatureData = await response.json();

      let features = {
        danceability: 0,
        energy: 0,
        speechiness: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        valence: 0,
      };
      trackFeatureData.audio_features.forEach((audioFeature) => {
        features.danceability += audioFeature.danceability;
        features.energy += audioFeature.energy;
        features.speechiness += audioFeature.speechiness;
        features.acousticness += audioFeature.acousticness;
        features.instrumentalness += audioFeature.instrumentalness;
        features.liveness += audioFeature.liveness;
        features.valence += audioFeature.valence;
      });
      for (const feature in features) {
        features[feature] = features[feature] / topTracks.items.length;
      }
      let sortedFeatures = Object.keys(features).sort(
        (a, b) => features[b] - features[a]
      );
      return sortedFeatures.slice(0, 3);
    }
  }

  async function getRecentAudioFeatures() {
    if (session && session.accessToken) {
      const trackIds = recentlyPlayed.items
        .map((item) => item.track.id)
        .join(",");
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features/?ids=${trackIds}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const trackFeatureData = await response.json();

      let features = {
        danceability: 0,
        energy: 0,
        speechiness: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        valence: 0,
      };
      trackFeatureData.audio_features.forEach((audioFeature) => {
        features.danceability += audioFeature.danceability;
        features.energy += audioFeature.energy;
        features.speechiness += audioFeature.speechiness;
        features.acousticness += audioFeature.acousticness;
        features.instrumentalness += audioFeature.instrumentalness;
        features.liveness += audioFeature.liveness;
        features.valence += audioFeature.valence;
      });
      for (const feature in features) {
        features[feature] = features[feature] / recentlyPlayed.items.length;
      }
      let sortedFeatures = Object.keys(features).sort(
        (a, b) => features[b] - features[a]
      );
      console.log(sortedFeatures.slice(0, 3));
      return sortedFeatures.slice(0, 3);
    }
  }

  useEffect(() => {
    getProfileData();
    getTopTracks();
    getTopArtists();
    getRecentlyPlayed();
  }, [getProfileData, getTopTracks, getTopArtists, getRecentlyPlayed]);

  return (
    <main>
      <NavBar className="z-1" />
      <div className="pt-5 pl-20 pr-20">
        <div className="flex flex-col">
          <p className="text-white py-2 font-bold text-5xl">
            Welcome to your insights, {profileData.display_name}
          </p>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chews shoes whose shoes does he choose?</p>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chews shoes whose shoes does he choose?</p>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chews shoes whose shoes does he choose?</p>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chews shoes whose shoes does he choose?</p>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chews shoes whose shoes does he choose?</p>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chews shoes whose shoes does he choose?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-20"></div>
    </main>
  );
}
