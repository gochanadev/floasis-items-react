import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import FlowToken from "../../contracts/core/FlowToken.cdc"
import FLOASISItems from "../../contracts/FLOASISItems.cdc"
import FLOASISItemsStore from "../../contracts/FLOASISItemsStore.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"

transaction(inventoryItemIDs: [UInt64], floasisNFTID: UInt64) {

    let inventoryItemIDs: [UInt64]
    let buyerCollection: &FLOASISItems.Collection{NonFungibleToken.CollectionPublic}
    let buyerPaymentVault: &FlowToken.Vault
    let floasisNFTRef: &FLOASISNFT.NFT

    prepare(signer: AuthAccount) {

        self.inventoryItemIDs = inventoryItemIDs

        if signer.borrow<&FLOASISItems.Collection>(from: FLOASISItems.CollectionStoragePath) == nil {
            signer.save(<-FLOASISItems.createEmptyCollection(), to: FLOASISItems.CollectionStoragePath)
        }

        if signer.getLinkTarget(FLOASISItems.CollectionPublicPath) == nil {
            signer.link<&FLOASISItems.Collection{FLOASISItems.FLOASISItemsCollectionPublic, NonFungibleToken.CollectionPublic}>(FLOASISItems.CollectionPublicPath, target: FLOASISItems.CollectionStoragePath)
        }

        self.buyerCollection = signer.borrow<&FLOASISItems.Collection{NonFungibleToken.CollectionPublic}>(
            from: FLOASISItems.CollectionStoragePath
        ) ?? panic("Cannot borrow FLOASISItems collection receiver capability from signer")

        self.buyerPaymentVault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Can't borrow the Flow Token vault for the main payment from acct storage")

        let floasisCollectionRef = signer.borrow<&FLOASISNFT.Collection{FLOASISNFT.FLOASISNFTCollectionPublic, NonFungibleToken.CollectionPublic}>(
            from: FLOASISNFT.CollectionStoragePath
        ) ?? panic("Cannot borrow FLOASIS NFT collection capability from signer")

        self.floasisNFTRef = floasisCollectionRef.borrowFLOASISNFT(id: floasisNFTID)!

    }

    execute {

        var loopIndex: UInt64 = 0

        for inventoryItemID in inventoryItemIDs {

            let inventoryItem = FLOASISItemsStore.getActiveInventoryItem(inventoryItemID)!
            if (inventoryItem == nil) {
                panic("Could not find inventory item with that ID.")
            }

            let mintPrice = inventoryItem.price

            FLOASISItems.mintNFT(
                recipient: self.buyerCollection,
                inventoryItemID: inventoryItemID,
                payment: <- self.buyerPaymentVault.withdraw(amount: mintPrice),
                floasisNFTRef: self.floasisNFTRef
            )

            // increment the loop reference index
            loopIndex = loopIndex + 1

        }
    }

}