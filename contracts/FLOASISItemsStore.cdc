import FLOASISNFT from "./FLOASISNFT.cdc"
import FLOASISPrimitives from "./FLOASISPrimitives.cdc"
import IaNFTAnalogs from "./IaNFTAnalogs.cdc"

pub contract FLOASISItemsStore {

    pub var totalInventoryItemSupply: UInt64

    pub event ContractInitialized()
    pub event InventoryItemCreated(id: UInt64)
    pub event InventoryAdded(id: UInt64, itemName: String, quantity: UInt64)
    pub event InventoryRemoved(id: UInt64, itemName: String, quantity: UInt64)
    pub event PriceChanged(id: UInt64, itemName: String, newPrice: UFix64)
    pub event DescriptionChanged(id: UInt64, itemName: String, newDescription: String)
    pub event ThumbnailChanged(id: UInt64, itemName: String, newThumbnail: String)
    pub event ThumbnailPathChanged(id: UInt64, itemName: String, newThumbnailPath: String?)
    pub event InventoryItemSetActive(id: UInt64, itemName: String)
    pub event InventoryItemSetInactive(id: UInt64, itemName: String)
    pub event ArtistAdded(artistName: String, address: Address)
    pub event ArtistRemoved(artistName: String, address: Address)
    pub event SeriesAdded(artistName: String, seriesName: String)
    pub event SeriesRemoved(artistName: String, seriesName: String)
    pub event ArtAddedToSeries(artistName: String, seriesName: String, artName: String)
    pub event ArtRemovedFromSeries(artistName: String, seriesName: String, artName: String)
    pub event InventoryItemSold(id: UInt64, recipientAddress: Address)
    pub event PaymentRecipientChanged(id: UInt64, newAddress: Address)
    pub event RoyaltiesRecipientChanged(id: UInt64, newAddress: Address)

    pub let FLOASISItemsStoreAdminPath: StoragePath

    access(account) let artLibrary: {String: FLOASISPrimitives.Artist}
    access(account) let activeInventory: {UInt64: InventoryItem}
    access(account) let inactiveInventory: {UInt64: InventoryItem}

    // TODO: verify createdTS not UInt64
    pub struct InventoryItem {
        pub let id: UInt64
        pub let itemName: String
        pub var description: String
        pub let category: String // this string is not enforced by the artLibrary
        pub var thumbnail: String // should be an IPFS CID
        pub var thumbnailPath: String?
        pub let createdTs: UFix64 
        pub var quantity: UInt64
        pub var price: UFix64
        pub var isActive: Bool
        pub let artItem: FLOASISPrimitives.Art
        pub let artName: String
        pub let artSeries: String
        pub var paymentRecipient: Address
        pub var royaltiesRecipient: Address
        pub var numSold: UInt64

        pub fun addInventory(_ quantityAdd: UInt64) {
            self.quantity = self.quantity + quantityAdd
            emit InventoryAdded(id: self.id, itemName: self.itemName, quantity: quantityAdd)
        }

        pub fun removeInventory(_ quantityRemove: UInt64) {
            self.quantity = self.quantity - quantityRemove
            emit InventoryRemoved(id: self.id, itemName: self.itemName, quantity: quantityRemove)
        }

        pub fun changePrice(_ newPrice: UFix64) {
            self.price = newPrice
            emit PriceChanged(id: self.id, itemName: self.itemName, newPrice: newPrice)
        }

        pub fun changeDescription(_ newDescription: String) {
            self.description = newDescription
            emit DescriptionChanged(id: self.id, itemName: self.itemName, newDescription: newDescription)
        }

        pub fun changeThumbnail(_ newThumbnail: String) {
            self.thumbnail = newThumbnail
            emit ThumbnailChanged(id: self.id, itemName: self.itemName, newThumbnail: newThumbnail)
        }

        pub fun changeThumbnailPath(_ newThumbnailPath: String?) {
            self.thumbnailPath = newThumbnailPath
            emit ThumbnailPathChanged(id: self.id, itemName: self.itemName, newThumbnailPath: newThumbnailPath)
        }

        pub fun setInventoryItemActive() {
            self.isActive = true
            emit InventoryItemSetActive(id: self.id, itemName: self.itemName)
        }

        pub fun setInventoryItemInactive() {
            self.isActive = false
            emit InventoryItemSetInactive(id: self.id, itemName: self.itemName)
        }

        pub fun changePaymentRecipient(newAddress: Address) {
            self.paymentRecipient = newAddress
            emit PaymentRecipientChanged(id: self.id, newAddress: newAddress)
        }

        pub fun changeRoyaltiesRecipient(newAddress: Address) {
            self.royaltiesRecipient = newAddress
            emit RoyaltiesRecipientChanged(id: self.id, newAddress: newAddress)
        }

        pub fun recordInventoryItemSold(recipientAddress: Address) {
            self.numSold = self.numSold + 1
            emit InventoryItemSold(id: self.id, recipientAddress: recipientAddress)
        }

        init(
            itemName: String,
            description: String,
            category: String,
            thumbnail: String,
            thumbnailPath: String?,
            quantity: UInt64,
            price: UFix64,
            artItem: FLOASISPrimitives.Art,
            artName: String,
            artSeries: String,
            paymentRecipient: Address,
            royaltiesRecipient: Address
        ) {
            self.id = FLOASISItemsStore.totalInventoryItemSupply
            self.itemName = itemName
            self.description = description
            self.category = category
            self.thumbnail = thumbnail
            self.thumbnailPath = thumbnailPath
            self.createdTs = getCurrentBlock().timestamp
            self.quantity = quantity
            self.price = price
            self.isActive = false
            self.artItem = artItem
            self.artName = artName
            self.artSeries = artSeries
            self.paymentRecipient = paymentRecipient
            self.royaltiesRecipient = royaltiesRecipient
            self.numSold = 0
        }
    }

    pub resource StoreAdmin {

        // all inventory items are added in the inactive state
        pub fun addInventoryItem(
            name: String,
            description: String,
            category: String,
            thumbnail: String,
            thumbnailPath: String?,
            quantity: UInt64,
            price: UFix64,
            artistName: String,
            seriesName: String,
            artName: String,
            paymentRecipient: Address,
            royaltiesRecipient: Address
        ) {
            pre {
                FLOASISItemsStore.inactiveInventory[FLOASISItemsStore.totalInventoryItemSupply] == nil : "An item with this id already exists in store inactiveInventory."
                FLOASISItemsStore.artLibrary[artistName] != nil : "Can't find an artist with that name in art library."
                FLOASISItemsStore.artLibrary[artistName]!.series[seriesName] != nil : "Can't find an series by that artist name in the art library."
                FLOASISItemsStore.artLibrary[artistName]!.series[seriesName]!.art[artName] != nil : "Can't find artwork by that name for given artist and series."
            }
            FLOASISItemsStore.inactiveInventory.insert(key: FLOASISItemsStore.totalInventoryItemSupply, InventoryItem(
                itemName: name,
                description: description,
                category: category,
                thumbnail: thumbnail,
                thumbnailPath: thumbnailPath,
                quantity: quantity,
                price: price,
                artItem: FLOASISItemsStore.artLibrary[artistName]!.series[seriesName]!.art[artName]!,
                artName: artName,
                artSeries: seriesName,
                paymentRecipient: paymentRecipient,
                royaltiesRecipient: royaltiesRecipient
            ))

            emit InventoryItemCreated(id: FLOASISItemsStore.totalInventoryItemSupply)

            FLOASISItemsStore.totalInventoryItemSupply = FLOASISItemsStore.totalInventoryItemSupply + 1

        }

        // NOTE: before modifying an inventory item (ex. adding inventory, changing a price),
        // you must first set it to be inactive, update the inventory and then done mark 
        // the inventory item active again.
        pub fun addInventory(id: UInt64, quantityAdd: UInt64) {
            pre {
                FLOASISItemsStore.inactiveInventory[id] != nil : "Cannot find inactive inventory item."
            }
            FLOASISItemsStore.inactiveInventory[id]!.addInventory(quantityAdd)
        }

        pub fun removeInventory(id: UInt64, quantityRemove: UInt64) {
            pre {
                FLOASISItemsStore.inactiveInventory[id] != nil : "Cannot find inactive inventory item."
                FLOASISItemsStore.inactiveInventory[id]!.quantity >= quantityRemove : "Quantity to remove cannot be greater than current quantity."
            }
            FLOASISItemsStore.inactiveInventory[id]!.removeInventory(quantityRemove)
        }

        pub fun changePrice(id: UInt64, newPrice: UFix64) {
            pre {
                FLOASISItemsStore.inactiveInventory[id] != nil : "Cannot find inactive inventory item."
                newPrice >= UFix64(0.0) : "New price must be higher than 0.0"
            }
            FLOASISItemsStore.inactiveInventory[id]!.changePrice(newPrice)
        }

        pub fun changeDescription(id: UInt64, newDescription: String) {
            pre {
                FLOASISItemsStore.inactiveInventory[id] != nil : "Cannot find inactive inventory item."
            }
            FLOASISItemsStore.inactiveInventory[id]!.changeDescription(newDescription)
        }

        pub fun changeThumbnail(id: UInt64, newThumbnail: String) {
            pre {
                FLOASISItemsStore.inactiveInventory[id] != nil : "Cannot find inactive inventory item."
            }
            FLOASISItemsStore.inactiveInventory[id]!.changeThumbnail(newThumbnail)
        }

        pub fun setInventoryItemActive(id: UInt64) {
            pre {
                FLOASISItemsStore.inactiveInventory[id] != nil : "Cannot find inactive inventory item."
            }
            FLOASISItemsStore.inactiveInventory[id]!.setInventoryItemActive()

            let inventoryItem = FLOASISItemsStore.inactiveInventory.remove(key: id)!

            FLOASISItemsStore.activeInventory.insert(key: id, inventoryItem)
        }

        pub fun setInventoryItemInactive(id: UInt64) {
            pre {
                FLOASISItemsStore.activeInventory[id] != nil : "Cannot find active inventory item."
            }
            FLOASISItemsStore.activeInventory[id]!.setInventoryItemInactive()

            let inventoryItem = FLOASISItemsStore.activeInventory.remove(key: id)!

            FLOASISItemsStore.inactiveInventory.insert(key: id, inventoryItem)

        }

        pub fun addArtist(artistName: String, artistDetails: FLOASISPrimitives.Artist) {
            pre {
                FLOASISItemsStore.artLibrary[artistName] == nil: "Artist already exists in the art library"
            }
            FLOASISItemsStore.artLibrary.insert(key: artistName, artistDetails)
            emit ArtistAdded(artistName: artistName, address: artistDetails.address)
        }

        pub fun removeArtist(artistName: String) {
            pre {
                FLOASISItemsStore.artLibrary[artistName] != nil: "Artist not found in the art library"
            }
            let address = FLOASISItemsStore.artLibrary[artistName]!.address
            FLOASISItemsStore.artLibrary.remove(key: artistName)
            emit ArtistRemoved(artistName: artistName, address: address)
        }

        pub fun addSeries(artistName: String, seriesName: String) {
            pre {
                FLOASISItemsStore.artLibrary[artistName] != nil: "Artist not found in the art library"
            }
            FLOASISItemsStore.artLibrary[artistName]!.addSeries(seriesName: seriesName)
            emit SeriesAdded(artistName: artistName, seriesName: seriesName)
        }

        pub fun removeSeries(artistName: String, seriesName: String) {
            pre {
                FLOASISItemsStore.artLibrary[artistName] != nil: "Artist not found in the art library"
                FLOASISItemsStore.artLibrary[artistName]!.series[seriesName] != nil: "Series not found"
            }
            FLOASISItemsStore.artLibrary[artistName]!.removeSeries(seriesName: seriesName)
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
                FLOASISItemsStore.artLibrary[artistName] != nil: "Artist not found in the art library"
                FLOASISItemsStore.artLibrary[artistName]!.series[seriesName] != nil: "Series not found in the art library"
                FLOASISItemsStore.artLibrary[artistName]!.series[seriesName]!.art[artName] == nil : "An artwork for this series with the same name already exists"
                FLOASISNFT.getPlanetDetails(planetName) != nil : "Cannot find a FLOASIS planet by that name."
            }
            FLOASISItemsStore.artLibrary[artistName]!.series[seriesName]!.addArt(artName: artName, planet: FLOASISNFT.getPlanetDetails(planetName)!, base: baseArt, card: cardArt, artDescription: artDescription, artThumbnail: artThumbnail, artThumbnailPath: artThumbnailPath)
            emit ArtAddedToSeries(artistName: artistName, seriesName: seriesName, artName: artName)
        }

        pub fun removeArt(artistName: String, seriesName: String, artName: String) {
            pre {
                FLOASISItemsStore.artLibrary[artistName] != nil: "Artist not found in the art library"
                FLOASISItemsStore.artLibrary[artistName]!.series[seriesName] != nil: "Series not found in the art library"
                FLOASISItemsStore.artLibrary[artistName]!.series[seriesName]!.art[artName] != nil : "Artwork for this series not found"
            }
            FLOASISItemsStore.artLibrary[artistName]!.series[seriesName]!.removeArt(artName: artName)
            emit ArtRemovedFromSeries(artistName: artistName, seriesName: seriesName, artName: artName)
        }
    }

    pub fun getActiveIntentoryKeys(): [UInt64] {
        return self.activeInventory.keys
    }

    pub fun getAllActiveInventory(): {UInt64: InventoryItem} {
        return FLOASISItemsStore.activeInventory
    }

    pub fun getActiveInventoryItem(_ id: UInt64): InventoryItem? {
        return FLOASISItemsStore.activeInventory[id]
    }

    pub fun getInactiveIntentoryKeys(): [UInt64] {
        return self.inactiveInventory.keys
    }

    pub fun getAllInactiveInventory(): {UInt64: InventoryItem} {
        return FLOASISItemsStore.inactiveInventory
    }

    pub fun getInactiveInventoryItem(_ id: UInt64): InventoryItem? {
        return FLOASISItemsStore.inactiveInventory[id]
    }

    pub fun getArtistSeriesArt(artistName: String, seriesName: String, artName: String): FLOASISPrimitives.Art? {
        pre {
            FLOASISItemsStore.artLibrary[artistName] != nil : "Cannot find an artist by that name in the art library"
            FLOASISItemsStore.artLibrary[artistName]!.series[seriesName] != nil : "Cannot find an a series with that name for the given artist"
            FLOASISItemsStore.artLibrary[artistName]!.series[seriesName]!.art[artName] != nil : "Cannot find an a an artwork with that name"
        }

        return FLOASISItemsStore.artLibrary[artistName]!.series[seriesName]!.art[artName]
    }

    init() {

        self.totalInventoryItemSupply = 0

        self.FLOASISItemsStoreAdminPath = /storage/floasisOfficialfloasisItemsStoreAdmin

        let storeAdmin <- create StoreAdmin()

        self.account.save(<-storeAdmin, to: self.FLOASISItemsStoreAdminPath)

        self.activeInventory = {}
        self.inactiveInventory = {}
        self.artLibrary = {}

        emit ContractInitialized()
    }
}
