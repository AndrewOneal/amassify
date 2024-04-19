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

  const checkForExistingRankings = useCallback(async (id) => {
    if (id) {
      try {
        const record = await pb
          .collection("ratings")
          .getFirstListItem(`spotify_user_ID=${id}`);
        console.log(record);
      } catch (error) {
        console.log(error);
        console.log(id);
        try {
          const record = await pb.collection("ratings").create({
            spotify_user_ID: id,
            rankings: [],
          });
          console.log(record);
        } catch (error) {}
      }
    }
  }, []);

  const getProfileData = useCallback(
    async (accessToken, id) => {
      if (accessToken) {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setProfileData(data);
        checkForExistingRankings(id);
      }
    },
    [checkForExistingRankings]
  );

  useEffect(() => {
    if (session && session.accessToken) {
      getProfileData(session.accessToken, session.user.id);
    }
  }, [session, getProfileData]);

  return (
    <main>
      <NavBar />
    </main>
  );
}
