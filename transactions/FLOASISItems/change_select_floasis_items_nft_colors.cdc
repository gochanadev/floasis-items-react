import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import FLOASISItems from "../../contracts/FLOASISItems.cdc"

transaction(nFTID: UInt64, gElemIndices: [UInt64], colors: [String]) {

    let userNFTCollection: &FLOASISItems.Collection
    let userNFT: &FLOASISItems.NFT

    prepare(acct: AuthAccount) {


        self.userNFTCollection = acct.borrow<&FLOASISItems.Collection>(from: FLOASISItems.CollectionStoragePath)
            ?? panic("Could not borrow the FLOASISItems Collection")

        self.userNFT = self.userNFTCollection.borrowFLOASISItemsNFTPrivate(id: nFTID)
            ?? panic("No such ID in that collection")
        
    } execute {
        var loopIndex: UInt64 = 0

        for colorIndex in gElemIndices {
            self.userNFT.updateBaseGFill(gElementId: colorIndex, color: colors[loopIndex])
            loopIndex = loopIndex + 1
        }
    }
}
 