import FLOASISItemsStore from "../../contracts/FLOASISItemsStore.cdc"

transaction(inventoryItemIDs: [UInt64]) {

    let storeAdminRef: &FLOASISItemsStore.StoreAdmin

    prepare(signer: AuthAccount) {
        self.storeAdminRef = signer.borrow<&FLOASISItemsStore.StoreAdmin>(from: FLOASISItemsStore.FLOASISItemsStoreAdminPath)!
    }

    execute {

        var loopIndex: UInt64 = 0

        for inventoryItemID in inventoryItemIDs {

            self.storeAdminRef.setInventoryItemActive(id: inventoryItemID)

            // increment the loop reference index
            loopIndex = loopIndex + 1

        }
    }
}
