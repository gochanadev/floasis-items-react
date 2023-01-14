import FLOASISItemsStore from "../../contracts/FLOASISItemsStore.cdc"
import FLOASISPrimitives from "../../contracts/FLOASISPrimitives.cdc"

transaction(artistName: String, artistAddress: Address) {

    let artistName: String
    let artistDetails: FLOASISPrimitives.Artist
    let storeAdminRef: &FLOASISItemsStore.StoreAdmin

    prepare(signer: AuthAccount) {

        self.storeAdminRef = signer.borrow<&FLOASISItemsStore.StoreAdmin>(from: FLOASISItemsStore.FLOASISItemsStoreAdminPath)!
        self.artistName = artistName
        self.artistDetails = FLOASISPrimitives.Artist(address: artistAddress)

    }

    execute {
        self.storeAdminRef.addArtist(
            artistName: artistName, 
            artistDetails: self.artistDetails
        )
    }
}
