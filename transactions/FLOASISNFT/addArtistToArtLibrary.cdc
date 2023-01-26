import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"
import FLOASISPrimitives from "../../contracts/FLOASISPrimitives.cdc"

transaction(artistName: String, address: Address) {

    let artistName: String
    let artistDetails: FLOASISPrimitives.Artist

    prepare(signer: AuthAccount) {

        // set the artist name
        self.artistName = artistName

        // create the artist details struct
        self.artistDetails = FLOASISPrimitives.Artist(address: address)

    }

    execute {

        FLOASISNFT.addArtist(artistName: artistName, artistDetails: self.artistDetails)

    }
}
