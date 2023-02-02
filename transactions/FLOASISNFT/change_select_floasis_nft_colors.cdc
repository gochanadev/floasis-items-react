import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/core/MetadataViews.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"

transaction(nFTID: UInt64, gElemIndices: [UInt64], colors: [String]) {

    let userNFT: &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPrivate, FLOASISNFT.NFTPublic, MetadataViews.Resolver}

    prepare(acct: AuthAccount) {


        let userNFTCollection = acct.borrow<&FLOASISNFT.Collection>(from: FLOASISNFT.CollectionStoragePath)
            ?? panic("Could not borrow the FLOASISNFT Collection")

        self.userNFT = userNFTCollection.borrowFLOASISNFTPrivate(id: nFTID)
            ?? panic("No such ID in that collection")
        
    } execute {
        var loopIndex: UInt64 = 0

        for colorIndex in gElemIndices {
            self.userNFT.updateBaseGFill(gElementId: colorIndex, color: colors[loopIndex])
            loopIndex = loopIndex + 1
        }
    }
}
 