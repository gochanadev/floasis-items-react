/*
The Builder component allows users to create and save custom "composite" images
directly to the flow blockchain. The component uses the useAuth hook to handle
authentication, and the useTransaction hooks to handle transaction progress.

When the component first renders, it fetches user data and sets the initial
state of the app.

The component has several state variables that are used to manage the UI,
including floasisNFTs, itemsNFTs, onChainComposites, and localComposites, which
store information about the user's collections of NFTs and composites. The
component also has state variables that track the current viewMode (for viewing
either a saved composite or the builder) and editMode (for either changing
colors on a layer or re-arranging layers). It also has state for the currently
selected NFT (selectedFloasisNFTIdx), composites (selectedCompositeLayerIdx and
selectedOnChainCompositeName), and user-entered composite name
(newCompositeName).

Builder provides several methods for handling user interactions, including
methods for saving new composites, changing the order of composites, and
changing the colors of composites. These methods use the fcl library to interact
with the Flow blockchain.
*/

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";
import Image from "next/image";
import { stringify } from "svgson";
import { SortBuilderLayers } from "./SortBuilderLayers";
import {
    ITEMS_STORE_NAME,
    FCL_LIMIT,
    FLOASIS_PROJECT_TYPE,
    ITEMS_NFT_CONTRACT_IDENTIFIER,
    ITEMS_PROJECT_TYPE,
    EDIT_MODE_COLORS,
    EDIT_MODE_ORDER,
    VIEW_MODE_SAVED,
    VIEW_MODE_BUILD,
} from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { useTransaction } from "../contexts/TransactionContext";
import { getLayerName, replaceCDCImports } from "../lib/helpers";
import { getNFTCompositesData, getFloasisNFTData } from "../flow/scripts";
import GET_FLOASISITEMS_COLLECTION_DATA from "../scripts/FLOASISItems/get_collection_data.cdc";
import COMPOSITE_MULTIPLE_LAYERS from "../transactions/FLOASISNFT/composite_multiple_layers.cdc";
import COMPOSITE_MULTIPLE_LAYERS_TESTNET from "../transactions/FLOASISNFT/composite_multiple_layers_testnet.cdc";
import COMPOSITE_MULTIPLE_LAYERS_MAINNET from "../transactions/FLOASISNFT/composite_multiple_layers_mainnet.cdc";
import CHANGE_SELECT_FLOAIS_NFT_COLORS from "../transactions/FLOASISNFT/change_select_floasis_nft_colors.cdc";
import CHANGE_SELECT_FLOASIS_ITEMS_NFT_COLORS from "../transactions/FLOASISItems/change_select_floasis_items_nft_colors.cdc";
import REMOVE_COMPOSITE from "../transactions/FLOASISNFT/remove_composite.cdc";

