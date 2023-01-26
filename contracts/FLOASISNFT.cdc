/*
This is a demo implementation of the FLOASIS NFT. It's been simplified to allow
for easier development by accessories store builders, yet also contain the 
same elements as the official FLAOSIS NFT deployed to mannet.

If you want to deploy your own iaNFT contract and want something robust, have a 
look at the official FLOASISNFT contract. See hichana github for more info.
*/

import NonFungibleToken from "./core/NonFungibleToken.cdc"
import FungibleToken from "./core/FungibleToken.cdc"
import MetadataViews from "./core/MetadataViews.cdc"
import IaNFTAnalogs from "./IaNFTAnalogs.cdc"
import FLOASISPrimitives from "./FLOASISPrimitives.cdc"

pub contract FLOASISNFT: NonFungibleToken {

    pub var totalSupply: UInt64

    // named artists who make art for The FLOASIS
    pub var artLibrary: {String: FLOASISPrimitives.Artist}

    pub let paymentRecipient: Address

    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event ArtistAdded(artistName: String, address: Address)
    pub event ArtistRemoved(artistName: String, address: Address)
    pub event SeriesAdded(artistName: String, seriesName: String)
    pub event SeriesRemoved(artistName: String, seriesName: String)
    pub event ArtAddedToSeries(artistName: String, seriesName: String, artName: String)
    pub event ArtRemovedFromSeries(artistName: String, seriesName: String, artName: String)
 
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let CollectionProviderPath: PrivatePath

    pub resource interface NFTPublic {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let thumbnail: String
        pub let thumbnailPath: String?
        pub let floasisID: UInt64
        pub let planet: FLOASISPrimitives.Planet
        pub fun getBase(): IaNFTAnalogs.Svg
        pub fun getCard(): IaNFTAnalogs.Svg
        pub fun getCompositesGroupNamesList(): [String]
        pub fun getCompositesNamesByGroupName(compositeGroupName: String): [String]
        pub fun getComposite(compositeGroupName: String, compositeName: String): IaNFTAnalogs.Svg?
        pub fun getComposites(): {String: FLOASISPrimitives.CompositeGroup}
    }

    pub resource interface NFTPrivate {
        pub fun updateBaseGFill(gElementId: UInt64, color: String)
        pub fun updateCardGFill(gElementId: UInt64, color: String)
        pub fun addComposite(compositeGroupName: String, compositeName: String, composite: IaNFTAnalogs.Svg)
        pub fun removeComposite(compositeGroupName: String, compositeName: String)
    }

    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver, NFTPublic, NFTPrivate {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let thumbnail: String
        pub let thumbnailPath: String?

        pub let floasisID: UInt64
        pub let planet: FLOASISPrimitives.Planet
        
        access(self) let stacklist: [String]
        access(self) let base: IaNFTAnalogs.Svg
        access(self) let card: IaNFTAnalogs.Svg
        access(self) let metadata: {String: AnyStruct}
 
        // here the key can be any string, but usually should be a resource type identifier
        access(self) var composites: {String: FLOASISPrimitives.CompositeGroup}

        pub fun getStacklist(): [String] {
            return self.stacklist
        }

        pub fun getBase(): IaNFTAnalogs.Svg {
            return self.base
        }

        pub fun getCard(): IaNFTAnalogs.Svg {
            return self.card
        }

        pub fun updateBaseGFill(gElementId: UInt64, color: String) {
            pre {
                self.base.children[gElementId] != nil : "Cannot find the g element with provided id for the base"
            }
            self.base.children[gElementId]!.attributes.setFill(color)
        }

        pub fun updateCardGFill(gElementId: UInt64, color: String) {
            pre {
                self.card.children[gElementId] != nil : "Cannot find the g element with provided id for the card"
            }
            self.card.children[gElementId]!.attributes.setFill(color)
        }

        pub fun addComposite(compositeGroupName: String, compositeName: String, composite: IaNFTAnalogs.Svg) {

            // add a composite group if it doesn't already exist
            if (self.composites[compositeGroupName] == nil) {
                self.composites.insert(key: compositeGroupName, FLOASISPrimitives.CompositeGroup())
            }

            self.composites[compositeGroupName]!.addComposite(
                compositeName: compositeName,
                composite: composite 
            )
        }

        pub fun removeComposite(compositeGroupName: String, compositeName: String) {

            pre {
                self.composites[compositeGroupName] != nil : "cannot find a compositeGroupName in composites with that name"
            }

            self.composites[compositeGroupName]!.removeComposite(
                compositeName: compositeName
            )
        }

        pub fun getCompositesGroupNamesList(): [String] {
            return self.composites.keys
        }

        pub fun getCompositesNamesByGroupName(compositeGroupName: String): [String] {
            pre {
                self.composites[compositeGroupName] != nil : "cannot find a compositeGroupName in composites with that name"
            }
            return self.composites[compositeGroupName]!.group.keys
        }

        pub fun getComposite(compositeGroupName: String, compositeName: String): IaNFTAnalogs.Svg? {
            pre {
                self.composites[compositeGroupName] != nil : "cannot find a compositeGroupName in composites with that name"
            }
            return self.composites[compositeGroupName]!.group[compositeName]
        }

        pub fun getComposites(): {String: FLOASISPrimitives.CompositeGroup} {
            return self.composites
        }

        init(
            floasisID: UInt64,
            id: UInt64,
            stacklist: [String],
            planet: FLOASISPrimitives.Planet,
            name: String,
            description: String,
            thumbnail: String,
            thumbnailPath: String?,
            base: IaNFTAnalogs.Svg,
            card: IaNFTAnalogs.Svg,
            metadata: {String: AnyStruct}
        ) {
            self.floasisID = floasisID
            self.id = id
            self.stacklist = stacklist
            self.planet = planet
            self.name = name
            self.description = description
            self.thumbnail = thumbnail
            self.thumbnailPath = thumbnailPath
            self.base = base
            self.card = card
            self.metadata = metadata
            self.composites = {}
        }
    
        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Traits>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.name,
                        description: self.description,
                        thumbnail: MetadataViews.IPFSFile(
                            cid: self.thumbnail,
                            path: self.thumbnailPath
                        )
                    )
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: FLOASISNFT.CollectionStoragePath,
                        publicPath: FLOASISNFT.CollectionPublicPath,
                        providerPath: FLOASISNFT.CollectionProviderPath,
                        publicCollection: Type<&FLOASISNFT.Collection{FLOASISNFT.FLOASISNFTCollectionPublic}>(),
                        publicLinkedType: Type<&FLOASISNFT.Collection{FLOASISNFT.FLOASISNFTCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&FLOASISNFT.Collection{FLOASISNFT.FLOASISNFTCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Provider, MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-FLOASISNFT.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let squareMedia = MetadataViews.Media(
                        file: MetadataViews.IPFSFile(
                            cid: "[TODO: add CID here]",
                            path: nil
                        ),
                        mediaType: "image/png"
                    )

                    let bannerMedia = MetadataViews.Media(
                        file: MetadataViews.IPFSFile(
                            cid: "[TODO: add CID here]",
                            path: nil
                        ),
                        mediaType: "image/png"
                    )

                    return MetadataViews.NFTCollectionDisplay(
                        name: "FLOASIS Items NFT Collection",
                        description: "This is a FLOASIS Items project, decentralized accessories for FLOASIS NFTs!",
                        externalURL: MetadataViews.ExternalURL("https://floasis.fun"),
                        squareImage: squareMedia,
                        bannerImage: bannerMedia,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/thefloasis")
                        }
                    )
                case Type<MetadataViews.Traits>():
                    let traitsView = MetadataViews.dictToTraits(dict: self.metadata, excludedNames: nil)
                    return traitsView

            }
            return nil
        }
    }

    pub resource interface FLOASISNFTCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowFLOASISNFT(id: UInt64): &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPublic, MetadataViews.Resolver}? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow FLOASISNFT reference: the ID of the returned reference is incorrect"
            }
        }
    }

    pub resource Collection: FLOASISNFTCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @FLOASISNFT.NFT

            let id: UInt64 = token.id

            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }
 
        pub fun borrowFLOASISNFT(id: UInt64): &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPublic, MetadataViews.Resolver}? {
            if self.ownedNFTs[id] != nil {
                // Create an authorized reference to allow downcasting
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                let floasisNFTRef = ref as! &FLOASISNFT.NFT
                return floasisNFTRef as &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPublic, MetadataViews.Resolver}
            }

            return nil
        }

        pub fun borrowFLOASISNFTPrivate(id: UInt64): &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPrivate, FLOASISNFT.NFTPublic, MetadataViews.Resolver}? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                let floasisNFTRef = ref as! &FLOASISNFT.NFT
                return floasisNFTRef as &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPrivate, FLOASISNFT.NFTPublic, MetadataViews.Resolver}
            } else {
                return nil
            }
        }
 
        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let floasisNFT = nft as! &FLOASISNFT.NFT
            return floasisNFT as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    pub fun getTotalSupply(): UInt64 {
        return self.totalSupply
    }

    pub fun getPlanetDetails(_ planetName: String): FLOASISPrimitives.Planet {
        return FLOASISPrimitives.Planet(
            name: planetName,
            discoveredTs: getCurrentBlock().timestamp
        )
    }

    pub fun addArtist(artistName: String, artistDetails: FLOASISPrimitives.Artist) {
        pre {
            FLOASISNFT.artLibrary[artistName] == nil: "Artist already exists in the art library"
        }

        FLOASISNFT.artLibrary.insert(key: artistName, artistDetails)

        emit ArtistAdded(artistName: artistName, address: artistDetails.address)

    }

    pub fun removeArtist(artistName: String) {
        pre {
            FLOASISNFT.artLibrary[artistName] != nil: "Artist not found in the art library"
        }

        let address = FLOASISNFT.artLibrary[artistName]!.address

        FLOASISNFT.artLibrary.remove(key: artistName)

        emit ArtistRemoved(artistName: artistName, address: address)
    }

    pub fun addSeries(artistName: String, seriesName: String) {
        pre {
            FLOASISNFT.artLibrary[artistName] != nil: "Artist not found in the art library"
        }

        FLOASISNFT.artLibrary[artistName]!.addSeries(seriesName: seriesName)

        emit SeriesAdded(artistName: artistName, seriesName: seriesName)
    }

    pub fun removeSeries(artistName: String, seriesName: String) {
        pre {
            FLOASISNFT.artLibrary[artistName] != nil: "Artist not found in the art library"
            FLOASISNFT.artLibrary[artistName]!.series[seriesName] != nil: "Series not found"
        }

        FLOASISNFT.artLibrary[artistName]!.removeSeries(seriesName: seriesName)

        emit SeriesRemoved(artistName: artistName, seriesName: seriesName)

    }

    pub fun addArt(
        artistName: String, 
        seriesName: String, 
        artName: String,
        planetName: String,
        baseArt: IaNFTAnalogs.Svg, 
        cardArt: IaNFTAnalogs.Svg, 
        artDescription: String,
        artThumbnail: String,
        artThumbnailPath: String?
    ) {
        pre {
            FLOASISNFT.artLibrary[artistName] != nil: "Artist not found in the art library"
            FLOASISNFT.artLibrary[artistName]!.series[seriesName] != nil: "Series not found in the art library"
            FLOASISNFT.artLibrary[artistName]!.series[seriesName]!.art[artName] == nil : "An artwork for this series with the same name already exists"
        }

        FLOASISNFT.artLibrary[artistName]!.series[seriesName]!.addArt(artName: artName, planet: FLOASISNFT.getPlanetDetails(planetName)!, base: baseArt, card: cardArt, artDescription: artDescription, artThumbnail: artThumbnail, artThumbnailPath: artThumbnailPath)

        emit ArtAddedToSeries(artistName: artistName, seriesName: seriesName, artName: artName)

    }

    pub fun removeArt(artistName: String, seriesName: String, artName: String) {
        pre {
            FLOASISNFT.artLibrary[artistName] != nil: "Artist not found in the art library"
            FLOASISNFT.artLibrary[artistName]!.series[seriesName] != nil: "Series not found in the art library"
            FLOASISNFT.artLibrary[artistName]!.series[seriesName]!.art[artName] != nil : "Artwork for this series not found"
        }

        FLOASISNFT.artLibrary[artistName]!.series[seriesName]!.removeArt(artName: artName)

        emit ArtRemovedFromSeries(artistName: artistName, seriesName: seriesName, artName: artName)

    }

    pub fun getArtistSeriesArt(artistName: String, seriesName: String, artName: String): FLOASISPrimitives.Art? {
        pre {
            FLOASISNFT.artLibrary[artistName] != nil : "Cannot find an artist by that name in the art library"
            FLOASISNFT.artLibrary[artistName]!.series[seriesName] != nil : "Cannot find an a series with that name for the given artist"
            FLOASISNFT.artLibrary[artistName]!.series[seriesName]!.art[artName] != nil : "Cannot find an a an artwork with that name"
        }

        return FLOASISNFT.artLibrary[artistName]!.series[seriesName]!.art[artName]
    }

    pub fun mintNFT(
        recipient: &{NonFungibleToken.CollectionPublic},
        dropId: UInt64,
        artName: String,
        stacklist: [&NonFungibleToken.NFT],
        payment: @FungibleToken.Vault
    ) {

        let paymentRecipientRef = getAccount(FLOASISNFT.paymentRecipient).getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).borrow()
            ?? panic("couldn't borrow receiver cap")

        paymentRecipientRef.deposit(from: <-payment)

        let demoArt = FLOASISNFT.getArtistSeriesArt(artistName: "floasisDemoArtist", seriesName: "floasisDemoSeries", artName: artName)!

        let metadata: {String: AnyStruct} = {}
        let currentBlock = getCurrentBlock()
        metadata["mintedBlock"] = currentBlock.height
        metadata["mintedTime"] = currentBlock.timestamp
        metadata["minter"] = recipient.owner!.address

        let fullyQualifiedStacklistIdentifiers: [String] = []
        for nftRef in stacklist {
            let nftRefIdentifier = nftRef.getType().identifier

            let rawRefID: UInt64 = nftRef.id
            let dotSeparator: String = "."
            let refID: String = dotSeparator.concat(rawRefID.toString())
            let concatenatedIdentifier: String = nftRefIdentifier.concat(refID)
            fullyQualifiedStacklistIdentifiers.append(concatenatedIdentifier)
        }

        var newNFT <- create NFT(
            floasisID: FLOASISNFT.totalSupply,
            id: FLOASISNFT.totalSupply,
            stacklist: fullyQualifiedStacklistIdentifiers,
            planet: FLOASISPrimitives.Planet(name: "Demo Planet", discoveredTs: getCurrentBlock().timestamp),
            name: "Demo NFT name",
            description: "This is the description for the demo FLOASIS NFT.",
            thumbnail: "[PLACEHOLDER-FOR-IPFS-CID]",
            thumbnailPath: "[PLACEHOLDER-FOR-IPFS-CID-PATH]",
            base: demoArt.base,
            card: demoArt.card,
            metadata: metadata
        )

        recipient.deposit(token: <-newNFT)

        FLOASISNFT.totalSupply = FLOASISNFT.totalSupply + UInt64(1)

    }

    init() {
        self.totalSupply = 0
        self.artLibrary = {}
        self.paymentRecipient = self.account.address

        self.CollectionStoragePath = /storage/demoFloasisNFTCollection
        self.CollectionPublicPath = /public/demoFloasisNFTCollection
        self.CollectionProviderPath = /private/demoFloasisNFTCollection

        emit ContractInitialized()
    }
}
 