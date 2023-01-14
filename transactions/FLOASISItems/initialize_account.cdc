import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import FLOASISItems from "../../contracts/FLOASISItems.cdc"

transaction() {

    prepare(signer: AuthAccount) {

        if signer.borrow<&FLOASISItems.Collection>(from: FLOASISItems.CollectionStoragePath) == nil {
            signer.save(<-FLOASISItems.createEmptyCollection(), to: FLOASISItems.CollectionStoragePath)
        }

        if signer.getLinkTarget(FLOASISItems.CollectionPublicPath) == nil {
            signer.link<&FLOASISItems.Collection{FLOASISItems.FLOASISItemsCollectionPublic, NonFungibleToken.CollectionPublic}>(FLOASISItems.CollectionPublicPath, target: FLOASISItems.CollectionStoragePath)
        }

    }

}
