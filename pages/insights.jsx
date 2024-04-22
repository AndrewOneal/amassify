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
  const [averageTrackPopularity, setAverageTrackPopularity] = useState(null);
  const [averageArtistPopularity, setAverageArtistPopularity] = useState(null);
  const [topArtistGenres, setTopArtistGenres] = useState([]);
  const [topTrackGenres, setTopTrackGenres] = useState([]);
  const [recentTrackGenres, setRecentTrackGenres] = useState([]);
  const [topAudioFeatures, setTopAudioFeatures] = useState([]);
  const [recentAudioFeatures, setRecentAudioFeatures] = useState([]);

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

  const getTrackAveragePopularity = useCallback(() => {
    if (topTracks && topTracks.items) {
      let sum = 0;
      topTracks.items.forEach((track) => {
        sum += track.popularity;
      });
      setAverageTrackPopularity(sum / topTracks.items.length);
    }
  }, [topTracks]);

  const getArtistAveragePopularity = useCallback(() => {
    if (topArtists && topArtists.items) {
      let sum = 0;
      console.log(topArtists.items);
      topArtists.items.forEach((artist) => {
        sum += artist.popularity;
      });
      console.log(sum / topArtists.items.length);
      setAverageArtistPopularity(sum / topArtists.items.length);
    }
  }, [topArtists]);

  const getTopArtistGenres = useCallback(() => {
    if (topArtists && topArtists.items) {
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
      setTopArtistGenres(sortedGenres.slice(0, 5));
    }
  }, [topArtists]);

  const getTopTrackGenres = useCallback(async () => {
    if (session && session.accessToken && topTracks && topTracks.items) {
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
      setTopTrackGenres(sortedGenres.slice(0, 5));
    }
  }, [session, topTracks]);

  const getRecentTrackGenres = useCallback(async () => {
    if (
      session &&
      session.accessToken &&
      recentlyPlayed &&
      recentlyPlayed.items
    ) {
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
      setRecentTrackGenres(sortedGenres.slice(0, 5));
    }
  }, [session, recentlyPlayed, setRecentTrackGenres]);

  const getTopAudioFeatures = useCallback(async () => {
    if (session && session.accessToken && topTracks && topTracks.items) {
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
      setTopAudioFeatures(sortedFeatures.slice(0, 3));
    }
  }, [session, topTracks, setTopAudioFeatures]);

  const getRecentAudioFeatures = useCallback(async () => {
    if (
      session &&
      session.accessToken &&
      recentlyPlayed &&
      recentlyPlayed.items
    ) {
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
      setRecentAudioFeatures(sortedFeatures.slice(0, 3));
    }
  }, [session, recentlyPlayed, setRecentAudioFeatures]);

  useEffect(() => {
    getProfileData();
    getTopTracks();
    getTopArtists();
    getRecentlyPlayed();
  }, [
    getProfileData,
    getTopTracks,
    getTopArtists,
    getRecentlyPlayed,
    session,
    timeframe,
  ]);

  useEffect(() => {
    getTrackAveragePopularity();
  }, [getTrackAveragePopularity]);

  useEffect(() => {
    getArtistAveragePopularity();
  }, [getArtistAveragePopularity]);

  useEffect(() => {
    getTopArtistGenres();
  }, [getTopArtistGenres]);

  useEffect(() => {
    getTopTrackGenres();
  }, [getTopTrackGenres]);

  useEffect(() => {
    getRecentTrackGenres();
  }, [getRecentTrackGenres]);

  useEffect(() => {
    getTopAudioFeatures();
  }, [getTopAudioFeatures]);

  useEffect(() => {
    getRecentAudioFeatures();
  }, [getRecentAudioFeatures]);

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
          <div className="grid grid-cols-4 gap-8 pt-10 place-items-center justify-center items-start">
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Average popularity based on your top tracks:
                </h2>
                <p className="text-2xl font-semibold text-center text-green-500">
                  {averageTrackPopularity}/100
                </p>
                <p className="text-green-500">
                  (100 being the most popular track)
                </p>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Average popularity based on your top artists:
                </h2>
                <p className="text-2xl font-semibold text-center text-green-500">
                  {averageArtistPopularity}/100
                </p>
                <p className="text-green-500">
                  (100 being the most popular artist)
                </p>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Top Genres Based on your top tracks:
                </h2>
                <ol>
                  {topTrackGenres.map((genre, index) => (
                    <li
                      key={index}
                      className="text-2xl font-semibold text-center text-green-500"
                    >
                      {index + 1}. {genre}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Top Genres Based on your top artists:
                </h2>
                <ol>
                  {topArtistGenres.map((genre, index) => (
                    <li
                      key={index}
                      className="text-2xl font-semibold text-center text-green-500"
                    >
                      {index + 1}. {genre}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Top Genres Based on your recent listening history:
                </h2>
                <ol>
                  {recentTrackGenres.map((genre, index) => (
                    <li
                      key={index}
                      className="text-2xl font-semibold text-center text-green-500"
                    >
                      {index + 1}. {genre}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Top Audio Features based on your top tracks:
                </h2>
                <ol>
                  {topAudioFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className="text-2xl font-semibold text-center text-green-500"
                    >
                      {index + 1}. {feature}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Top Audio Features based on your recent listening history:
                </h2>
                <ol>
                  {recentAudioFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className="text-2xl font-semibold text-center text-green-500"
                    >
                      {index + 1}. {feature}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-20"></div>
    </main>
  );
}
