import NavBar from "@/components/nav_bar";
import { useSession } from "next-auth/react";
import React, { useEffect, useState, useCallback } from "react";
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
import { SortableAlbum } from "@/components/SortableAlbum";
import { SortableArtist } from "@/components/SortableArtist";

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
  const [userId, setUserId] = useState("");
  const [trackRatings, setTrackRatings] = useState([]);
  const [albumRatings, setAlbumRatings] = useState([]);
  const [artistRatings, setArtistRatings] = useState([]);
  const [trackData, setTrackData] = useState([]);
  const [albumData, setAlbumData] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [albumSearchResults, setAlbumSearchResults] = useState([]);
  const [artistSearchResults, setArtistSearchResults] = useState([]);
  const [resultsDisplay, setResultsDisplay] = React.useState(null);
  const [albumResultsDisplay, setAlbumResultsDisplay] = React.useState(null);
  const [artistResultsDisplay, setArtistResultsDisplay] = React.useState(null);

  const setFunctions = {
    tracks: setTrackRatings,
    albums: setAlbumRatings,
    artists: setArtistRatings,
  };

  const setDataFunctions = {
    tracks: setTrackData,
    albums: setAlbumData,
    artists: setArtistData,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getProfileDataAndCheckRankings = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const data = await response.json();
      setUserId(data.id);

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

  const getItemsFromRanking = useCallback(
    async (itemIds, itemType) => {
      if (session && session.accessToken) {
        const response = await fetch(
          `https://api.spotify.com/v1/${itemType}?ids=${itemIds
            .map((item) => item)
            .join(",")}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const setFunction = setDataFunctions[itemType];
        const data = await response.json();
        setFunction(data);
      }
    },
    [session]
  );

  function handleDragEnd(event, itemType) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const setFunction = setFunctions[itemType];

      setFunction((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        updateDbItems(newArray, itemType);
        return newArray;
      });
    }
  }

  async function updateDbItems(items, itemType) {
    const retryDelay = 1000;
    const maxRetries = 3;

    let retries = 0;
    let record;

    while (!record && retries < maxRetries) {
      try {
        record = await pb
          .collection("ratings")
          .getFirstListItem(`spotify_user_ID="${userId}"`);
        const response = await pb
          .collection("ratings")
          .update(record.id, { [itemType]: items });
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed. Retrying after delay...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retries++;
      }
    }
  }

  async function deleteItemRating(index, itemType) {
    const setFunction = setFunctions[itemType];

    setFunction((items) => {
      const newArray = [...items];
      newArray.splice(index, 1);
      updateDbItems(newArray, itemType);
      return newArray;
    });
  }

  async function searchItem(searchTerm, itemType) {
    if (session && session.accessToken && searchTerm) {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${searchTerm}&type=${itemType}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      console.log(response);
      const data = await response.json();
      return data;
    }
  }

  const handleItemClick = (itemId, itemType, modalId) => {
    const setFunction = setFunctions[itemType];
    setFunction((prevItemRatings) => {
      const updatedTrackRatings = [...prevItemRatings, itemId];
      updateDbItems(updatedTrackRatings, itemType);
      return updatedTrackRatings;
    });
    setSearchResults([]);
    setAlbumSearchResults([]);
    setArtistSearchResults([]);
    document.getElementById(modalId).close();
  };

  useEffect(() => {
    async function fetchData() {
      await getProfileDataAndCheckRankings();
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (trackRatings.length > 0) {
      getItemsFromRanking(trackRatings, "tracks");
    }
  }, [trackRatings]);

  useEffect(() => {
    if (albumRatings.length > 0) {
      getItemsFromRanking(albumRatings, "albums");
    }
  }, [albumRatings]);

  useEffect(() => {
    if (artistRatings.length > 0) {
      getItemsFromRanking(artistRatings, "artists");
    }
  }, [artistRatings]);

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      const newDisplay = (
        <div>
          <p>Results:</p>
          <table className="table">
            <thead>
              <tr>
                <th className="text-left px-12">Track</th>
                <th className="text-left px-12">Artist</th>
                <th className="text-left px-12">Album</th>
              </tr>
            </thead>
            <tbody>
              {searchResults &&
                searchResults.map((track, index) => (
                  <tr
                    key={index}
                    onClick={() =>
                      handleItemClick(track.id, "tracks", "my_modal_3")
                    }
                  >
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
      );
      setResultsDisplay(newDisplay);
    }
  }, [searchResults]);

  useEffect(() => {
    if (albumSearchResults && albumSearchResults.length > 0) {
      const newDisplay = (
        <div>
          <p>Results:</p>
          <table className="table">
            <thead>
              <tr>
                <th className="text-left px-12">Album</th>
                <th className="text-left px-12">Artist</th>
              </tr>
            </thead>
            <tbody>
              {albumSearchResults &&
                albumSearchResults.map((album, index) => (
                  <tr
                    key={index}
                    onClick={() =>
                      handleItemClick(album.id, "albums", "my_modal_2")
                    }
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-12 h-12">
                            <img
                              src={
                                album.images.length > 0
                                  ? album.images[0].url
                                  : "https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg"
                              }
                              alt="album_img"
                            />
                          </div>
                        </div>
                        <div className="font-bold">{album.name}</div>
                      </div>
                    </td>
                    <th>
                      <div className="font-bold">{album.artists[0].name}</div>
                    </th>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );
      setAlbumResultsDisplay(newDisplay);
    }
  }, [albumSearchResults]);

  useEffect(() => {
    if (artistSearchResults && artistSearchResults.length > 0) {
      const newDisplay = (
        <div>
          <p>Results:</p>
          <table className="table">
            <thead>
              <tr>
                <th className="text-left px-12">Artist</th>
              </tr>
            </thead>
            <tbody>
              {artistSearchResults &&
                artistSearchResults.map((artist, index) => (
                  <tr
                    key={index}
                    onClick={() =>
                      handleItemClick(artist.id, "artists", "my_modal_1")
                    }
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-12 h-12">
                            <img
                              src={
                                artist.images.length > 0
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );
      setArtistResultsDisplay(newDisplay);
    }
  }, [artistSearchResults]);

  return (
    <main>
      <NavBar />
      <div className="pt-5 pl-20 pr-20">
        <div className="flex flex-col">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, "tracks")}
          >
            <div className="table-container">
              <p className="text-white pt-10 pb-10 py-2 font-bold text-4xl">
                Your Top Track Rankings
              </p>
              <button
                className="btn"
                onClick={() =>
                  document.getElementById("my_modal_3").showModal()
                }
              >
                Add Track
              </button>
              <dialog
                id="my_modal_3"
                className="modal"
                onClose={() => setSearchResults([])}
              >
                <div className="modal-box max-w-5xl">
                  <form method="dialog">
                    <button
                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      onClick={() => {
                        document.getElementById("my_modal_3").close();
                        setSearchResults([]);
                      }}
                    >
                      ✕
                    </button>
                  </form>
                  <h3 className="font-bold text-lg">Search for a track</h3>
                  <input
                    type="text"
                    id="searchTerm"
                    className="input"
                    placeholder="Enter track name"
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      const searchTerm =
                        document.getElementById("searchTerm").value;
                      if (searchTerm) {
                        searchItem(searchTerm, "track").then((data) => {
                          setSearchResults(data.tracks.items);
                        });
                      }
                    }}
                  >
                    Search
                  </button>
                  {resultsDisplay}
                </div>
              </dialog>

              <div className="max-h-[20rem] overflow-y-auto">
                <table className="table ">
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
                    {trackData && trackData.tracks && (
                      <SortableContext
                        items={trackData.tracks}
                        strategy={verticalListSortingStrategy}
                      >
                        {Array.isArray(trackData.tracks) &&
                          trackData.tracks.map((track, index) => (
                            <SortableItem
                              key={index}
                              id={trackRatings[index]}
                              track={track}
                              rating={trackRatings[index]}
                              index={index}
                              deleteTrackRating={() =>
                                deleteItemRating(index, "tracks")
                              }
                            />
                          ))}
                      </SortableContext>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </DndContext>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, "albums")}
          >
            <div className="table-container">
              <p className="text-white pt-10 pb-10 py-2 font-bold text-4xl">
                Your Top Album Rankings
              </p>
              <button
                className="btn"
                onClick={() =>
                  document.getElementById("my_modal_2").showModal()
                }
              >
                Add Album
              </button>
              <dialog
                id="my_modal_2"
                className="modal"
                onClose={() => setAlbumSearchResults([])}
              >
                <div className="modal-box max-w-5xl">
                  <form method="dialog">
                    <button
                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      onClick={() => {
                        document.getElementById("my_modal_2").close();
                        setAlbumSearchResults([]);
                      }}
                    >
                      ✕
                    </button>
                  </form>
                  <h3 className="font-bold text-lg">Search for an album</h3>
                  <input
                    type="text"
                    id="searchTermAlbum"
                    className="input"
                    placeholder="Enter album name"
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      const searchTerm =
                        document.getElementById("searchTermAlbum").value;
                      if (searchTerm) {
                        searchItem(searchTerm, "album").then((data) => {
                          console.log(data);
                          setAlbumSearchResults(data.albums.items);
                        });
                      }
                    }}
                  >
                    Search
                  </button>
                  {albumResultsDisplay}
                </div>
              </dialog>

              <div className="max-h-[20rem] overflow-y-auto">
                <table className="table ">
                  <thead>
                    <tr>
                      <th className="text-left px-12"></th>
                      <th className="text-left px-12">Album</th>
                      <th className="text-left px-12">Artist</th>
                      <th className="text-left px-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {albumData && albumData.albums && (
                      <SortableContext
                        items={albumData.albums}
                        strategy={verticalListSortingStrategy}
                      >
                        {Array.isArray(albumData.albums) &&
                          albumData.albums.map((album, index) => (
                            <SortableAlbum
                              key={index}
                              id={albumRatings[index]}
                              item={album}
                              rating={albumRatings[index]}
                              index={index}
                              deleteAlbumRating={() =>
                                deleteItemRating(index, "albums")
                              }
                            />
                          ))}
                      </SortableContext>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </DndContext>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, "artists")}
          >
            <div className="table-container">
              <p className="text-white pt-10 pb-10 py-2 font-bold text-4xl">
                Your Top Artist Rankings
              </p>
              <button
                className="btn"
                onClick={() =>
                  document.getElementById("my_modal_1").showModal()
                }
              >
                Add Artist
              </button>
              <dialog
                id="my_modal_1"
                className="modal"
                onClose={() => setArtistSearchResults([])}
              >
                <div className="modal-box max-w-5xl">
                  <form method="dialog">
                    <button
                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      onClick={() => {
                        document.getElementById("my_modal_1").close();
                        setArtistSearchResults([]);
                      }}
                    >
                      ✕
                    </button>
                  </form>
                  <h3 className="font-bold text-lg">Search for an Artist</h3>
                  <input
                    type="text"
                    id="searchTermArtist"
                    className="input"
                    placeholder="Enter artist name"
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      const searchTerm =
                        document.getElementById("searchTermArtist").value;
                      if (searchTerm) {
                        searchItem(searchTerm, "artist").then((data) => {
                          console.log(data);
                          setArtistSearchResults(data.artists.items);
                        });
                      }
                    }}
                  >
                    Search
                  </button>
                  {artistResultsDisplay}
                </div>
              </dialog>

              <div className="max-h-[20rem] overflow-y-auto">
                <table className="table ">
                  <thead>
                    <tr>
                      <th className="text-left px-12"></th>
                      <th className="text-left px-12">Artist</th>
                      <th className="text-left px-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {artistData && artistData.artists && (
                      <SortableContext
                        items={artistData.artists}
                        strategy={verticalListSortingStrategy}
                      >
                        {Array.isArray(artistData.artists) &&
                          artistData.artists.map((artist, index) => (
                            <SortableArtist
                              key={index}
                              id={artistRatings[index]}
                              item={artist}
                              rating={artistRatings[index]}
                              index={index}
                              deleteArtistRating={() =>
                                deleteItemRating(index, "artists")
                              }
                            />
                          ))}
                      </SortableContext>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </DndContext>
        </div>
      </div>
    </main>
  );
}
