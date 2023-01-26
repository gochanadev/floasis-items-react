import FLOASISNFT from "../../contracts/FLOASISNFT.cdc"

transaction(artistName: String, seriesName: String) {
   
    execute {

        FLOASISNFT.addSeries(artistName: artistName, seriesName: seriesName)

    }
}
