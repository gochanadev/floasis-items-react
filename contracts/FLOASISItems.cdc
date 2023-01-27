import NonFungibleToken from "./core/NonFungibleToken.cdc"
import FungibleToken from "./core/FungibleToken.cdc"
import FlowToken from "./core/FlowToken.cdc"
import MetadataViews from "./core/MetadataViews.cdc"
import IaNFTAnalogs from "./IaNFTAnalogs.cdc"
import FLOASISPrimitives from "./FLOASISPrimitives.cdc"
import FLOASISNFT from "./FLOASISNFT.cdc"
import FLOASISItemsStore from "./FLOASISItemsStore.cdc"

pub contract FLOASISItems: NonFungibleToken {

    pub var totalSupply: UInt64

    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event NFTMinted(id: UInt64, recipient: Address)

    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let CollectionProviderPath: PrivatePath
    pub let MinterStoragePath: StoragePath

    pub resource interface NFTPublic {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let thumbnail: String
        pub let thumbnailPath: String?
        pub let inventoryItemID: UInt64
        pub let floasisID: UInt64
        pub let planet: FLOASISPrimitives.Planet
        pub fun getBase(): IaNFTAnalogs.Svg
        pub fun getCard(): IaNFTAnalogs.Svg
    }

    pub resource interface NFTPrivate {
        pub fun updateBaseGFill(gElementId: UInt64, color: String)
        pub fun updateCardGFill(gElementId: UInt64, color: String)
    }

    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver, NFTPublic, NFTPrivate {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let thumbnail: String
        pub let thumbnailPath: String?
        access(self) let royalties: [MetadataViews.Royalty]
        access(self) let metadata: {String: AnyStruct}
        access(self) let base: IaNFTAnalogs.Svg
        access(self) let card: IaNFTAnalogs.Svg
        pub let inventoryItemID: UInt64
        pub let floasisID: UInt64
        pub let planet: FLOASISPrimitives.Planet

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
 
        init(
            id: UInt64,
            name: String,
            description: String,
            thumbnail: String,
            thumbnailPath: String?,
            royalties: [MetadataViews.Royalty],
            metadata: {String: AnyStruct},
            base: IaNFTAnalogs.Svg,
            card: IaNFTAnalogs.Svg,
            inventoryItemID: UInt64,
            floasisID: UInt64,
            planet: FLOASISPrimitives.Planet
        ) {
            self.id = id
            self.name = name
            self.description = description
            self.thumbnail = thumbnail
            self.thumbnailPath = thumbnailPath
            self.royalties = royalties
            self.metadata = metadata
            self.base = base
            self.card = card
            self.inventoryItemID = inventoryItemID
            self.floasisID = floasisID
            self.planet = planet
        }
    
        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Serial>(),
                Type<MetadataViews.Royalties>(),
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
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(
                        self.id
                    )
                case Type<MetadataViews.Royalties>():
                    return MetadataViews.Royalties(
                        self.royalties
                    )
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: FLOASISItems.CollectionStoragePath,
                        publicPath: FLOASISItems.CollectionPublicPath,
                        providerPath: FLOASISItems.CollectionProviderPath,
                        publicCollection: Type<&FLOASISItems.Collection{FLOASISItems.FLOASISItemsCollectionPublic}>(),
                        publicLinkedType: Type<&FLOASISItems.Collection{FLOASISItems.FLOASISItemsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&FLOASISItems.Collection{FLOASISItems.FLOASISItemsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-FLOASISItems.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let squareMedia = MetadataViews.Media(
                        file: MetadataViews.IPFSFile(
                            cid: "[YOUR-IPFS-CID]",
                            path: nil // you can add a string path here instead of 'nil'
                        ),
                        mediaType: "image/png" // see metadata standard, 'image/png' is just one of the supported types
                    )

                    let bannerMedia = MetadataViews.Media(
                        file: MetadataViews.IPFSFile(
                            cid: "[YOUR-IPFS-CID]",
                            path: nil // you can add a string path here instead of 'nil'
                        ),
                        mediaType: "image/png" // see metadata standard, 'image/png' is just one of the supported types
                    )

                    return MetadataViews.NFTCollectionDisplay(
                        name: "FLOSIS Items Collection",
                        description: "This collection is used as an example to help you develop your next Flow IaNFT.",
                        externalURL: MetadataViews.ExternalURL("https://ianft.fun"),
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

    pub resource interface FLOASISItemsCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowFLOASISItemsNFT(id: UInt64): &FLOASISItems.NFT{NonFungibleToken.INFT, FLOASISItems.NFTPublic, MetadataViews.Resolver}? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow FLOASISItems reference: the ID of the returned reference is incorrect"
            }
        }
    }

    pub resource Collection: FLOASISItemsCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        // dictionary of NFT conforming tokens
        // NFT is a resource type with an `UInt64` ID field
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        // withdraw removes an NFT from the collection and moves it to the caller
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        // deposit takes a NFT and adds it to the collections dictionary
        // and adds the ID to the id array
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @FLOASISItems.NFT

            let id: UInt64 = token.id

            // add the new token to the dictionary which removes the old one
            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        // getIDs returns an array of the IDs that are in the collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // borrowNFT gets a reference to an NFT in the collection
        // so that the caller can read its metadata and call its methods
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }
 
        pub fun borrowFLOASISItemsNFT(id: UInt64): &FLOASISItems.NFT{NonFungibleToken.INFT, FLOASISItems.NFTPublic, MetadataViews.Resolver}? {
            if self.ownedNFTs[id] != nil {
                // Create an authorized reference to allow downcasting
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                let floasisItemsNFT = ref as! &FLOASISItems.NFT
                return floasisItemsNFT as &FLOASISItems.NFT{NonFungibleToken.INFT, FLOASISItems.NFTPublic, MetadataViews.Resolver}
            }

            return nil
        }

        pub fun borrowFLOASISItemsNFTPrivate(id: UInt64): &FLOASISItems.NFT{NonFungibleToken.INFT, FLOASISItems.NFTPrivate}? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &FLOASISItems.NFT
            } else {
                return nil
            }
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let floasisItemsNFT = nft as! &FLOASISItems.NFT
            return floasisItemsNFT as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // public function that anyone can call to create a new empty collection
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    // mintNFT mints a new NFT with a new ID
    // and deposit it in the recipients collection using their collection reference
    pub fun mintNFT(
        recipient: &{NonFungibleToken.CollectionPublic},
        inventoryItemID: UInt64,
        payment: @FungibleToken.Vault,
        floasisNFTRef: &FLOASISNFT.NFT{NonFungibleToken.INFT, FLOASISNFT.NFTPrivate, FLOASISNFT.NFTPublic, MetadataViews.Resolver}

    ) {
        pre {
            FLOASISItemsStore.getActiveInventoryItem(inventoryItemID) != nil : "Could not find inventory item with that ID."
        }

        let inventoryItem: FLOASISItemsStore.InventoryItem = FLOASISItemsStore.getActiveInventoryItem(inventoryItemID)!

        let inventoryItemPlanet: FLOASISPrimitives.Planet = FLOASISNFT.getPlanetDetails(inventoryItem.artItem.planet.name)!
        if (inventoryItemPlanet == nil) {
            panic("Could not find planet in The FLOASIS")
        }

        if (inventoryItemPlanet.name != floasisNFTRef.planet.name) {
            panic("Your FLOASIS NFT can only buy accessories from their home planet!!")
        }

        if (inventoryItem.numSold >= inventoryItem.quantity) {
            panic ("This item is sold out!!!")
        }

        let royaltiesReceiverFlowTokenReceiverCap = getAccount(inventoryItem.royaltiesRecipient).getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
        assert(royaltiesReceiverFlowTokenReceiverCap.borrow() != nil, message: "Missing or mis-typed FlowToken receiver")

        let royaltyReceiver = MetadataViews.Royalty(
            receiver: royaltiesReceiverFlowTokenReceiverCap,
            cut: 0.05,
            description: "FLOASIS Items royalty"
        )

        let metadata: {String: AnyStruct} = {}
        let currentBlock = getCurrentBlock()
        metadata["mintedBlock"] = currentBlock.height
        metadata["mintedTime"] = currentBlock.timestamp
        metadata["minter"] = recipient.owner!.address

        if inventoryItem.price != payment.balance {
            panic("payment is not correct")
        }

        // create a new NFT
        var newNFT <- create NFT(
            id: FLOASISItems.totalSupply,
            name: inventoryItem.itemName,
            description: inventoryItem.description,
            thumbnail: inventoryItem.thumbnail,
            thumbnailPath: nil, // for demo FLOASIS NFT we are not using a thumbnail path
            royalties: [royaltyReceiver],
            metadata: metadata,
            base: inventoryItem.artItem.base,
            card: inventoryItem.artItem.card,
            inventoryItemID: inventoryItem.id,
            floasisID: inventoryItem.numSold,
            planet: inventoryItemPlanet
        )

        // accepts FLOW tokens from the payment vault
        let paymentRecipientRef = getAccount(inventoryItem.paymentRecipient).getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).borrow()
            ?? panic("couldn't borrow flow token receiver cap")

        paymentRecipientRef.deposit(from: <-payment)

        // deposit it in the recipient's account using their reference
        recipient.deposit(token: <-newNFT)

        FLOASISItemsStore.activeInventory[inventoryItemID]!.recordInventoryItemSold(recipientAddress: recipient.owner!.address)

        emit NFTMinted(id: FLOASISItems.totalSupply, recipient: recipient.owner!.address)

        FLOASISItems.totalSupply = FLOASISItems.totalSupply + UInt64(1)
    }

    init() {
        // Initialize the total supply
        self.totalSupply = 0

        // Set the named paths
        self.CollectionStoragePath = /storage/floasisOfficialFloasisItemsCollection
        self.CollectionPublicPath = /public/floasisOfficialFloasisItemsCollection
        self.CollectionProviderPath = /private/floasisOfficialFloasisItemsCollection
        self.MinterStoragePath = /storage/floasisOfficialFloasisItemsMinter

        // Create a Collection resource and save it to storage
        let collection <- create Collection()
        self.account.save(<-collection, to: self.CollectionStoragePath)

        // create a public capability for the collection
        self.account.link<&FLOASISItems.Collection{NonFungibleToken.CollectionPublic, FLOASISItems.FLOASISItemsCollectionPublic, MetadataViews.ResolverCollection}>(
            self.CollectionPublicPath,
            target: self.CollectionStoragePath
        )

        emit ContractInitialized()
    }
}
 