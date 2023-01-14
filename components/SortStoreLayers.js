/*
The SortStoreLayers component is a sortable list of layers in an artwork. The
component uses the @dnd-kit/core and @dnd-kit/sortable libraries to provide
drag-and-drop functionality for reordering the layers. The component accepts
composites, setComposites, selectedFloasisNFT, selectedComposite, floasisNFTs,
and inventory as props. When a layer is dragged and dropped to a new position,
the setComposites callback is invoked to update the order of layers in the
artwork and re-create the artwork using the new order of layers.
*/
import React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { FLOASIS_PROJECT_TYPE, ITEMS_PROJECT_TYPE, ON_CHAIN_COMPOSITE_TYPE } from "../lib/constants";

export function SortStoreLayers({
    composites,
    setComposites,
    selectedFloasisNFT,
    selectedComposite,
    floasisNFTs,
    inventory,
}) {
    const compositeLayers = composites[selectedFloasisNFT][selectedComposite].layers;

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
                            artwork = floasisNFTs[layer.indexInParent].base;
                        } else if (layer.type === ITEMS_PROJECT_TYPE) {
                            artwork = inventory[layer.indexInParent].artItem.base;
                        } else if (layer.type === ON_CHAIN_COMPOSITE_TYPE) {
                            artwork = composites[selectedFloasisNFT][selectedComposite].svgAnalog;
                        }

                        return <SortableItem key={layer.id} id={layer.id} artwork={artwork} />;
                    })}
                </SortableContext>
            </DndContext>
        </div>
    );

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            setComposites((prevComposites) => {
                const oldIndex = prevComposites[selectedFloasisNFT][selectedComposite].layers.findIndex((layer) => {
                    return layer.id == active.id;
                });

                const newIndex = prevComposites[selectedFloasisNFT][selectedComposite].layers.findIndex((layer) => {
                    return layer.id == over.id;
                });

                const newLayersOrder = arrayMove(
                    prevComposites[selectedFloasisNFT][selectedComposite].layers,
                    oldIndex,
                    newIndex
                );

                // re-create the artwork
                const reCreatedArtwork = newLayersOrder.map((item) => item.gElems);

                return {
                    ...prevComposites,
                    [selectedFloasisNFT]: {
                        ...prevComposites[selectedFloasisNFT],
                        [selectedComposite]: {
                            ["layers"]: newLayersOrder,
                            ["svgAnalog"]: {
                                ...prevComposites[selectedFloasisNFT][selectedComposite]["svgAnalog"],
                                ["children"]: reCreatedArtwork,
                            },
                        },
                    },
                };
            });
        }
    }
}
