import React, { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { userAgent } from "next/server";

export function SortableItem({ id, track, rating, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {}, [rating, track]);

  return (
    <tr ref={setNodeRef} style={{ ...style }} {...attributes} {...listeners}>
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
        <div className="font-bold">{track.artists[0].name}</div>
      </th>
      <th>
        <div className="font-bold">{track.album.name}</div>
      </th>
    </tr>
  );
}
