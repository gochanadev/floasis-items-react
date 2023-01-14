import FLOASISItemsStore from "../../contracts/FLOASISItemsStore.cdc"

transaction(artistName: String, seriesName: String) {

    let storeAdminRef: &FLOASISItemsStore.StoreAdmin

    prepare(signer: AuthAccount) {

        self.storeAdminRef = signer.borrow<&FLOASISItemsStore.StoreAdmin>(from: FLOASISItemsStore.FLOASISItemsStoreAdminPath)!

    }

    execute {

        self.storeAdminRef.addSeries(artistName: artistName, seriesName: seriesName)

    }
}
