/*
The Store component is used to display and interact with a set of for-sale
inventory items. The component makes use of several other React hooks and
components, and communicates with the Flow blockchain using the @onflow/fcl
library.

When the component mounts, it fetches all active inventory data from the Flow
blockchain, extracts unique FLOASIS planet names from the inventory items, and
sets these values in state. It also sets up a useEffect hook that watches the
currently selected planet, and filters the inventory data accordingly.

The component also allows users to select and try on individual inventory items,
and provides the option to purchase these items. To do this, the component
fetches and displays composite images of the selected inventory items, and
calculates the total price of the selected items. When the user confirms the
purchase, the component sends a transaction to the Flow blockchain to complete
the purchase.

Additionally, the component provides the option for users to view and interact
with their own Floasis NFT collection. It fetches this data from the Flow
blockchain and sets it in state, and allows users to select individual NFTs and
view their metadata. When trying on NFT layers, users can re-order them as they
wish to simulate the order they might create when saving a composite on-chain.

Overall, the Store component provides a user-friendly interface for browsing and
purchasing inventory items, as well as viewing and interacting with Floasis NFTs
on the Flow blockchain.
*/

import * as fcl from "@onflow/fcl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { stringify } from "svgson";
import { useAuth } from "../contexts/AuthContext";
import { useTransaction } from "../contexts/TransactionContext";
import { replaceCDCImports } from "../lib/helpers";
import GET_ALL_ACTIVE_INVENTORY_DATA from "../scripts/FLOASISItemsStore/get_all_active_inventory.cdc";
import BUY_NFTS from "../transactions/FLOASISItems/batch_buy_nfts.cdc";
import { getFloasisNFTData, getNFTCompositesData } from "../flow/scripts";
import {
    FCL_LIMIT,
    FLOASIS_PROJECT_TYPE,
    ITEMS_NFT_CONTRACT_IDENTIFIER,
    ITEMS_PROJECT_TYPE,
    ITEMS_STORE_NAME,
    ON_CHAIN_COMPOSITE_TYPE,
} from "../lib/constants";
import { SortStoreLayers } from "./SortStoreLayers";

