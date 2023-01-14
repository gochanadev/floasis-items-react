import FLOASISItemsStore from "../../contracts/FLOASISItemsStore.cdc"
import IaNFTAnalogs from "../../contracts/IaNFTAnalogs.cdc"

transaction(
    artistName: String, 
    seriesName: String, 
    artNames: [String], 
    planetNames: [String], 
    baseArtwork: [IaNFTAnalogs.Svg], 
    cardArtwork: [IaNFTAnalogs.Svg], 
    artDescriptions: [String], 
    artThumbnails: [String]
    ) {

    let storeAdminRef: &FLOASISItemsStore.StoreAdmin

    prepare(signer: AuthAccount) {
        self.storeAdminRef = signer.borrow<&FLOASISItemsStore.StoreAdmin>(from: FLOASISItemsStore.FLOASISItemsStoreAdminPath)!
    }

    execute {

        var loopIndex: UInt64 = 0

        for artName in artNames {

            // add art to on-chain art library
            self.storeAdminRef.addArt(
                artistName: artistName, 
                seriesName: seriesName, 
                artName: artName, 
                planetName: planetNames[loopIndex],
                baseArt: baseArtwork[loopIndex], 
                cardArt: cardArtwork[loopIndex], 
                artDescription: artDescriptions[loopIndex],
                artThumbnail: artThumbnails[loopIndex],
                artThumbnailPath: nil // for now we are not adding a path to the IPFS CID
            )

            // increment the loop reference index
            loopIndex = loopIndex + 1

        }
    }
}
