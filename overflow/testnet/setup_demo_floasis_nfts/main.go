package main

import (
	"floasis-items/flow/overflow/demo_floasis_nfts_prep"

	o "github.com/bjartek/overflow"
)

func main() {

	flow_network := "testnet"
	c := o.Overflow(o.WithNetwork(flow_network))

	// user1 self-initializes their account with a FLAOSISNFT collection resource (demo)
	c.Tx(
		"FLOASISNFT/initialize_account",
		o.WithSigner("user1")).
		Print()

	// service account mints demo FLOASIS NFTs to user1
	art_names, planet_names, base_artwork, card_artwork, art_descriptions, art_thumbnails, art_thumbnail_paths := demo_floasis_nfts_prep.PrepareArt("./art/demo_floasis_nfts", "art_list.csv", flow_network)
	c.Tx(
		"FLOASISNFT/batch_mint_demo_floasis_nfts",
		o.WithArg("recipient", "user1"),
		o.WithArg("artNames", art_names),
		o.WithArg("planetNames", planet_names),
		o.WithArg("baseArtwork", base_artwork),
		o.WithArg("cardArtwork", card_artwork),
		o.WithArg("artDescriptions", art_descriptions),
		o.WithArg("artThumbnails", art_thumbnails),
		o.WithArg("artThumbnailPaths", art_thumbnail_paths),
		o.WithSigner("account")).
		Print()

}
