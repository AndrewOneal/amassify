import NavBar from "@/components/nav_bar";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { DndContext } from "@dnd-kit/core";
import PocketBase from "pocketbase";

// get data from database on load
// query spotify with array of song, album, artist ids
// fill dnds with data
// add song/album/artist to dnd
// query spotify for song/album/artist data
// add item to the database, refresh list of items
// delete button on each item, delete item from database, refresh list of items
// delete everything button, delete all items from database, refresh list of items??

const pb = new PocketBase("https://amassify.pockethost.io");

export default function Ratings() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  const getProfileDataAndCheckRankings = useCallback(async () => {
    if (accessToken) {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setProfileData(data);

      if (data.id) {
        try {
          const record = await pb
            .collection("ratings")
            .getFirstListItem(`spotify_user_ID="${data.id}"`);
          console.log("success");
        } catch (error) {
          try {
            const record = await pb.collection("ratings").create({
              spotify_user_ID: data.id,
              rankings: [],
            });
          } catch (error) {}
        }
      }
    }
  }, [accessToken]);

  useEffect(() => {
    if (session && session.accessToken) {
      setAccessToken(session.accessToken);
    }
  }, [session]);

  useEffect(() => {
    getProfileDataAndCheckRankings();
  }, [getProfileDataAndCheckRankings]);

  return (
    <main>
      <NavBar />
    </main>
  );
}
