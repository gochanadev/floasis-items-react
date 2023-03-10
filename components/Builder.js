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
    ITEMS_PROJECT_TYPE,
    EDIT_MODE_COLORS,
    EDIT_MODE_LAYERS_ORDER,
    VIEW_MODE_ONCHAIN_COMPOSITES,
    VIEW_MODE_LOCAL_COMPOSITES,
    ON_CHAIN_COMPOSITES_GROUP_NAME,
} from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { useTransaction } from "../contexts/TransactionContext";
import { getLayerName, replaceCDCImports, getItemsNFTContractIdentifier } from "../lib/helpers";
import { getNFTCompositesData, getFloasisNFTData } from "../flow/scripts";
import GET_FLOASISITEMS_COLLECTION_DATA from "../scripts/FLOASISItems/get_collection_data.cdc";
import COMPOSITE_MULTIPLE_LAYERS from "../transactions/FLOASISNFT/composite_multiple_layers.cdc";
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

    // on-chain (stored on the NFT itself) composites data that does not change
    // as the user interacts with the builder
    const [onChainComposites, setOnChainComposites] = useState({});
    // console.log("onChainComposites:", onChainComposites);

    // local (stored in the browser) composites data that changes as the user
    // interacts with the builder. The key for each local composite corresponds
    // to the index of the the FLOASIS NFT dat in floasisNFTs
    const [localComposites, setLocalComposites] = useState({});
    // console.log("localComposites:", localComposites);

    // UI toggle for either building new composites or viewing saved composites
    const [viewMode, setViewMode] = useState(VIEW_MODE_LOCAL_COMPOSITES);

    // UI toggle for either editing the order of the composites or the colors
    const [editMode, setEditMode] = useState(EDIT_MODE_COLORS);

    // index of the selected NFT from FLOASIS NFT data
    // intitialize with the 0th NFT index
    const [selectedFloasisNFTIdx, setSelectedFloasisNFTIdx] = useState(0);
    // console.log("selectedFloasisNFTIdx:", selectedFloasisNFTIdx);

    // index of the selected local composite
    const [selectedCompositeLayerIdx, setSelectedCompositeLayerIdx] = useState(null);

    // name of the selected on-chain composite
    const [selectedOnChainCompositeName, setSelectedOnChainCompositeName] = useState(null);

    // user-entered name for saving a new composite
    const [newCompositeName, setNewCompositeName] = useState("");

    // FETCH USER FLOASIS AND FLOASIS ITEMS NFT DATA ONCE USER IS LOGGED IN
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

        if (currentUser.loggedIn === true) {
            prepFloasisNFTData();
            prepFloasisItemsNFTData();
        }
    }, [currentUser]);

    // IF THE USER HAS FLOASIS NFTS, FETCH THE ON-CHAIN COMPOSITES FOR THE FIRST
    // ONE AND THEN FOR EACH OF THE OTHERS AS THE USER SELECTS A NEW FLAOSIS
    // NFT IN THE UI
    useEffect(() => {
        async function prepNFTCompositesData() {

            const nFTCompositesData = await getNFTCompositesData(currentUser.addr, floasisNFTs[selectedFloasisNFTIdx].id);

            // if there is not yet any composites data on the user NFT, we set
            // state of an empty object
            setOnChainComposites({
                [selectedFloasisNFTIdx]: nFTCompositesData[ON_CHAIN_COMPOSITES_GROUP_NAME]?.group || {},
            });
        }

        if (floasisNFTs.length > 0) {
            prepNFTCompositesData();
        }

    },[selectedFloasisNFTIdx, floasisNFTs])

    // USE THE BASE ART FROM EACH FLOASIS NFT AS THE INITIAL LAYER FOR LOCAL
    // COMPOSITING
    useEffect(() => {

        // the user has Floasis NFTs and local composite data for the selected
        // FLOASIS NFT does not exist 
        if ((floasisNFTs.length > 0) && (localComposites[selectedFloasisNFTIdx] === undefined)) {
            const floasisNFTData = floasisNFTs[selectedFloasisNFTIdx];

            /* 
            To make things easy, we clone the original base art to use as a starter 
            object for the initial composite display art. Then replace it's
            artwork layers with a shallow copy of the original base artwork 
            layers. 
            */
            const starterComposite = structuredClone(floasisNFTData.base);
            starterComposite.children = [...floasisNFTData.base.children];

            /*
            We need an initial layer to use for compositing layers in the UI, so
            we use a shallow copy of the selected floasis NFT's base artwork and
            reference data.

            If you don't know much about shallow copies, read up on shallow
            copies vs. deep copies in Javascript. In this case, we want color
            changes to the local composite artowrk to also be reflected in the
            thumbnails all thumbnails of NFTs in the UI, so we use a shallow
            copy instead of a depp copy.
            */
            const initialLayer = {
                id: `${FLOASIS_PROJECT_TYPE}:${selectedFloasisNFTIdx}`,
                type: FLOASIS_PROJECT_TYPE,
                indexInParent: selectedFloasisNFTIdx,
                gElems: [...floasisNFTData.base.children], // gElems are groups of rectangles that make up the artwork
            };

            /*
            Set the composite state, spreading out any previous composite data
            for other NFTs before adding the new data.
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
            
            // access the g element of the svg analog
            const gElem = updated[selectedFloasisNFTIdx]["layers"][selectedCompositeLayerIdx]["gElems"][gElemIdx];

            // get the original fill color of the gElem
            const originalColorValue = gElem.attributes.fill;

            /*
            If the selected gElem for the local composite doesn't have the 
            original color value designated, create it so we can the change.
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

        // get the project type for the NFTs layer for the composite
        const projectTypes = [];

        // get the IDs for the NFTs layer for the composite
        const nftIDs = [];

        // iterate over the local composites to create the ordered arrays of
        // identifiers and IDs
        localComposites[selectedFloasisNFTIdx].layers.forEach((layer) => {
            projectTypes.push(
                layer.type === FLOASIS_PROJECT_TYPE
                    ? FLOASIS_PROJECT_TYPE
                    : ITEMS_PROJECT_TYPE
            );
            nftIDs.push(
                layer.type === FLOASIS_PROJECT_TYPE
                    ? floasisNFTs[layer.indexInParent].id
                    : itemsNFTs[layer.indexInParent].id
            );
        });

        try {
            const txCode = replaceCDCImports(COMPOSITE_MULTIPLE_LAYERS)

            const transactionId = await fcl.mutate({
                cadence: txCode,
                args: (arg, t) => [
                    arg(floasisNFTID, t.UInt64),
                    arg(projectTypes, t.Array(t.String)),
                    arg(nftIDs, t.Array(t.UInt64)),
                    arg(ON_CHAIN_COMPOSITES_GROUP_NAME, t.String),
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

                    // add the successfully saved on-chain composite to the
                    // local on-chain composite state
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

    // UPDATE THE LOCAL COMPOSITE STATE EACH TIME AN ITEMS NFT IS SELECTED OR
    // DESELECTED IN THE UI
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
                    id: `${ITEMS_PROJECT_TYPE}:${selectedItemsNFTIdx}`,
                    type: ITEMS_PROJECT_TYPE,
                    indexInParent: selectedItemsNFTIdx,
                    gElems: [...itemsNFTs[selectedItemsNFTIdx].base.children],
                };

                // create an updated layers array with the previous layers first
                // and the new layer last. So when we add layers they goes onto
                // the top
                const updatedLayers = [...prev[selectedFloasisNFTIdx].layers, newLayer];

                /* to display the artwork in the UI, spread the artwork from the
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
                    [floasisNFTIdx]: nFTCompositesData[getItemsNFTContractIdentifier()]?.group || {},
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
                    arg(ON_CHAIN_COMPOSITES_GROUP_NAME, t.String),
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
                        {viewMode === VIEW_MODE_ONCHAIN_COMPOSITES && (
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
                        {viewMode === VIEW_MODE_LOCAL_COMPOSITES && (
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
                                className={`outline ${viewMode === VIEW_MODE_ONCHAIN_COMPOSITES && "active"}`}
                                onClick={(e) => handleViewModeSelection(e, VIEW_MODE_ONCHAIN_COMPOSITES)}
                            >
                                on-chain composites
                            </button>
                        </div>
                        <div className="tab">
                            <button
                                className={`outline ${viewMode === VIEW_MODE_LOCAL_COMPOSITES && "active"}`}
                                onClick={(e) => handleViewModeSelection(e, VIEW_MODE_LOCAL_COMPOSITES)}
                            >
                                build a new composite
                            </button>
                        </div>
                    </div>
                    <article>
                        <>
                            {viewMode === VIEW_MODE_ONCHAIN_COMPOSITES && (
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
                            {viewMode === VIEW_MODE_LOCAL_COMPOSITES && (
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
                                                className={`outline ${editMode === EDIT_MODE_LAYERS_ORDER && "active"}`}
                                                onClick={(e) => handleEditModeSelection(e, EDIT_MODE_LAYERS_ORDER)}
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
                                    {editMode === EDIT_MODE_LAYERS_ORDER && (
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
