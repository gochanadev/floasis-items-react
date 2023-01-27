import { FLOASIS_PROJECT_TYPE, ITEMS_PROJECT_TYPE } from "../lib/constants";

export function replaceCDCImports(str) {
    const importsToAliases = {
        '"../../contracts/core/NonFungibleToken.cdc"': "0xNonFungibleToken",
        '"../../contracts/core/MetadataViews.cdc"': "0xMetadataViews",
        '"../../contracts/IaNFTAnalogs.cdc"': "0xIaNFTAnalogs",
        '"../../contracts/FLOASISNFT.cdc"': "0xFLOASISNFT",
        '"../../contracts/FLOASISItems.cdc"': "0xFLOASISItems",
        '"../../contracts/FLOASISPrimitives.cdc"': "0xFLOASISPrimitives",
        '"../../contracts/FLOASISItemsStore.cdc"': "0xFLOASISItemsStore",
        '"../../contracts/core/FlowToken.cdc"': "0xFlowToken",
    };

    Object.keys(importsToAliases).forEach((key) => {
        str = str.replaceAll(key, importsToAliases[key]);
    });

    return str;
}

export function getLayerName(layer, floasisNFTs, itemsNFTs) {
    let layerName;
    if (layer.type === FLOASIS_PROJECT_TYPE) {
        layerName = floasisNFTs[layer.indexInParent].name;
    } else if (layer.type === ITEMS_PROJECT_TYPE) {
        layerName = itemsNFTs[layer.indexInParent].name;
    }

    return layerName;
}

export function getItemsNFTContractIdentifier() {
    if (process.env.NEXT_PUBLIC_FLOW_ENV === "testnet") {
        return process.env.NEXT_PUBLIC_FLOASIS_ITEMS_IDENTIFIER_TESTNET
    } else {
        return process.env.NEXT_PUBLIC_ITEMS_NFT_CONTRACT_IDENTIFIER_MAINNET
    }
}
