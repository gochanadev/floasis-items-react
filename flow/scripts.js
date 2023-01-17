import * as fcl from "@onflow/fcl";
import GET_NFT_COMPOSITES from "../scripts/FLOASISNFT/get_nft_composites.cdc";
import GET_FLOASIS_COLLECTION_DATA from "../scripts/FLOASISNFT/get_collection_data.cdc";
import { replaceCDCImports } from "../lib/helpers";

export async function getNFTCompositesData(addr, floasisNFTIdx) {
    const scriptCode = replaceCDCImports(GET_NFT_COMPOSITES);

    return await fcl.query({
        cadence: scriptCode,
        args: (arg, t) => [arg(addr, t.Address), arg(floasisNFTIdx, t.UInt64)],
    });
}

export async function getFloasisNFTData(addr) {
    const scriptCode = replaceCDCImports(GET_FLOASIS_COLLECTION_DATA);

    return await fcl.query({
        cadence: scriptCode,
        args: (arg, t) => [arg(addr, t.Address)],
    });
}
