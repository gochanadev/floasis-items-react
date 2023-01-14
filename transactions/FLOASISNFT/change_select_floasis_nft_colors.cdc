import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"

transaction(nFTID: UInt64, gElemIndices: [UInt64], colors: [String]) {

    let userNFTCollection: &FLOASISNFT.Collection
    let userNFT: &FLOASISNFT.NFT

    prepare(acct: AuthAccount) {


        self.userNFTCollection = acct.borrow<&FLOASISNFT.Collection>(from: FLOASISNFT.CollectionStoragePath)
            ?? panic("Could not borrow the FLOASISNFT Collection")

        self.userNFT = self.userNFTCollection.borrowFLOASISNFT(id: nFTID)
            ?? panic("No such ID in that collection")
        
    } execute {
        var loopIndex: UInt64 = 0

        for colorIndex in gElemIndices {
            self.userNFT.updateBaseGFill(gElementId: colorIndex, color: colors[loopIndex])
            loopIndex = loopIndex + 1
        }
    }
}
 