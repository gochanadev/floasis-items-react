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
	cadence.Array,
) {

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error in art_pre.go when loading .env file")
	}
	WEB3_STORAGE_IPFS_API_KEY := os.Getenv("WEB3_STORAGE_IPFS_API_KEY")
	c, _ := w3s.NewClient(w3s.WithToken(WEB3_STORAGE_IPFS_API_KEY))

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
	art_thumbnail_paths_cadence := []cadence.Value{}

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

		art_thumbnail_file_path := fmt.Sprintf("%s/png/%s.png", artRepoPath, art_thumbnail_file_name)
		art_thumbnail_file_name_and_type := fmt.Sprintf("%s.png", art_thumbnail_file_name)

		f, _ := os.Open(art_thumbnail_file_path)
		cid, _ := c.Put(context.Background(), f)

		art_thumbnails_cadence = append(art_thumbnails_cadence, cadence.String(cid.String()))
		art_thumbnail_paths_cadence = append(art_thumbnail_paths_cadence, cadence.String(art_thumbnail_file_name_and_type))

		fmt.Printf("Pinned to IPFS: https://%v.ipfs.w3s.link/%v\n", cid, art_thumbnail_file_name_and_type)

	}

	art_names := cadence.NewArray(art_names_cadence)
	planet_names := cadence.NewArray(planet_names_cadence)
	base_artwork := cadence.NewArray(base_artwork_cadence)
	card_artwork := cadence.NewArray(card_artwork_cadence)
	art_descriptions := cadence.NewArray(art_descriptions_cadence)
	art_thumbnails := cadence.NewArray(art_thumbnails_cadence)
	art_thumbnail_paths := cadence.NewArray(art_thumbnail_paths_cadence)

	return art_names, planet_names, base_artwork, card_artwork, art_descriptions, art_thumbnails, art_thumbnail_paths

}
