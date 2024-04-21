import React, { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { userAgent } from "next/server";

export function SortableItem({ id, track, rating, index, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {}, [rating, track]);

  return (
    <tr ref={setNodeRef} style={{ ...style }} {...attributes}>
      <td {...listeners}>
        <div className="font-bold">#{index + 1}</div>
      </td>
      <td {...listeners}>
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
      <th {...listeners}>
        <div className="font-bold">{track.artists[0].name}</div>
      </th>
      <th {...listeners}>
        <div className="font-bold">{track.album.name}</div>
      </th>
      <th>
        <button
          disabled={isDragging}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => {
            props.deleteTrackRating(id);
          }}
        >
          Delete
        </button>
      </th>
    </tr>
  );
}
