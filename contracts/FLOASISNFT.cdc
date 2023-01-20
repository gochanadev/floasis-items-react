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

    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let CollectionProviderPath: PrivatePath

    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let floasisID: UInt64
        pub let id: UInt64
        pub let planet: FLOASISPrimitives.Planet
        pub let name: String
        pub let description: String
        pub let thumbnail: String
        pub let thumbnailPath: String?
        
        access(self) let base: IaNFTAnalogs.Svg
        access(self) let card: IaNFTAnalogs.Svg
        
        // here the key can be any string, but usually should be a resource type identifier
        access(self) var composites: {String: FLOASISPrimitives.CompositeGroup}

        pub fun getBase(): IaNFTAnalogs.Svg {
            return self.base
        }

        pub fun getCard(): IaNFTAnalogs.Svg {
            return self.card
        }

        // TODO: do public methods here mean anyone who borrows the NFT can call them?
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
            planet: FLOASISPrimitives.Planet,
            name: String,
            description: String,
            thumbnail: String,
            thumbnailPath: String?,
            base: IaNFTAnalogs.Svg,
            card: IaNFTAnalogs.Svg,
        ) {
            self.floasisID = floasisID
            self.id = id
            self.planet = planet
            self.name = name
            self.description = description
            self.thumbnail = thumbnail
            self.thumbnailPath = thumbnailPath
            self.base = base
            self.card = card
            self.composites = {}
        }
    
        // TODO: add metadata view
        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.NFTCollectionData>()
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
            }
            return nil
        }
    }

    pub resource interface FLOASISNFTCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowFLOASISNFT(id: UInt64): &FLOASISNFT.NFT? {
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
 
        pub fun borrowFLOASISNFT(id: UInt64): &FLOASISNFT.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &FLOASISNFT.NFT
            }

            return nil
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

    // no payment required, is just intended to get demo FLOASIS NFTs into user account
    pub fun mintNFT(
        recipient: &{NonFungibleToken.CollectionPublic},
        planet: String,
        artName: String,
        baseSvgAnalog: IaNFTAnalogs.Svg,
        cardSvgAnalog: IaNFTAnalogs.Svg,
        artDescription: String,
        artThumbnail: String,
        artThumbnailPath: String?
    ) {
        var newNFT <- create NFT(
            floasisID: FLOASISNFT.totalSupply,
            id: FLOASISNFT.totalSupply,
            planet: FLOASISPrimitives.Planet(name: planet, discoveredTs: getCurrentBlock().timestamp),
            name: artName,
            description: artDescription,
            thumbnail: artThumbnail,
            thumbnailPath: artThumbnailPath,
            base: baseSvgAnalog,
            card: cardSvgAnalog,
        )

        recipient.deposit(token: <-newNFT)

        FLOASISNFT.totalSupply = FLOASISNFT.totalSupply + UInt64(1)

    }

    init() {
        self.totalSupply = 0

        self.CollectionStoragePath = /storage/floasisOfficialfloasisNFTCollection
        self.CollectionPublicPath = /public/floasisOfficialfloasisNFTCollection
        self.CollectionProviderPath = /private/floasisOfficialfloasisNFTCollection

        emit ContractInitialized()
    }
}
 