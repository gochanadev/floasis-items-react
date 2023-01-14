/*
The SortBuilderLayers component is a sortable list of layers in an artwork. The
component uses the @dnd-kit/core and @dnd-kit/sortable libraries to provide
drag-and-drop functionality for reordering the layers. The component accepts
composites, setComposites, selectedFloasisNFTIdx, floasisNFTs, and itemsNFTs as
props. When a layer is dragged and dropped to a new position, the setComposites
callback is invoked to update the order of layers in the artwork and re-create
the artwork using the new order of layers.
*/
import React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { getLayerName } from "../lib/helpers";
import { SortableItem } from "./SortableItem";
import { FLOASIS_PROJECT_TYPE, ITEMS_PROJECT_TYPE } from "../lib/constants";

export function SortBuilderLayers({ composites, setComposites, selectedFloasisNFTIdx, floasisNFTs, itemsNFTs }) {
    const compositeLayers = composites[selectedFloasisNFTIdx].layers;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <div className="edit-area-content">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={compositeLayers} strategy={verticalListSortingStrategy}>
                    {compositeLayers.map((layer) => {
                        // grab the artwork for the layer
                        let artwork;

                        if (layer.type === FLOASIS_PROJECT_TYPE) {
                            artwork = floasisNFTs[layer.indexInParent];
                        } else if (layer.type === ITEMS_PROJECT_TYPE) {
                            artwork = itemsNFTs[layer.indexInParent];
                        }

                        let layerName = getLayerName(layer, floasisNFTs, itemsNFTs);

                        return (
                            <SortableItem key={layer.id} id={layer.id} artwork={artwork.base} layerName={layerName} />
                        );
                    })}
                </SortableContext>
            </DndContext>
        </div>
    );

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            setComposites((prev) => {
                // find the old index of the layer that was just dragged
                const oldIndex = prev[selectedFloasisNFTIdx].layers.findIndex((layer) => {
                    return layer.id == active.id;
                });

                // find the new index of the layer where it sits in its new position
                const newIndex = prev[selectedFloasisNFTIdx].layers.findIndex((layer) => {
                    return layer.id == over.id;
                });

                // create the new layers order
                const newLayersOrder = arrayMove(prev[selectedFloasisNFTIdx].layers, oldIndex, newIndex);

                // re-create the artwork
                const reCreatedArtwork = newLayersOrder.map((item) => item.gElems);

                return {
                    ...prev,
                    [selectedFloasisNFTIdx]: {
                        ...prev[selectedFloasisNFTIdx],
                        ["layers"]: newLayersOrder,
                        ["svgAnalog"]: {
                            ...prev[selectedFloasisNFTIdx]["svgAnalog"],
                            ["children"]: reCreatedArtwork,
                        },
                    },
                };
            });
        }
    }
}
