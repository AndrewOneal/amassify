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
  const [userRatings, setUserRatings] = useState([]);

  const getProfileDataAndCheckRankings = useCallback(async () => {
    if (accessToken) {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (data.id) {
        try {
          const record = await pb
            .collection("ratings")
            .getFirstListItem(`spotify_user_ID="${data.id}"`);
          setUserRatings(record.rankings);
        } catch (error) {
          try {
            const record = await pb.collection("ratings").create({
              spotify_user_ID: data.id,
              rankings: [],
            });
            setUserRatings(record.rankings);
          } catch (error) {
            setUserRatings([]);
          }
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
      <DndContext>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Ratings</h1>
          <div className="flex flex-col items-center justify-center">
            {userRatings.map((rating, index) => (
              <div key={index} className="flex items-center justify-center">
                <p>{rating}</p>
                <button>Delete</button>
              </div>
            ))}
          </div>
          <button>Add Rating</button>
          <button>Delete All</button>
        </div>
      </DndContext>
    </main>
  );
}
