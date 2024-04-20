import NavBar from "@/components/nav_bar";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { DndContext } from "@dnd-kit/core";
import PocketBase from "pocketbase";

// TO DO:
// - build dnd component(s) for the ranking lists
// - dynamically fill the dnd components with the data from the database
// - add a button to add a new item to each list
//   - query spotify for the item data
//   - figure out how to capture that item data and put it in the database
// - add a delete button to each item
//  - delete the item from the database and refresh
// - add a delete all button, wipes all of the list items from the database and refreshes

const pb = new PocketBase("https://amassify.pockethost.io");

export default function Ratings() {
  const { data: session } = useSession();
  const [accessToken, setAccessToken] = useState(null);
  const [trackRatings, setTrackRatings] = useState([]);
  const [albumRatings, setAlbumRatings] = useState([]);
  const [artistRatings, setArtistRatings] = useState([]);
  const [trackData, setTrackData] = useState([]);

  // const getProfileDataAndCheckRankings = useCallback(async () => {
  //   if (accessToken) {
  //     const response = await fetch("https://api.spotify.com/v1/me", {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //     const data = await response.json();

  //     if (data.id) {
  //       try {
  //         const record = await pb
  //           .collection("ratings")
  //           .getFirstListItem(`spotify_user_ID="${data.id}"`);
  //         setTrackRatings(record.tracks);
  //         setAlbumRatings(record.albums);
  //         setArtistRatings(record.artists);
  //       } catch (error) {
  //         try {
  //           const record = await pb.collection("ratings").create({
  //             spotify_user_ID: data.id,
  //             tracks: [],
  //             albums: [],
  //             artists: [],
  //           });
  //           setTrackRatings(record.tracks);
  //           setAlbumRatings(record.albums);
  //           setArtistRatings(record.artists);
  //         } catch (error) {
  //           setTrackRatings([]);
  //           setAlbumRatings([]);
  //           setArtistRatings([]);
  //         }
  //       }
  //     }
  //   }
  // }, [accessToken]);

  // async function getTracksFromRanking() {
  //   if (accessToken) {
  //     const response = await fetch(
  //       `https://api.spotify.com/v1/tracks?ids=${trackRatings
  //         .map((track) => track.id)
  //         .join(",")}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );
  //     setTrackData(response.json());
  //   }
  // }

  // useEffect(() => {
  //   if (session && session.accessToken) {
  //     setAccessToken(session.accessToken);
  //   }
  // }, [session]);

  // useEffect(() => {
  //   getTracksFromRanking();
  // });

  // useEffect(() => {
  //   getProfileDataAndCheckRankings();
  // console.log(trackRatings);
  // console.log(albumRatings);
  // console.log(artistRatings);
  // }, [
  //   albumRatings,
  //   artistRatings,
  //   getProfileDataAndCheckRankings,
  //   trackRatings,
  // ]);

  return (
    <main>
      <NavBar />
      <DndContext>
        <div className="flex flex-col items-center justify-center">
          <div className="table-container">
            <p className="text-white pt-10 pb-10 py-2 font-bold text-4xl">
              Top Played Tracks
            </p>
            <button onClick={getTracksFromRanking}>Test</button>
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
                  {trackData &&
                    trackData.items &&
                    trackData.items.map((track, index) => (
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
          </div>
        </div>
      </DndContext>
    </main>
  );
}
