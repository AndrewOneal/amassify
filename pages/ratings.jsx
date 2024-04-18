import NavBar from "@/components/nav_bar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";

// get data from database on load
// query spotify with array of song, album, artist ids
// fill dnds with data
// add song/album/artist to dnd
// query spotify for song/album/artist data
// add item to the database, refresh list of items
// delete button on each item, delete item from database, refresh list of items
// delete everything button, delete all items from database, refresh list of items??

export default function Home() {
  const { data: session } = useSession();
  useEffect(() => {}, [session]);
  return (
    <main>
      <NavBar />
    </main>
  );
}
