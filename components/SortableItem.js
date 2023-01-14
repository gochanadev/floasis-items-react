/*
The SortableItem component allows users to reorder composite layers by dragging
and dropping them vertically. The component uses the useSortable hook from the
@dnd-kit/sortable library to handle reorder interactions.
*/

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { stringify } from "svgson";

export function SortableItem({ id, artwork, layerName }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <p>{layerName}</p>
            {artwork && (
                <Image
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(stringify(artwork))}`}
                    alt={`Composite: ${artwork.name}`}
                    height="50"
                    width="50"
                />
            )}
        </div>
    );
}
