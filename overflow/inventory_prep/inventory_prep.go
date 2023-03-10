package inventory_prep

import (
	"context"
	"floasis-items/flow/overflow/helpers"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/onflow/cadence"
	"github.com/web3-storage/go-w3s-client"
)

func PrepareInventory(
	inventoryCSVPath string,
	artRepoPath string,
	flowNetwork string) (
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array) {

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error in inventory_prep.go when loading .env file")
	}
	WEB3_STORAGE_IPFS_API_KEY := os.Getenv("WEB3_STORAGE_IPFS_API_KEY")
	c, _ := w3s.NewClient(w3s.WithToken(WEB3_STORAGE_IPFS_API_KEY))

	csvData, err := helpers.ReadCsvFile(inventoryCSVPath)
	if err != nil {
		panic(err)
	}

	item_names_cadence := []cadence.Value{}
	item_descriptions_cadence := []cadence.Value{}
	item_thumbnails_cadence := []cadence.Value{}
	item_thumbnail_paths_cadence := []cadence.Value{}
	item_quantities_cadence := []cadence.Value{}
	item_prices_cadence := []cadence.Value{}
	item_artist_names_cadence := []cadence.Value{}
	item_series_names_cadence := []cadence.Value{}
	item_art_names_cadence := []cadence.Value{}
	item_art_categories_cadence := []cadence.Value{}

	for _, line := range csvData {
		item_name := line[0]
		item_description := line[1]
		item_thumbnail_file_name := line[2]
		item_quantity := line[3]
		item_quantity_parsed, err := strconv.ParseUint(item_quantity, 10, 64)
		if err != nil {
			panic(err)
		}
		item_price := line[4]
		item_price_parsed, err := cadence.ParseUFix64(item_price)
		if err != nil {
			panic(err)
		}
		item_artist_name := line[5]
		item_series_name := line[6]
		item_art_name := line[7]
		item_art_category := line[8]

		item_names_cadence = append(item_names_cadence, cadence.String(item_name))
		item_descriptions_cadence = append(item_descriptions_cadence, cadence.String(item_description))
		item_quantities_cadence = append(item_quantities_cadence, cadence.UInt64(uint64(item_quantity_parsed)))
		item_prices_cadence = append(item_prices_cadence, cadence.UFix64(item_price_parsed))
		item_artist_names_cadence = append(item_artist_names_cadence, cadence.String(item_artist_name))
		item_series_names_cadence = append(item_series_names_cadence, cadence.String(item_series_name))
		item_art_names_cadence = append(item_art_names_cadence, cadence.String(item_art_name))
		item_art_categories_cadence = append(item_art_categories_cadence, cadence.String(item_art_category))

		item_thumbnail_file_path := fmt.Sprintf("%s/png/%s.png", artRepoPath, item_thumbnail_file_name)
		item_thumbnail_file_name_and_type := fmt.Sprintf("%s.png", item_thumbnail_file_name)

		f, _ := os.Open(item_thumbnail_file_path)
		cid, _ := c.Put(context.Background(), f)

		item_thumbnails_cadence = append(item_thumbnails_cadence, cadence.String(cid.String()))
		item_thumbnail_paths_cadence = append(item_thumbnail_paths_cadence, cadence.String(item_thumbnail_file_name_and_type))

		fmt.Printf("Pinned to IPFS: https://%v.ipfs.w3s.link/%v\n", cid, item_thumbnail_file_name_and_type)

	}

	item_names := cadence.NewArray(item_names_cadence)
	item_descriptions := cadence.NewArray(item_descriptions_cadence)
	item_thumbnails := cadence.NewArray(item_thumbnails_cadence)
	item_thumbnail_paths := cadence.NewArray(item_thumbnail_paths_cadence)
	item_quantities := cadence.NewArray(item_quantities_cadence)
	item_prices := cadence.NewArray(item_prices_cadence)
	item_artist_names := cadence.NewArray(item_artist_names_cadence)
	item_series_names := cadence.NewArray(item_series_names_cadence)
	item_art_names := cadence.NewArray(item_art_names_cadence)
	item_art_categories := cadence.NewArray(item_art_categories_cadence)

	return item_names, item_descriptions, item_thumbnails, item_thumbnail_paths, item_quantities, item_prices, item_artist_names, item_series_names, item_art_names, item_art_categories

}
