import FLOASISItemsStore from "../../contracts/FLOASISItemsStore.cdc"

transaction(
    itemNames: [String], 
    itemDescriptions: [String],
    itemCategories: [String],
    itemThumbnails: [String],
    itemThumbnailPaths: [String],
    itemQuantities: [UInt64],
    itemPrices: [UFix64],
    itemArtistNames: [String],
    itemSeriesNames: [String],
    itemArtNames: [String],
    allPaymentsRecipient: Address,
    allRoyaltiesRecipient: Address
    ) {

    let storeAdminRef: &FLOASISItemsStore.StoreAdmin

    prepare(signer: AuthAccount) {
        self.storeAdminRef = signer.borrow<&FLOASISItemsStore.StoreAdmin>(from: FLOASISItemsStore.FLOASISItemsStoreAdminPath)!
    }

    execute {

        var loopIndex: UInt64 = 0

        for itemName in itemNames {

            // add inventory 
            self.storeAdminRef.addInventoryItem(
                name: itemName,
                description: itemDescriptions[loopIndex],
                category: itemCategories[loopIndex],
                thumbnail: itemThumbnails[loopIndex],
                thumbnailPath: itemThumbnailPaths[loopIndex],
                quantity: itemQuantities[loopIndex],
                price: itemPrices[loopIndex],
                artistName: itemArtistNames[loopIndex],
                seriesName: itemSeriesNames[loopIndex],
                artName: itemArtNames[loopIndex],
                paymentRecipient: allPaymentsRecipient,
                royaltiesRecipient: allRoyaltiesRecipient
            )

            // increment the loop reference index
            loopIndex = loopIndex + 1

        }
    }
}
