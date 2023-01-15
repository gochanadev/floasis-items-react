import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"

transaction() {

    prepare(signer: AuthAccount) {

        if signer.borrow<&FLOASISNFT.Collection>(from: FLOASISNFT.CollectionStoragePath) == nil {
            signer.save(<-FLOASISNFT.createEmptyCollection(), to: FLOASISNFT.CollectionStoragePath)
        }

        if signer.getLinkTarget(FLOASISNFT.CollectionPublicPath) == nil {
            signer.link<&FLOASISNFT.Collection{FLOASISNFT.FLOASISNFTCollectionPublic, NonFungibleToken.CollectionPublic}>(FLOASISNFT.CollectionPublicPath, target: FLOASISNFT.CollectionStoragePath)
        }

    }

}
 