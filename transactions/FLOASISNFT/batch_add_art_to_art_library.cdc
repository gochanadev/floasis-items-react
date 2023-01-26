import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"
import IaNFTAnalogs from "../../contracts/IaNFTAnalogs.cdc"

transaction(artistName: String, seriesName: String, artNames: [String], planetNames: [String], baseArtwork: [IaNFTAnalogs.Svg], cardArtwork: [IaNFTAnalogs.Svg], artDescriptions: [String], artThumbnails: [String], artThumbnailPaths: [String]) {

    prepare(signer: AuthAccount) {

        let floasisAdminTokenVault = signer.borrow<&FLOASISAdminToken.TokenVault>(from: FLOASISAdminToken.TokenVaultStoragePath)!
        self.floasisAdminTokenRef = floasisAdminTokenVault.borrowAdminToken()
        assert(self.floasisAdminTokenRef != nil, message: "Missing admin token")

        // check to make sure all planets exist
        for planet in planetNames {
            let planetDetails = FLOASISNFT.getPlanetDetails(planet)
            if (planetDetails == nil) {
                panic("The planet for an artwork item has not been discovered.")
            }
        }
    }

    execute {

        var loopIndex: UInt64 = 0

        for artName in artNames {

            // add art to on-chain art library
            FLOASISNFT.addArt(
                artistName: artistName, 
                seriesName: seriesName, 
                artName: artName, 
                planetName: planetNames[loopIndex],
                baseArt: baseArtwork[loopIndex], 
                cardArt: cardArtwork[loopIndex], 
                artDescription: artDescriptions[loopIndex],
                artThumbnail: artThumbnails[loopIndex],
                artThumbnailPath: artThumbnailPaths[loopIndex],
            )

            // increment the loop reference index
            loopIndex = loopIndex + 1

        }
    }
}
 