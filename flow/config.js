import { config } from "@onflow/fcl";

config({
    "app.detail.title": "FLOASIS Accessories!!!",
    "accessNode.api": process.env.NEXT_PUBLIC_ACCESS_NODE_API,
    "discovery.wallet": process.env.NEXT_PUBLIC_DISCOVERY_WALLET,
    "0xProfile": process.env.NEXT_PUBLIC_CONTRACT_PROFILE, // The account address where the smart contract lives
    "0xNonFungibleToken": process.env.NEXT_PUBLIC_CONTRACT_PROFILE,
    "0xIaNFTAnalogs": process.env.NEXT_PUBLIC_CONTRACT_PROFILE,
    "0xFLOASISNFT": process.env.NEXT_PUBLIC_CONTRACT_PROFILE,
    "0xFLOASISItemsStore": process.env.NEXT_PUBLIC_CONTRACT_PROFILE, // fcl has an error if this alias is created after '0xFLOASISItems', so keep this one first
    "0xFLOASISItems": process.env.NEXT_PUBLIC_CONTRACT_PROFILE,
    "0xFLOASISPrimitives": process.env.NEXT_PUBLIC_CONTRACT_PROFILE,
    "0xFlowToken": process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS_EMULATOR,
});