export function Store() {
    const { currentUser } = useAuth();
    const { initTransactionState, setTxId, setTransactionStatus } = useTransaction();

    // NFTs from the FLOASIS NFT contract
    const [floasisNFTs, setFloasisNFTs] = useState([]);

    // Inventory items for sale from the FLOASISItemsStore contract
    const [inventory, setInventory] = useState({});
    console.log("inventory", inventory);

    // Planet names present in the current set of inventory
    const [planets, setPlanets] = useState([]);

    // Items categories present in the current set of inventory
    const [itemCategories, setItemCategories] = useState([]);

    // composites created by the users as they try on items NFTs
    const [tryItOnComposites, setTryItOnComposites] = useState({});
    console.log("tryItOnComposites", tryItOnComposites);

    // stores the index of the currently selected FLOASIS NFT
    const [selectedFloasisNFT, setSelectedFloasisNFT] = useState(null);

    // filtered invntory items as the user selects a planet and item category
    const [inventoryByFilters, setInventoryByFilters] = useState({});
    console.log("inventoryByFilters", inventoryByFilters);

    // user-selected planet
    const [selectedPlanet, setSelectedPlanet] = useState(null);

    // users-selected item category
    const [selectedItemCategory, setSelectedItemCategory] = useState(null);

    // composite selected by the user to use as the base for trying items on
    const [selectedComposite, setSelectedComposite] = useState(null);

    // sum of the prices of the items the user has selected to try on
    const [tryItOnPriceTotal, setCurrentTryItOnItemsPriceTotal] = useState(0);

    // FETCH AND SET FLOASIS NFTS DATA IF USER IS LOGGED IN
    useEffect(() => {
        async function prepFloasisNFTData() {
            const floasisNFTData = await getFloasisNFTData(currentUser.addr);
            setFloasisNFTs(floasisNFTData);
        }

        // If user is logged in, fetch and set Floasis NFT data for current user
        if (currentUser.loggedIn === true) {
            prepFloasisNFTData();
        }
    }, [currentUser]);

    // PREPARE FOR-SALE INVENTORY UPON COMPONENT MOUNT
    useEffect(() => {
        async function prepInventoryItemsData() {
            // Replace CDC imports in script
            const script = replaceCDCImports(GET_ALL_ACTIVE_INVENTORY_DATA);
            console.log("script:", script);

            // Get all active inventory data
            const inventoryItems = await fcl.query({
                cadence: script,
            });

            // Extract unique planet names and item categories from inventory items
            const availablePlanets = [];
            const availableItemCategories = [];
            Object.values(inventoryItems).forEach((inventoryItem) => {
                const planetName = inventoryItem.artItem.planet.name;
                const itemCategory = inventoryItem.category;
                if (!availablePlanets.includes(planetName)) {
                    availablePlanets.push(planetName);
                }
                if (!availableItemCategories.includes(itemCategory)) {
                    availableItemCategories.push(itemCategory);
                }
            });

            setPlanets(availablePlanets);
            setItemCategories(availableItemCategories);
            setInventory(inventoryItems);
        }

        prepInventoryItemsData();
    }, []);

    // WATCH THE SELECTED PLANET AND ITEM CATEGORY, THEN FILTER THE INVENTORY DATA ACCORDINGLY
    useEffect(() => {
        // Filter inventory items by selected planet
        const filteredInventory = Object.entries(inventory).reduce((acc, [key, value]) => {
            if (value.artItem.planet.name === selectedPlanet && value.category === selectedItemCategory) {
                acc[key] = value;
            }
            return acc;
        }, {});

        setInventoryByFilters(filteredInventory);
    }, [inventory, selectedPlanet, selectedItemCategory]);

    // CALCULATE THE TOTAL PRICE OF THE SELECTED INVENTORY ITEMS AS THE USER SELECTS THEM
    useEffect(() => {
        // If a Floasis NFT and composite are selected
        if (selectedFloasisNFT !== null && selectedComposite !== null) {
            // Get layers of selected composite
            const currentCompositeLayers = tryItOnComposites[selectedFloasisNFT][selectedComposite]["layers"];

            // Calculate total price of try it on layers
            const totalPrice = currentCompositeLayers.reduce((acc, layer) => {
                if (layer.type === ITEMS_PROJECT_TYPE) {
                    const layerPrice = parseInt(layer.price);
                    return acc + layerPrice;
                } else {
                    return acc;
                }
            }, 0);

            setCurrentTryItOnItemsPriceTotal(totalPrice);
        }
    }, [tryItOnComposites, selectedFloasisNFT, selectedComposite]);

    // when a user selects a Floasis NFT, we construct the tryItOnComposites
    // data and set it to state
    const handleSelectFloasisNFT = async (floasisNFTIdx) => {
        setSelectedFloasisNFT(floasisNFTIdx);

        // reset the composite asset selection each time the users selects a new Floasis NFT
        setSelectedComposite(null);

        const tryItOnCompositesExist = tryItOnComposites[floasisNFTIdx] !== undefined;

        // if the local tryItOnComposites data for the NFT doesn't exist already, we
        // created it
        if (!tryItOnCompositesExist) {
            // get all the user's on-chain composites data from the blockchain for this NFT
            const nFTCompositesData = await getNFTCompositesData(currentUser.addr, floasisNFTIdx);

            // check if the fetched data for tryItOnComposites from this
            // particular project exists. If it does we re-shape it and add it
            // to local state together with the original NFT base art as a
            // tryItOnComposite. If it doesn't we just add the orginal NFT base
            // art as the only tryItOnComposite.
            const compositesForThisProjectExist = nFTCompositesData[ITEMS_NFT_CONTRACT_IDENTIFIER] !== undefined;

            // if the user's on-chain NFT has composites for this project exist, we
            // add it and the original NFT base art to local state
            if (compositesForThisProjectExist) {
                // reshape the tryItOnComposites data to match what tryItOnComposites state expects
                const projectOnChainComposites = Object.entries(
                    nFTCompositesData[ITEMS_NFT_CONTRACT_IDENTIFIER].group
                ).reduce((acc, [key, value]) => {
                    const tryItOnBaseLayer = {
                        id: `floasis:${key}:${floasisNFTIdx}`, // create a new id using the floasis NFT index and name of the composite
                        type: ON_CHAIN_COMPOSITE_TYPE,
                        indexInParent: floasisNFTIdx,
                        gElems: [...value.children],
                    };

                    acc[key] = {
                        svgAnalog: value,
                        layers: [tryItOnBaseLayer],
                    };
                    return acc;
                }, {});

                setTryItOnComposites((prev) => {
                    // create the base initial layer for the tryItOnComposite for the Floasis NFT
                    const floasisNFTBaseLayer = {
                        id: `floasis:${floasisNFTs[floasisNFTIdx].identifier}:${floasisNFTs[floasisNFTIdx].id}`, //
                        type: FLOASIS_PROJECT_TYPE,
                        indexInParent: floasisNFTIdx,
                        gElems: [...floasisNFTs[floasisNFTIdx].base.children],
                    };

                    return {
                        ...prev,
                        [floasisNFTIdx]: {
                            ...prev[floasisNFTIdx],
                            [`FLOASIS NFT #${floasisNFTs[floasisNFTIdx].id}`]: {
                                ["svgAnalog"]: floasisNFTs[floasisNFTIdx].base,
                                ["layers"]: [floasisNFTBaseLayer],
                            },
                            ...projectOnChainComposites,
                        },
                    };
                });
            } else {
                // if there are no tryItOnComposites for this project, we create a
                // new one for the base NFT artwork
                setTryItOnComposites((_) => {
                    // create the base initial layer for the tryItOnComposite for the Floasis NFT
                    const floasisNFTBaseLayer = {
                        id: `floasis:${floasisNFTs[floasisNFTIdx].identifier}:${floasisNFTs[floasisNFTIdx].id}`, // create the id using data from the floasis NFT
                        type: FLOASIS_PROJECT_TYPE,
                        indexInParent: floasisNFTIdx,
                        gElems: [...floasisNFTs[floasisNFTIdx].base.children],
                    };

                    return {
                        [floasisNFTIdx]: {
                            [`FLOASIS NFT #${floasisNFTs[floasisNFTIdx].id}`]: {
                                ["svgAnalog"]: floasisNFTs[floasisNFTIdx].base,
                                ["layers"]: [floasisNFTBaseLayer],
                            },
                        },
                    };
                });
            }
        }
    };

    // each time the user selects an Items NFT from the store to try on, we update the tryItOnComposites state
    const handleTryItOn = (item, inventoryItemID) => {
        setTryItOnComposites((prev) => {
            // if the item being tried on doesn't already exist in the
            // tryItOnComposites state, the existing layer index will be -1.
            // Otherwise it will be the index of the layer in the given
            // tryItOnComposites composite.
            const existingLayerIdx = tryItOnComposites[selectedFloasisNFT][selectedComposite].layers?.findIndex(
                (layer) => {
                    const layerExists = layer.id === `items:${item.artName}:${item.id}`;
                    return layerExists;
                }
            );

            if (existingLayerIdx === -1) {
                const newLayer = {
                    id: `items:${item.artName}:${item.id}`,
                    type: ITEMS_PROJECT_TYPE,
                    indexInParent: parseInt(inventoryItemID),
                    gElems: [...item.artItem.base.children],
                    price: item.price,
                };

                const updatedLayers = [...prev[selectedFloasisNFT][selectedComposite].layers, newLayer];

                const updatedArtworkChildren = [
                    ...prev[selectedFloasisNFT][selectedComposite].svgAnalog.children,
                    ...item.artItem.base.children,
                ];

                return {
                    ...prev,
                    [selectedFloasisNFT]: {
                        ...prev[selectedFloasisNFT],
                        [selectedComposite]: {
                            ["layers"]: updatedLayers,
                            ["svgAnalog"]: {
                                ...prev[selectedFloasisNFT][selectedComposite]["svgAnalog"],
                                ["children"]: updatedArtworkChildren,
                            },
                        },
                    },
                };
            } else {
                const updatedLayers = [...prev[selectedFloasisNFT][selectedComposite].layers];

                updatedLayers.splice(existingLayerIdx, 1);

                const updatedArtworkChildren = updatedLayers.map((item) => item.gElems);

                return {
                    ...prev,
                    [selectedFloasisNFT]: {
                        ...prev[selectedFloasisNFT],
                        [selectedComposite]: {
                            ["layers"]: updatedLayers,
                            ["svgAnalog"]: {
                                ...prev[selectedFloasisNFT][selectedComposite]["svgAnalog"],
                                ["children"]: updatedArtworkChildren,
                            },
                        },
                    },
                };
            }
        });
    };

    // PROCESS FLOW TX TO BUY AN ACCESSORY
    const handleBuy = async () => {
        initTransactionState();

        try {
            const transactionCode = replaceCDCImports(BUY_NFTS);

            // get the NFT id by index
            const selectedFLOASISNFTID = floasisNFTs[selectedFloasisNFT].id;

            // collect all the ids from Items NFTs currently being tried on
            const getTryItOnIDs = () => {
                const ids = [];
                Object.values(tryItOnComposites[selectedFloasisNFT][selectedComposite].layers).forEach((layer) => {
                    layer.type === ITEMS_PROJECT_TYPE && ids.push(layer.indexInParent);
                });
                return ids;
            };

            const transactionId = await fcl.mutate({
                cadence: transactionCode,
                args: (arg, t) => [arg(getTryItOnIDs(), t.Array(t.UInt64)), arg(selectedFLOASISNFTID, t.UInt64)],
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
            console.log("Error when purchasing items:", e);
        }
    };

    // clear a given composite's tryItOnComposite state
    const handleClearTryItOn = () => {
        setTryItOnComposites((prev) => {
            // find the base layer
            const baseFloasisLayer = tryItOnComposites[selectedFloasisNFT][selectedComposite].layers.find(
                (layer) => layer.type === FLOASIS_PROJECT_TYPE
            );

            // replace the layers and svgAnalog for this NFT with the base floasis layer art
            return {
                ...prev,
                [selectedFloasisNFT]: {
                    ...prev[selectedFloasisNFT],
                    [selectedComposite]: {
                        ...prev[selectedFloasisNFT][selectedComposite],
                        ["layers"]: [baseFloasisLayer],
                        ["svgAnalog"]: {
                            ...prev[selectedFloasisNFT][selectedComposite]["svgAnalog"],
                            ["children"]: [...baseFloasisLayer.gElems],
                        },
                    },
                },
            };
        });
    };

    return (
        <>
            {/* TOP BANNER */}
            <div className="banner">
                <h1>{ITEMS_STORE_NAME}</h1>
                <h2>Accessories Store!</h2>
            </div>

            <div className="grid">
                {/* GRID COLUMN A: LEFT-SIDE (ON DESKTOP), BOTTOM (ON MOBILE) */}
                {/* SELECT A FLOASIS NFT, THEN SELECT A COMPOSITE TO USE FOR TRYING ON ACCESSORIES */}
                <div id="a">
                    <article>
                        <select
                            defaultValue="initial"
                            onChange={(e) => handleSelectFloasisNFT(parseInt(e.target.value))}
                        >
                            <option value="initial" disabled>
                                Select a FLOASIS NFT:
                            </option>
                            {floasisNFTs.map((nftData, nftDataIndex) => (
                                <option key={nftDataIndex} value={nftDataIndex}>
                                    {nftData.name}
                                </option>
                            ))}
                        </select>

                        <h3>Choose one of your tryItOnComposites assets:</h3>
                        <section className="cards-section">
                            {tryItOnComposites[selectedFloasisNFT] &&
                                Object.entries(tryItOnComposites[selectedFloasisNFT]).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className={`card ${key === selectedComposite && "active"}`}
                                        role="button"
                                        onClick={() => setSelectedComposite(key)}
                                    >
                                        <Image
                                            src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                                stringify(value.svgAnalog)
                                            )}`}
                                            alt={`Composite name: ${key}`}
                                            height="100%"
                                            width="100%"
                                        />
                                        <p>{key}</p>
                                    </div>
                                ))}
                        </section>
                    </article>
                </div>

                {/* GRID COLUMN B: RIGHT-SIDE (DESKTOP), TOP (MOBILE) */}
                {/* SEE COMPOSITE AS USER BUILDS, REORDER COMPOSITE AND BUY SELECTED ITEMS NFTS */}
                <div id="b">
                    <article>
                        {tryItOnComposites[selectedFloasisNFT]?.[selectedComposite] && (
                            <Image
                                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                    stringify(tryItOnComposites[selectedFloasisNFT][selectedComposite].svgAnalog)
                                )}`}
                                alt={`Artwork: ${selectedComposite}`}
                                height="350"
                                width="350"
                            />
                        )}
                        {tryItOnComposites[selectedFloasisNFT]?.[selectedComposite]?.layers.map(
                            (layer) =>
                                layer.type === ITEMS_PROJECT_TYPE && (
                                    <div key={layer.id}>
                                        <p>{inventory[layer.indexInParent]["artName"]}</p>
                                        <p>Price: {inventory[layer.indexInParent]["price"]}</p>
                                    </div>
                                )
                        )}
                        <button onClick={handleBuy}>Buy all for {tryItOnPriceTotal} FLOW</button>
                        <button className="secondary" onClick={handleClearTryItOn}>
                            clear
                        </button>

                        {selectedFloasisNFT !== null && selectedComposite !== null && (
                            <SortStoreLayers
                                composites={tryItOnComposites}
                                setComposites={setTryItOnComposites}
                                selectedFloasisNFT={selectedFloasisNFT}
                                selectedComposite={selectedComposite}
                                floasisNFTs={floasisNFTs}
                                inventory={inventory}
                            />
                        )}
                    </article>
                </div>
            </div>

            {/* ACCESSORIES STORE, SITS BELOW ALL CONTENT */}
            <article>
                {planets.length > 0 && (
                    <div>
                        {planets.map((planet) => {
                            return (
                                <a
                                    key={planet}
                                    href="#"
                                    role="button"
                                    className="contrast"
                                    onClick={() => setSelectedPlanet(planet)}
                                >
                                    {planet}
                                </a>
                            );
                        })}
                    </div>
                )}
                <select defaultValue="initial" onChange={(e) => setSelectedItemCategory(e.target.value)}>
                    <option value="initial" disabled>
                        Select an item category:
                    </option>
                    {itemCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <section className="cards-section">
                    {inventoryByFilters &&
                        Object.keys(inventoryByFilters).map((itemID) => {
                            const item = inventoryByFilters[itemID];
                            const itemLayerID = `items:${item.artName}:${item.id}`;
                            const layerInTryItOnComposites = tryItOnComposites[selectedFloasisNFT]?.[
                                selectedComposite
                            ]?.layers.find((layer) => layer.id === itemLayerID);
                            return (
                                <div
                                    key={itemID}
                                    className={`card ${layerInTryItOnComposites && "active"}`}
                                    role="button"
                                    onClick={() => handleTryItOn(item, itemID)}
                                >
                                    <Image
                                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                            stringify(item.artItem.base)
                                        )}`}
                                        alt={`Artwork: ${item.artName}`}
                                        height="350"
                                        width="350"
                                    />
                                </div>
                            );
                        })}
                </section>
            </article>
        </>
    );
}
