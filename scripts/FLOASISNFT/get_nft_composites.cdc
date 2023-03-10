import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"
import FLOASISPrimitives from "../../contracts/FLOASISPrimitives.cdc"

pub fun main(address: Address, nftID: UInt64): {String: FLOASISPrimitives.CompositeGroup} {

    let account = getAccount(address)

    let collectionRef = account.getCapability(FLOASISNFT.CollectionPublicPath).borrow<&{NonFungibleToken.CollectionPublic, FLOASISNFT.FLOASISNFTCollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    let nftRef = collectionRef.borrowFLOASISNFT(id: nftID)!

    return nftRef.getComposites()

}
