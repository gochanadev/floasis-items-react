import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/core/MetadataViews.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"

transaction(nftID: UInt64, compositeGroupName: String, compositeName: String) {

    let userNFTCollection: &FLOASISNFT.Collection
    let userNFT: &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPrivate, FLOASISNFT.NFTPublic, MetadataViews.Resolver}
    let compositeGroupName: String
    let compositeName: String

    prepare(acct: AuthAccount) {

        self.userNFTCollection = acct.borrow<&FLOASISNFT.Collection>(from: FLOASISNFT.CollectionStoragePath)
            ?? panic("Could not borrow the FLOASISNFT Collection")

        self.userNFT = self.userNFTCollection.borrowFLOASISNFTPrivate(id: nftID)
            ?? panic("No such ID in that collection")

        self.compositeGroupName = compositeGroupName
        self.compositeName = compositeName
    } execute {

        self.userNFT.removeComposite(
            compositeGroupName: compositeGroupName,
            compositeName: self.compositeName,
        )
    }
}
 