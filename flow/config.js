import { config } from "@onflow/fcl";
import { send as grpcSend } from "@onflow/transport-grpc"
import { APP_DETAIL_TITLE } from "../lib/constants";

if (process.env.NEXT_PUBLIC_FLOW_ENV === "testnet") {
    console.log("App mode: Testnet");
    config({
        "flow.network": "testnet",
        "app.detail.title": APP_DETAIL_TITLE,
        "accessNode.api": "https://access-testnet.onflow.org",
        "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
        "sdk.transport": grpcSend,
        "0xNonFungibleToken": "0x631e88ae7f1d7c20",
        "0xMetadataViews": "0x631e88ae7f1d7c20",
        "0xFlowToken": "0x7e60df042a9c0868",
        "0xIaNFTAnalogs": process.env.NEXT_PUBLIC_FLOASIS_OFFICIAL_PROJECT_ADDRESS_TESTNET,
        "0xFLOASISNFT": process.env.NEXT_PUBLIC_FLOASIS_OFFICIAL_PROJECT_ADDRESS_TESTNET,
        "0xFLOASISItemsStore": process.env.NEXT_PUBLIC_FLOASIS_ITEMS_ADDRESS_TESTNET, // fcl has an error if this alias is created after '0xFLOASISItems', so keep this one first
        "0xFLOASISItems": process.env.NEXT_PUBLIC_FLOASIS_ITEMS_ADDRESS_TESTNET,
        "0xFLOASISPrimitives": process.env.NEXT_PUBLIC_FLOASIS_OFFICIAL_PROJECT_ADDRESS_TESTNET,
    });

} else {
    console.log("App mode: Mainnet");
    config({
        "flow.network": "mainnet",
        "app.detail.title": APP_DETAIL_TITLE,
        "accessNode.api": "https://access-mainnet.onflow.org",
        "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
        "sdk.transport": grpcSend,
        "0xNonFungibleToken": "0x1d7e57aa55817448",
        "0xMetadataViews": "0x1d7e57aa55817448",
        "0xFlowToken": "0x1654653399040a61",
        "0xIaNFTAnalogs": process.env.NEXT_PUBLIC_FLOASIS_NFT_DEPLOYER_ADDRESS_MAINNET,
        "0xFLOASISNFT": process.env.NEXT_PUBLIC_FLOASIS_NFT_DEPLOYER_ADDRESS_MAINNET,
        "0xFLOASISItemsStore": process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS_MAINNET, // fcl has an error if this alias is created after '0xFLOASISItems', so keep this one first
        "0xFLOASISItems": process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS_MAINNET,
        "0xFLOASISPrimitives": process.env.NEXT_PUBLIC_FLOASIS_NFT_DEPLOYER_ADDRESS_MAINNET,
    });

}
 