export function Builder() {
    const { currentUser } = useAuth();

    // hooks for handling the transaction progress bar in the UI
    const { initTransactionState, setTxId, setTransactionStatus } = useTransaction();

    // NFTs from the FLOASIS NFT contract
    const [floasisNFTs, setFloasisNFTs] = useState([]);
    // console.log("floasisNFTs:", floasisNFTs);

    // NFTs from the FLOASIS Items NFT contract
    const [itemsNFTs, setItemsNFTs] = useState([]);

    // on-chain (stored on the NFT itself) composites
    const [onChainComposites, setOnChainComposites] = useState({});
    // console.log("onChainComposites:", onChainComposites);

    // local composites (stored in the browser)
    const [localComposites, setLocalComposites] = useState({});

    // UI toggle for either building or viewing saved composites
    const [viewMode, setViewMode] = useState(VIEW_MODE_BUILD);

    // UI toggle for either editing the order of the composites or the colors
    const [editMode, setEditMode] = useState(EDIT_MODE_COLORS);

    // stores the index of the selected NFT from the FLOASIS NFT data
    const [selectedFloasisNFTIdx, setSelectedFloasisNFTIdx] = useState(0);

    // stores the index of the currently selected local composite
    const [selectedCompositeLayerIdx, setSelectedCompositeLayerIdx] = useState(null);

    // stores the name of the currently selected on-chain composite
    const [selectedOnChainCompositeName, setSelectedOnChainCompositeName] = useState(null);

    // user-entered name for saving a new composite
    const [newCompositeName, setNewCompositeName] = useState("");

    // FETCH USER DATA AND SET INITIAL APP STATE IF USER IS LOGGED IN
    useEffect(() => {
        async function prepFloasisNFTData() {
            const floasisNFTData = await getFloasisNFTData(currentUser.addr);
            setFloasisNFTs(floasisNFTData);
        }

        async function prepFloasisItemsNFTData() {
            const scriptCode = replaceCDCImports(GET_FLOASISITEMS_COLLECTION_DATA);

            const floasisItemsNFTData = await fcl.query({
                cadence: scriptCode,
                args: (arg, t) => [arg(currentUser.addr, t.Address)],
            });

            setItemsNFTs(floasisItemsNFTData);
        }

        async function prepNFTCompositesData() {
            const nFTCompositesData = await getNFTCompositesData(currentUser.addr, selectedFloasisNFTIdx.toString());

            // since this is the initial load, we can set the local composites with retrieved data or an empty object
            setOnChainComposites({
                [selectedFloasisNFTIdx]: nFTCompositesData[ITEMS_NFT_CONTRACT_IDENTIFIER]?.group || {},
            });
        }

        if (currentUser.loggedIn === true) {
            prepFloasisNFTData();
            prepFloasisItemsNFTData();
            prepNFTCompositesData();
        }
    }, [currentUser]);

    // WATCH FOR SELECTION OF FLOASIS NFT AND PREPARE INITIAL COMPOSITE STATE ACCORDINGLY
    useEffect(() => {
        // selected Floasis NFT data exists and local composite data does not
        if (floasisNFTs[selectedFloasisNFTIdx] !== undefined && localComposites[selectedFloasisNFTIdx] === undefined) {
            const selectedFloasisNFTData = floasisNFTs[selectedFloasisNFTIdx];

            /*
            We need an initial layer to use for compositing in the UI, so we use
            references to the selected NFT and a shallow copy of the selected
            floasis NFT's base artwork.

            If you don't know much about shallow copies, read up on shallow
            copies vs. deep copies in Javascript because they can be tricky. In
            this case, we want color changes to the on-chain artowrk to also be
            reflected in the local composite, so we use a shallow copy of this
            data instead of a depp copy.
            */
            const initialLayer = {
                id: `floasis:${selectedFloasisNFTIdx}`,
                type: FLOASIS_PROJECT_TYPE,
                indexInParent: selectedFloasisNFTIdx,
                gElems: [...selectedFloasisNFTData.base.children], // gElems are groups of rectangles that make up the artwork
            };

            /* 
            To make things easy, we clone the original base art to use as a starter 
            object for the initial composite display art. Then replace it's
            artwork layers with a shallow copy of the original base artwork 
            layers. 
            */
            const starterComposite = structuredClone(selectedFloasisNFTData.base);
            starterComposite.children = [...selectedFloasisNFTData.base.children];

            /*
            Set the composite state, spreading out any previous composite data
            before adding new data.
            */
            setLocalComposites((prev) => {
                return {
                    ...prev,
                    [selectedFloasisNFTIdx]: {
                        svgAnalog: starterComposite,
                        layers: [initialLayer], // we start off with only the layers from the FLOASIS NFT's art
                    },
                };
            });
        }
    }, [floasisNFTs, selectedFloasisNFTIdx]);

    // EACH TIME A COLOR THE COLOR WHEEL IS CHANGED, WE UPDATE THE LOCAL COMPOSITE STATE
    const handleColorSelection = (e, gElemIdx) => {
        const newColorValue = e.target.value;

        setLocalComposites((prev) => {
            const updated = { ...prev };
            const gElem = updated[selectedFloasisNFTIdx]["layers"][selectedCompositeLayerIdx]["gElems"][gElemIdx];

            // get the original fill color of the gElem
            const originalColorValue = gElem.attributes.fill;

            /*
            If the selected gElem for the local composite doesn't have the 
            original color value designated, create it.
            */
            if (gElem.attributes.original === undefined) {
                gElem.attributes.original = originalColorValue;
            }

            // set the new color value
            gElem.attributes.fill = newColorValue;

            // set state with the modified shallow copy with new color value
            return updated;
        });
    };

    // HANDLE FLOW TX TO CHANGE THE COLORS OF AN SVG ANALOG ON-CHAIN
    const handleChangeSelectColors = async () => {
        initTransactionState();

        const compositeLayer = localComposites[selectedFloasisNFTIdx].layers[selectedCompositeLayerIdx];

        // get the indices of the gElems that have been changed for the Flow transaction
        const gElemIndices = []
        compositeLayer.gElems.forEach((gElem, gElemIdx) => {
            gElem.attributes.original && gElemIndices.push(gElemIdx)
        })

        // get the new colors for the gElems that have been changed for the Flow transaction
        const gElemColors = compositeLayer.gElems
            .filter((gElem) => gElem.attributes.original)
            .map((gElem) => gElem.attributes.fill);

        try {
            let txCode;
            let nftID;

            if (compositeLayer.type === ITEMS_PROJECT_TYPE) {
                txCode = replaceCDCImports(CHANGE_SELECT_FLOASIS_ITEMS_NFT_COLORS);
                nftID = itemsNFTs[compositeLayer.indexInParent].id;
            } else if (compositeLayer.type === FLOASIS_PROJECT_TYPE) {
                txCode = replaceCDCImports(CHANGE_SELECT_FLOAIS_NFT_COLORS);
                nftID = floasisNFTs[compositeLayer.indexInParent].id;
            }

            const transactionId = await fcl.mutate({
                cadence: txCode,
                args: (arg, t) => [
                    arg(nftID, t.UInt64),
                    arg(gElemIndices, t.Array(t.UInt64)),
                    arg(gElemColors, t.Array(t.String)),
                ],
                payer: fcl.authz,
                proposer: fcl.authz,
                authorizations: [fcl.authz],
                limit: FCL_LIMIT,
            });
            setTxId(transactionId);
            fcl.tx(transactionId).subscribe((res) => {
                console.log("res:", res);
                setTransactionStatus(res.status);
            });
        } catch (e) {
            console.log("Error when changing NFT colors:", e);
        }
    };

    // HANDLE FLOW TX TO ADD A COMPOSITE THE THE NFTS LIBRARY OF ON-CHAIN COMPOSITES
    const handleSaveOnChainComposite = async (e) => {
        e.preventDefault();

        initTransactionState();

        const floasisNFTID = floasisNFTs[selectedFloasisNFTIdx].id;

        // get the string identifiers for the NFTs that make up the composite
        const nftIdentifiers = [];

        // get the IDs for the NFTs that make up the composite
        const nftIDs = [];

        // iterate over the local composites to create the ordered arrays of
        // identifiers and IDs
        localComposites[floasisNFTID].layers.forEach((layer) => {
            nftIdentifiers.push(
                layer.type === FLOASIS_PROJECT_TYPE
                    ? floasisNFTs[layer.indexInParent].identifier
                    : itemsNFTs[layer.indexInParent].identifier
            );
            nftIDs.push(
                layer.type === FLOASIS_PROJECT_TYPE
                    ? floasisNFTs[layer.indexInParent].id
                    : itemsNFTs[layer.indexInParent].id
            );
        });

        try {

            let txCode;
            if (process.env.NEXT_PUBLIC_FLOW_ENV === "emulator") {
                txCode = replaceCDCImports(COMPOSITE_MULTIPLE_LAYERS);
            } else if (process.env.NEXT_PUBLIC_FLOW_ENV === "testnet") {
                txCode = replaceCDCImports(COMPOSITE_MULTIPLE_LAYERS_TESTNET);
            } else {
                txCode = replaceCDCImports(COMPOSITE_MULTIPLE_LAYERS_MAINNET);
            }

            const transactionId = await fcl.mutate({
                cadence: txCode,
                args: (arg, t) => [
                    arg(floasisNFTID, t.UInt64),
                    arg(nftIdentifiers, t.Array(t.String)),
                    arg(nftIDs, t.Array(t.UInt64)),
                    arg(ITEMS_NFT_CONTRACT_IDENTIFIER, t.String),
                    arg(newCompositeName, t.String),
                ],
                payer: fcl.authz,
                proposer: fcl.authz,
                authorizations: [fcl.authz],
                limit: FCL_LIMIT,
            });
            setTxId(transactionId);
            fcl.tx(transactionId).subscribe((res) => {
                console.log("Save on-chain composite response:", res);
                setTransactionStatus(res.status);

                /*
                For the response object returned from fcl's 'subscribe' funciton,
                a 'status' of 4 means the transaction is sealed, and statusCode 
                of 0 means there are no errors.
                */
                if (res.status === 4 && res.statusCode === 0) {
                    const namedOnChainCompositeExists =
                        onChainComposites[selectedFloasisNFTIdx]?.[newCompositeName] !== undefined;

                    !namedOnChainCompositeExists &&
                        setOnChainComposites((prev) => {
                            return {
                                ...prev,
                                [selectedFloasisNFTIdx]: {
                                    ...prev[selectedFloasisNFTIdx],
                                    [newCompositeName]: localComposites[selectedFloasisNFTIdx].svgAnalog,
                                },
                            };
                        });
                }
            });
        } catch (e) {
            console.log("Error when saving on-chain composite:", e);
        }
    };

    // UPDATE THE COMPOSITE STATE EACH TIME AN ITEMS NFT IS SELECTED IN THE UI
    const handleSelectItemsNFT = (selectedItemsNFTIdx) => {
        /*
        When an items NFT is initially selected, we add it to the composite
        data. If it already exists, we remove it from composite data. This
        allows the items NFT thumbnails in the UI to function as toggles, adding 
        and removing layers from the composite.
        */
        setLocalComposites((prev) => {
            /* 
            Find the index of the existing layer. If it does not exist it will 
            be -1.
            */
            const existingLayerIdx = prev[selectedFloasisNFTIdx].layers.findIndex(
                (layer) => layer.indexInParent === selectedItemsNFTIdx && layer.type === ITEMS_PROJECT_TYPE
            );

            /*
            Create and add a new layer to the composite if it doesn't exist. 
            If it already exists, remove it from the composite.
            */
            if (existingLayerIdx === -1) {
                // create a new layer with a shallow copy of the gElems from selected items NFT
                const newLayer = {
                    id: `items:${selectedItemsNFTIdx}`,
                    type: ITEMS_PROJECT_TYPE,
                    indexInParent: selectedItemsNFTIdx,
                    gElems: [...itemsNFTs[selectedItemsNFTIdx].base.children],
                };

                // create an updated layers array with the previous layers first
                // and the new layer last
                const updatedLayers = [...prev[selectedFloasisNFTIdx].layers, newLayer];

                /* to display the artwork inteh UI, spread the artwork from the
                selected items NFT into the existing artwork for this composite.
                */
                const updatedArtworkChildren = [
                    ...prev[selectedFloasisNFTIdx].svgAnalog.children,
                    ...itemsNFTs[selectedItemsNFTIdx].base.children,
                ];

                return {
                    ...prev,
                    [selectedFloasisNFTIdx]: {
                        ...prev[selectedFloasisNFTIdx],
                        ["layers"]: updatedLayers,
                        ["svgAnalog"]: {
                            ...prev[selectedFloasisNFTIdx]["svgAnalog"],
                            ["children"]: updatedArtworkChildren,
                        },
                    },
                };
            } else {
                // shallow copy the previous layers
                const updatedLayers = [...prev[selectedFloasisNFTIdx].layers];

                // remove the layer at the existing layer index
                updatedLayers.splice(existingLayerIdx, 1);

                // create an array of gElems using the updated layers data
                const updatedArtworkChildren = updatedLayers.map((item) => item.gElems);

                return {
                    ...prev,
                    [selectedFloasisNFTIdx]: {
                        ...prev[selectedFloasisNFTIdx],
                        ["layers"]: updatedLayers,
                        ["svgAnalog"]: {
                            ...prev[selectedFloasisNFTIdx]["svgAnalog"],
                            ["children"]: updatedArtworkChildren,
                        },
                    },
                };
            }
        });
    };

    // UPDATE THE ON-CHAIN COMPOSITES STATE EACH TIME A FLOASIS NFT IS SELECTED
    const handleFloasisNFTSelection = async (floasisNFTIdx) => {
        console.log("Floasis NFT selected:", floasisNFTIdx);
        setSelectedFloasisNFTIdx(floasisNFTIdx);

        /*
        If the on-chain composite for this newly-selected Floasis NFT doesn't
        exist yet, fetch the composite data from on-chain and add to local state.
        */
        if (onChainComposites[floasisNFTIdx] === undefined) {
            // const nFTCompositesData = await getNFTCompositesData(currentUser.addr, floasisNFTs[floasisNFTIdx.toString()]);
            const nFTCompositesData = await getNFTCompositesData(currentUser.addr, floasisNFTs[floasisNFTIdx].id);

            setOnChainComposites((prev) => {
                return {
                    ...prev,
                    [floasisNFTIdx]: nFTCompositesData[ITEMS_NFT_CONTRACT_IDENTIFIER]?.group || {},
                };
            });
        }
    };

    const handleEditModeSelection = (e, mode) => {
        e.preventDefault();
        setEditMode(mode);
    };

    const handleViewModeSelection = (e, mode) => {
        e.preventDefault();
        setViewMode(mode);
    };

    // determines if the selected items NFT is active/present in the composite or not
    const itemsLayerIsActive = (itemsNFTIdx) => {
        const selectedLayerIdx = localComposites[selectedFloasisNFTIdx]?.layers.findIndex(
            (compositeLayer) =>
                compositeLayer.type === ITEMS_PROJECT_TYPE && compositeLayer.indexInParent === itemsNFTIdx
        );

        if (selectedLayerIdx !== undefined && selectedLayerIdx !== -1) {
            return true;
        }

        return false;
    };

    // DELETES THE COMPOSITE FROM ON-CHAIN AND UPDATES LOCAL STATE
    const handleDeleteOnChainComposite = async (e, compositeName) => {
        e.preventDefault();

        initTransactionState();

        const floasisNFTID = floasisNFTs[selectedFloasisNFTIdx].id;

        try {
            const txCode = replaceCDCImports(REMOVE_COMPOSITE);

            const transactionId = await fcl.mutate({
                cadence: txCode,
                args: (arg, t) => [
                    arg(floasisNFTID, t.UInt64),
                    arg(ITEMS_NFT_CONTRACT_IDENTIFIER, t.String),
                    arg(compositeName, t.String),
                ],
                payer: fcl.authz,
                proposer: fcl.authz,
                authorizations: [fcl.authz],
                limit: FCL_LIMIT,
            });

            setTxId(transactionId);
            fcl.tx(transactionId).subscribe((res) => {
                console.log("Delete on-chain composite transaction response:", res);
                setTransactionStatus(res.status);

                /* if the tx was sealed with no errors, remove the composite 
                from local state.
                */
                if (res.status === 4 && res.statusCode === 0) {
                    onChainComposites[selectedFloasisNFTIdx][compositeName] !== undefined &&
                        setOnChainComposites((prev) => {
                            const updated = { ...prev };
                            delete updated[selectedFloasisNFTIdx][compositeName];
                            return updated;
                        });
                }
            });
        } catch (e) {
            console.log("Error when deleting composite:", e);
        }
    };

    return (
        <>
            {/* TOP BANNER */}
            <div className="banner">
                <h1>{ITEMS_STORE_NAME}</h1>
                <h2>Builder!</h2>
            </div>

            <div className="grid">
                {/* GRID COLUMN B: LEFT-SIDE (ON DESKTOP), BOTTOM (ON MOBILE) */}
                {/* UI SELECTION OF NFTS AND ON-CHAIN COMPOSITES */}
                <div id="a">
                    <article>
                        {viewMode === VIEW_MODE_SAVED && (
                            <>
                                <h4>Your localComposites:</h4>
                                <section className="cards-section">
                                    {onChainComposites[selectedFloasisNFTIdx] && Object.entries(onChainComposites[selectedFloasisNFTIdx])?.map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="card"
                                            role="button"
                                            onClick={() => setSelectedOnChainCompositeName(key)}
                                        >
                                            <Image
                                                src={`data:image/svg+xml;utf8,${encodeURIComponent(stringify(value))}`}
                                                alt={`Composite: ${key}`}
                                                height="100%"
                                                width="100%"
                                            />
                                            <p>{key}</p>
                                        </div>
                                    ))}
                                </section>
                            </>
                        )}
                        {viewMode === VIEW_MODE_BUILD && (
                            <>
                                <h3>Choose one FLOASIS NFT:</h3>
                                <section className="cards-section">
                                    {floasisNFTs.map((nft, idx) => (
                                        <div
                                            key={nft.id}
                                            className={`card ${idx === selectedFloasisNFTIdx && "active"}`}
                                            role="button"
                                            onClick={() => handleFloasisNFTSelection(idx)}
                                        >
                                            <Image
                                                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                                    stringify(nft.base)
                                                )}`}
                                                alt={`Artwork: ${nft.name}`}
                                                height="100%"
                                                width="100%"
                                            />
                                            <p>Name: {nft.name}</p>
                                            <p>Planet: {nft.planet}</p>
                                        </div>
                                    ))}
                                </section>
                                <h3>Select multiple {ITEMS_STORE_NAME} NFTs:</h3>
                                <section className="cards-section">
                                    {itemsNFTs.map((nft, idx) => {
                                        return (
                                            <div
                                                key={nft.id}
                                                className={`card ${itemsLayerIsActive(idx) && "active"}`}
                                                role="button"
                                                onClick={() => handleSelectItemsNFT(idx)}
                                            >
                                                <Image
                                                    src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                                        stringify(nft.base)
                                                    )}`}
                                                    alt={`Artwork: ${nft.name}`}
                                                    height="100%"
                                                    width="100%"
                                                />
                                                <p>Name: {nft.name}</p>
                                                <p>Planet: {nft.planet}</p>
                                            </div>
                                        );
                                    })}
                                </section>
                            </>
                        )}
                    </article>
                </div>

                {/* GRID COLUMN A: RIGHT-SIDE (DESKTOP), TOP (MOBILE) */}
                {/* SEE ALL COMPOSITES AND MODIFY THEM */}
                <div id="b">
                    <div className="tabs">
                        <div className="tab">
                            <button
                                className={`outline ${viewMode === VIEW_MODE_SAVED && "active"}`}
                                onClick={(e) => handleViewModeSelection(e, VIEW_MODE_SAVED)}
                            >
                                on-chain composites
                            </button>
                        </div>
                        <div className="tab">
                            <button
                                className={`outline ${viewMode === VIEW_MODE_BUILD && "active"}`}
                                onClick={(e) => handleViewModeSelection(e, VIEW_MODE_BUILD)}
                            >
                                build a new composite
                            </button>
                        </div>
                    </div>
                    <article>
                        <>
                            {viewMode === VIEW_MODE_SAVED && (
                                <>
                                    <h4>Your Composite:</h4>
                                    {onChainComposites[selectedFloasisNFTIdx] && onChainComposites[selectedFloasisNFTIdx][selectedOnChainCompositeName] !==
                                        undefined && (
                                        <>
                                            <Image
                                                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                                    stringify(
                                                        onChainComposites[selectedFloasisNFTIdx][
                                                            selectedOnChainCompositeName
                                                        ]
                                                    )
                                                )}`}
                                                alt={`Composite: ${onChainComposites[selectedFloasisNFTIdx][selectedOnChainCompositeName]}`}
                                                height="100%"
                                                width="100%"
                                            />
                                            <button
                                                onClick={(e) =>
                                                    handleDeleteOnChainComposite(e, selectedOnChainCompositeName)
                                                }
                                            >
                                                Delete on-chain composite
                                            </button>
                                        </>
                                    )}
                                    {onChainComposites[selectedFloasisNFTIdx] && onChainComposites[selectedFloasisNFTIdx][selectedOnChainCompositeName] ===
                                        undefined && <p>choose one of your composites to view and download as PNG.</p>}
                                </>
                            )}
                            {viewMode === VIEW_MODE_BUILD && (
                                <>
                                    {localComposites[selectedFloasisNFTIdx]?.layers.length > 0 && (
                                        <>
                                            <form onSubmit={(e) => handleSaveOnChainComposite(e)}>
                                                <input
                                                    type="text"
                                                    value={newCompositeName}
                                                    onChange={(e) => setNewCompositeName(e.target.value)}
                                                    placeholder="Name your composite"
                                                    required
                                                />
                                                <button type="submit">Save composite on-chain</button>
                                            </form>
                                            <Image
                                                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                                    stringify(localComposites[selectedFloasisNFTIdx].svgAnalog)
                                                )}`}
                                                alt={`Artwork: ${floasisNFTs[selectedFloasisNFTIdx].name}`}
                                                height="350px"
                                                width="350px"
                                            />
                                        </>
                                    )}
                                    <div className="tabs">
                                        <div className="tab">
                                            <button
                                                className={`outline ${editMode === EDIT_MODE_COLORS && "active"}`}
                                                onClick={(e) => handleEditModeSelection(e, EDIT_MODE_COLORS)}
                                            >
                                                change colors
                                            </button>
                                        </div>
                                        <div className="tab">
                                            <button
                                                className={`outline ${editMode === EDIT_MODE_ORDER && "active"}`}
                                                onClick={(e) => handleEditModeSelection(e, EDIT_MODE_ORDER)}
                                            >
                                                change order
                                            </button>
                                        </div>
                                    </div>
                                    {editMode === EDIT_MODE_COLORS && (
                                        <>
                                            <fieldset>
                                                <legend>
                                                    <strong>Select Layer:</strong>
                                                </legend>
                                                <div className="edit-area-content">
                                                    {localComposites[selectedFloasisNFTIdx]?.layers.map(
                                                        (layer, layerIdx) => {
                                                            let layerName = getLayerName(layer, floasisNFTs, itemsNFTs);

                                                            return (
                                                                <label key={layerIdx} htmlFor={layerIdx}>
                                                                    <input
                                                                        type="radio"
                                                                        id={layerIdx}
                                                                        name="selected-layers"
                                                                        value={layerIdx}
                                                                        onChange={(e) =>
                                                                            setSelectedCompositeLayerIdx(
                                                                                parseInt(e.target.value)
                                                                            )
                                                                        }
                                                                    />
                                                                    {layerName}
                                                                </label>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </fieldset>
                                            <section className="color-pickers-section">
                                                {/* if the layer is selected, render color pickers for each gElem*/}
                                                {localComposites[selectedFloasisNFTIdx]?.layers[
                                                    selectedCompositeLayerIdx
                                                ]?.gElems.map((gElem, gElemIdx) => {
                                                    return (
                                                        <div key={gElemIdx} className="color-picker">
                                                            <input
                                                                type="color"
                                                                value={gElem.attributes.fill}
                                                                onInput={(e) => handleColorSelection(e, gElemIdx)}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </section>
                                            {selectedCompositeLayerIdx !== null && editMode === EDIT_MODE_COLORS && (
                                                <button onClick={handleChangeSelectColors}>
                                                    change selected layer color
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {editMode === EDIT_MODE_ORDER && (
                                        <>
                                            <SortBuilderLayers
                                                composites={localComposites}
                                                setComposites={setLocalComposites}
                                                selectedFloasisNFTIdx={selectedFloasisNFTIdx}
                                                floasisNFTs={floasisNFTs}
                                                itemsNFTs={itemsNFTs}
                                            />
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    </article>
                </div>
            </div>
        </>
    );
}
