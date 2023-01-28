/*
These are commonly used structs for use in in FLOASISNFT, FLOASISItems, or any
other smart contracts that want to use them.

Do not deploy this contract to testnet or mainnet, instead point to the one
deployed by the FOASIS project.
*/

import IaNFTAnalogs from "./IaNFTAnalogs.cdc"

pub contract FLOASISPrimitives {

    pub event ContractInitialized()
    pub event AristAddressChanged(oldAddress: Address, newAddress: Address)

    // represents a planet in the FOASIS universe
    pub struct Planet {
        pub let name: String
        pub let discoveredTs: UFix64

        init (
            name: String,
            discoveredTs: UFix64
        ) {
            self.name = name
            self.discoveredTs = discoveredTs
        }
    }

    // represents an on-chain artwork using IaNFTAnalogs
    pub struct Art {
        pub let planet: Planet
        pub let base: IaNFTAnalogs.Svg
        pub let card: IaNFTAnalogs.Svg
        pub let description: String
        pub let thumbnail: String // should be an IPFS CID
        pub let thumbnailPath: String?

        init (
            planet: Planet,
            base: IaNFTAnalogs.Svg,
            card: IaNFTAnalogs.Svg,
            description: String,
            thumbnail: String,
            thumbnailPath: String?
        ) {
            self.planet = planet
            self.base = base
            self.card = card
            self.description = description
            self.thumbnail = thumbnail
            self.thumbnailPath = thumbnailPath
        }
    }

    // a series of art by an artist, for example 'Summer 2029 Collection by hichana'
    pub struct Series {
        pub let art: {String: Art}

        // string members for thumbnail and thumbnailPath should either be an
        // IPFS CID and path, respectively, or make artThumbnailPath nil and
        // give artThumbnail an HTTP URL string
        pub fun addArt(artName: String, planet: Planet, base: IaNFTAnalogs.Svg, card: IaNFTAnalogs.Svg, artDescription: String, artThumbnail: String, artThumbnailPath: String?) {
            pre {
                self.art[artName] == nil : "Art already exists"
            }
            self.art.insert(key: artName, Art(planet: planet, base: base, card: card, description: artDescription, thumbnail: artThumbnail, thumbnailPath: artThumbnailPath))
        }

        pub fun removeArt(artName: String) {
            pre {
                self.art[artName] != nil : "Art does not exists"
            }
            self.art.remove(key: artName)
        }

        init () {
            self.art = {}
        }
    }
 
    // an artist associated with a Flow address
    pub struct Artist {
        pub var address: Address
        pub let series: {String: Series}

        pub fun setAddress(artistName: String, address: Address) {
            let oldAddress = self.address
            self.address = address
            emit AristAddressChanged(oldAddress: oldAddress, newAddress: self.address)
        }

        pub fun addSeries(seriesName: String) {
            pre {
                self.series[seriesName] == nil : "Series already exists"
            }
            self.series.insert(key: seriesName, Series())
        }

        pub fun removeSeries(seriesName: String) {
            pre {
                self.series[seriesName] != nil : "Series does not exist"
            }
            self.series.remove(key: seriesName)
        }

        init (address: Address) {
            self.address = address
            self.series = {}
        }
    }

    // because you can take iaNFTs anywhere you want, a 'CompositeGroup' can
    // represent projects on Flow that choose to opersate on the artwork from
    // your iaNFT. Named composites can be saved in logical groups so they can
    // be more easily referenced in various Flow projects when saving or
    // deleting for example.
    pub struct CompositeGroup {
        pub let group: {String: IaNFTAnalogs.Svg}

        pub fun addComposite(compositeName: String, composite: IaNFTAnalogs.Svg) {
            pre {
                self.group[compositeName] == nil : "A composite with this name already exists"
            }
            self.group.insert(key: compositeName, composite)
        }

        pub fun removeComposite(compositeName: String) {
            pre {
                self.group[compositeName] != nil : "Cannot find composite with that name"
            }
            self.group.remove(key: compositeName)
        }

        init () {
            self.group = {}
        }
    }

    init() {
        emit ContractInitialized()
    }
}
