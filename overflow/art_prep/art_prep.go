package art_prep

import (
	"context"
	"floasis-items/flow/overflow/helpers"
	"floasis-items/flow/overflow/svg_prep"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/onflow/cadence"
	"github.com/web3-storage/go-w3s-client"
)

func PrepareArt(
	artRepoPath string,
	artIndexFileName string,
	flowNetwork string,
) (
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
	cadence.Array,
) {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	web3_storage_api_key := os.Getenv("WEB3_STORAGE_API_KEY")
	placeholder_artwork_cid := os.Getenv("PLACEHOLDER_FLOASIS_ITEMS_ARTWORK_CID")
	c, _ := w3s.NewClient(w3s.WithToken(web3_storage_api_key))

	csvPath := fmt.Sprintf("%s/%s", artRepoPath, artIndexFileName)
	csvData, err := helpers.ReadCsvFile(csvPath)
	if err != nil {
		panic(err)
	}

	art_names_cadence := []cadence.Value{}
	planet_names_cadence := []cadence.Value{}
	base_artwork_cadence := []cadence.Value{}
	card_artwork_cadence := []cadence.Value{}
	art_descriptions_cadence := []cadence.Value{}
	art_thumbnails_cadence := []cadence.Value{}

	for _, line := range csvData {
		art_name := line[0]
		planet_name := line[1]
		base_art_file_name := line[2]

		card_art_file_name := line[3]
		art_description := line[4]
		art_thumbnail_file_name := line[5]

		base_art_file_path := fmt.Sprintf("%s/svg/%s.svg", artRepoPath, base_art_file_name)

		base_art_file_data, base_art_file_data_err := os.ReadFile(base_art_file_path)
		if base_art_file_data_err != nil {
			log.Fatal((base_art_file_data_err))
		}

		card_art_file_path := fmt.Sprintf("%s/svg/%s.svg", artRepoPath, card_art_file_name)
		card_art_file_data, card_art_file_data_err := os.ReadFile(card_art_file_path)
		if card_art_file_data_err != nil {
			log.Fatal((card_art_file_data_err))
		}

		art_names_cadence = append(art_names_cadence, cadence.String(art_name))
		planet_names_cadence = append(planet_names_cadence, cadence.String(planet_name))

		base_svg_cadence_analog := svg_prep.GetSvgStruct(string(base_art_file_data), flowNetwork)
		base_artwork_cadence = append(base_artwork_cadence, base_svg_cadence_analog)

		card_svg_cadence_analog := svg_prep.GetSvgStruct(string(card_art_file_data), flowNetwork)
		card_artwork_cadence = append(card_artwork_cadence, card_svg_cadence_analog)

		art_descriptions_cadence = append(art_descriptions_cadence, cadence.String(art_description))

		art_thumbnail_file_path := fmt.Sprintf("%s/thumbnails/%s.png", artRepoPath, art_thumbnail_file_name)

		if flowNetwork == "emulator" || flowNetwork == "embedded" {
			art_thumbnails_cadence = append(art_thumbnails_cadence, cadence.String(placeholder_artwork_cid))
			fmt.Println("Placeholder IPFS CID created: bafybeigy7cpgakfxdabjb2gxcri3fdojeyvalwq5estarwwjy6qvolzgeu")
		} else {
			f, _ := os.Open(art_thumbnail_file_path)
			cid, _ := c.Put(context.Background(), f)
			fmt.Printf("Pinned to IPFS: https://%v.ipfs.w3s.link\n", cid)

			art_thumbnails_cadence = append(art_thumbnails_cadence, cadence.String(cid.String()))
		}

	}

	art_names := cadence.NewArray(art_names_cadence)
	planet_names := cadence.NewArray(planet_names_cadence)
	base_artwork := cadence.NewArray(base_artwork_cadence)
	card_artwork := cadence.NewArray(card_artwork_cadence)
	art_descriptions := cadence.NewArray(art_descriptions_cadence)
	art_thumbnails := cadence.NewArray(art_thumbnails_cadence)

	return art_names, planet_names, base_artwork, card_artwork, art_descriptions, art_thumbnails

}
