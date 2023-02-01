import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/core/MetadataViews.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"
import FLOASISItems from "../../contracts/FLOASISItems.cdc"
import IaNFTAnalogs from "../../contracts/IaNFTAnalogs.cdc"

transaction(floasisNFTID: UInt64, typeIDs: [String], ids: [UInt64], compositeGroupName: String, compositeName: String) {

    let userFLOASISNFTCollection: &FLOASISNFT.Collection
    let userFLOASISNFT: &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPrivate, FLOASISNFT.NFTPublic, MetadataViews.Resolver}
    let compositeName: String
    let orderedGElements: [IaNFTAnalogs.GElem]
    let compositeGroupName: String

    prepare(acct: AuthAccount) {

        self.userFLOASISNFTCollection = acct.borrow<&FLOASISNFT.Collection>(from: FLOASISNFT.CollectionStoragePath)
            ?? panic("Could not borrow the FLOASISNFT Collection")

        self.userFLOASISNFT = self.userFLOASISNFTCollection.borrowFLOASISNFTPrivate(id: floasisNFTID)
            ?? panic("No such ID in that collection")

        self.compositeGroupName = compositeGroupName 
        self.compositeName = compositeName


        var loopIndex: UInt64 = 0

        self.orderedGElements = []

        for typeID in typeIDs {
            switch typeID {
                case "A.1e6c796ede473684.FLOASISNFT.NFT":

                    let floasisNFTCollection = acct.borrow<&FLOASISNFT.Collection{FLOASISNFT.FLOASISNFTCollectionPublic, NonFungibleToken.CollectionPublic}>(
                        from: FLOASISNFT.CollectionStoragePath
                    ) ?? panic("Cannot borrow FLOASISNFT collection capability signer")

                    let floasisNFT = floasisNFTCollection.borrowFLOASISNFT(id: ids[loopIndex])!

                    if floasisNFT != nil {
                        self.orderedGElements.appendAll(floasisNFT.getBase().children)
                    }
                case "A.b057f5dbaa8b3220.FLOASISItems.NFT":

                    let floasisItemsNFTCollection = acct.borrow<&FLOASISItems.Collection{FLOASISItems.FLOASISItemsCollectionPublic, NonFungibleToken.CollectionPublic}>(
                        from: FLOASISItems.CollectionStoragePath
                    ) ?? panic("Cannot borrow FLOASISItems collection capability signer")

                    let floasisItemsNFT = floasisItemsNFTCollection.borrowFLOASISItemsNFT(id: ids[loopIndex])!

                    if floasisItemsNFT != nil {
                        self.orderedGElements.appendAll(floasisItemsNFT.getBase().children)
                    }
                default:
                    panic("NFT type is not found.")
            }
            loopIndex = loopIndex + 1
        }

    }
    
    execute {

        let baseArt: IaNFTAnalogs.Svg = self.userFLOASISNFT.getBase()
        let composite: IaNFTAnalogs.Svg = IaNFTAnalogs.Svg(
            name: baseArt.name,
            attributes: baseArt.attributes,
            children: self.orderedGElements
        )

        self.userFLOASISNFT.addComposite(
            compositeGroupName: self.compositeGroupName,
            compositeName: self.compositeName,
            composite: composite
        )
    }
}
 