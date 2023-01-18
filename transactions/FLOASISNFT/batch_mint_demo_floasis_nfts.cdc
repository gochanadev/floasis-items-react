import NonFungibleToken from "../../contracts/core/NonFungibleToken.cdc"
import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"
import IaNFTAnalogs from "../../contracts/IaNFTAnalogs.cdc"

transaction(
    recipient: Address,
    artNames: [String], 
    planetNames: [String], 
    baseArtwork: [IaNFTAnalogs.Svg], 
    cardArtwork: [IaNFTAnalogs.Svg], 
    artDescriptions: [String], 
    artThumbnails: [String],
    artThumbnailPaths: [String]
) {

    let recipientCollectionRef: &{NonFungibleToken.CollectionPublic}
    let artNames: [String]
    let planetNames: [String]
    let baseArtwork: [IaNFTAnalogs.Svg]
    let cardArtwork: [IaNFTAnalogs.Svg]
    let artDescriptions: [String]
    let artThumbnails: [String]
    let artThumbnailPaths: [String]

    prepare(signer: AuthAccount) {

        self.recipientCollectionRef = getAccount(recipient).getCapability<&{NonFungibleToken.CollectionPublic}>(FLOASISNFT.CollectionPublicPath).borrow()
            ?? panic("Cound not borrow the FLOASIS NFT Collection")

        self.artNames = artNames
        self.planetNames = planetNames
        self.baseArtwork = baseArtwork
        self.cardArtwork = cardArtwork
        self.artDescriptions = artDescriptions
        self.artThumbnails = artThumbnails
        self.artThumbnailPaths = artThumbnailPaths

    }

    execute {

        var loopIndex: UInt64 = 0

        for artName in artNames {
            
            FLOASISNFT.mintNFT(
                recipient: self.recipientCollectionRef,
                planet: self.planetNames[loopIndex],
                artName: self.artNames[loopIndex],
                baseSvgAnalog: self.baseArtwork[loopIndex],
                cardSvgAnalog: self.cardArtwork[loopIndex],
                artDescription: self.artDescriptions[loopIndex],
                artThumbnail: self.artThumbnails[loopIndex],
                artThumbnailPath: self.artThumbnailPaths[loopIndex]
            )

            // increment the loop reference index
            loopIndex = loopIndex + 1

        }
    }
}
