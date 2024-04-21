import NavBar from "@/components/nav_bar";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import PocketBase from "pocketbase";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "@/components/SortableItem";

// 1. get all existing ratings from the database
// 2. query the spotify api for the track data
// 3. display the track data in a dnd component
// 4. on change
// 5. update the useState for that item type
// 6. rebuild the json from the useState and update the db with the new item
// 7. query spotify again for track data

const pb = new PocketBase("https://amassify.pockethost.io");

export default function Ratings() {
  const { data: session } = useSession();
  const [trackRatings, setTrackRatings] = useState([]);
  const [albumRatings, setAlbumRatings] = useState([]);
  const [artistRatings, setArtistRatings] = useState([]);
  const [trackData, setTrackData] = useState([]);

  const [items, setItems] = useState(["A", "B", "C"]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        const newArray = arrayMove(items, oldIndex, newIndex);

        console.log(newArray);

        return newArray;
      });
    }
  }

  function addItem() {
    setItems((items) => {
      let letter = String.fromCharCode(
        items[items.length - 1].charCodeAt(0) + 1
      );

      if (items.includes(letter)) {
        console.log("already exists");
        return items;
      } else {
        return [...items, letter];
      }
    });
  }

  const getProfileDataAndCheckRankings = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const data = await response.json();

      const retryDelay = 1000;
      const maxRetries = 3;

      let retries = 0;
      let record;

      while (!record && retries < maxRetries) {
        try {
          record = await pb
            .collection("ratings")
            .getFirstListItem(`spotify_user_ID="${data.id}"`);
        } catch (error) {
          console.error(
            `Attempt ${retries + 1} failed. Retrying after delay...`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retries++;
        }
      }

      if (record) {
        setTrackRatings(record.tracks);
        setAlbumRatings(record.albums);
        setArtistRatings(record.artists);
      } else {
        const record = await pb.collection("ratings").create({
          spotify_user_ID: data.id,
          tracks: [],
          albums: [],
          artists: [],
        });
        setTrackRatings(record.tracks);
        setAlbumRatings(record.albums);
        setArtistRatings(record.artists);
      }
    }
  }, [session]);

  const getTracksFromRanking = useCallback(async () => {
    console.log(trackRatings.map((track) => track.id).join(","));
    console.log(albumRatings);
    console.log(artistRatings);
    if (session && session.accessToken) {
      const response = await fetch(
        `https://api.spotify.com/v1/tracks?ids=${trackRatings
          .map((track) => track.id)
          .join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      console.log(response);
      // setTrackData(response.json());
    }
  }, [session]);

  async function getTrack() {
    const response = await fetch(
      "https://api.spotify.com/v1/albums/3myqn4myBolKFhGs0s7lM7",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    console.log(response);
  }

  useEffect(() => {
    async function fetchData() {
      await getProfileDataAndCheckRankings();
      // await getTracksFromRanking();
    }
    fetchData();
  }, []);

  return (
    <main>
      <NavBar />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <button type="button" onClick={addItem}>
          Click Me!
        </button>

        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id) => (
            <SortableItem key={id} id={id} />
          ))}
        </SortableContext>
      </DndContext>
    </main>
  );
}
