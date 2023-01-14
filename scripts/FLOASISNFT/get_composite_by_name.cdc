import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import IaNFTAnalogs from "../../contracts/IaNFTAnalogs.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"

pub fun main(address: Address, compositeGroupName: String, nftID: UInt64, compositeName: String): IaNFTAnalogs.Svg? {

    let account = getAccount(address)

    let collectionRef = account.getCapability(FLOASISNFT.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic, FLOASISNFT.FLOASISNFTCollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    let nftRef = collectionRef.borrowFLOASISNFT(id: nftID)!

    return nftRef.getComposite(compositeGroupName: compositeGroupName, compositeName: compositeName)
}
