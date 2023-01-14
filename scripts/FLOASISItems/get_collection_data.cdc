import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import IaNFTAnalogs from "../../contracts/IaNFTAnalogs.cdc"
import FLOASISItems from "../../contracts/FLOASISItems.cdc"

pub struct NFTData {
    pub let uuid: UInt64
    pub let id: UInt64
    pub let floasisID: UInt64
    pub let name: String
    pub let planet: String
    pub let description: String
    pub let thumbnail: String
    pub let base: IaNFTAnalogs.Svg
    pub let card: IaNFTAnalogs.Svg
    pub let identifier: String

    init (
        uuid: UInt64,
        id: UInt64,
        floasisID: UInt64,
        name: String,
        planet: String,
        description: String,
        thumbnail: String,
        base: IaNFTAnalogs.Svg,
        card: IaNFTAnalogs.Svg,
        identifier: String
    ){
        self.uuid = uuid 
        self.id = id 
        self.floasisID = floasisID 
        self.name = name 
        self.planet = planet 
        self.description = description 
        self.thumbnail = thumbnail 
        self.base = base 
        self.card = card 
        self.identifier = identifier
    }
}

pub fun main(address: Address): [NFTData] {

    let account = getAccount(address)

    let collectionRef = account.getCapability(FLOASISItems.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic, FLOASISItems.FLOASISItemsCollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")


    let nftIDs = collectionRef.getIDs()

    var loopIndex = UInt64(0)

    var nFTDataItems: [NFTData] = []

    for nftID in nftIDs {

        let nftRef = collectionRef.borrowFLOASISItemsNFT(id: nftID)!

        let nFTDataItem: NFTData = NFTData(
            uuid: nftRef.uuid,
            id: nftRef.id,
            floasisID: nftRef.floasisID,
            name: nftRef.name,
            planet: nftRef.planet.name,
            description: nftRef.description,
            thumbnail: nftRef.thumbnail,
            base: nftRef.getBase(),
            card: nftRef.getCard(),
            identifier: nftRef.getType().identifier
        )

        nFTDataItems.append(nFTDataItem)

        loopIndex = loopIndex + UInt64(1)
    }

    return nFTDataItems
}
