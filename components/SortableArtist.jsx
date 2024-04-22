import React, { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { userAgent } from "next/server";

export function SortableArtist({ id, item, rating, index, ...props }) {
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

  useEffect(() => {}, [rating, item]);

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
                  item
                    ? item.images[0].url
                    : "https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg"
                }
                alt="album_img"
              />
            </div>
          </div>
          <div className="font-bold">{item.name}</div>
        </div>
      </td>
      <th>
        <button
          disabled={isDragging}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => {
            props.deleteArtistRating(id);
          }}
        >
          Delete
        </button>
      </th>
    </tr>
  );
}
