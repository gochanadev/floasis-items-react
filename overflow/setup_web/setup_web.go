package main

import (
	"floasis-items/flow/overflow/art_prep"
	"floasis-items/flow/overflow/convert"
	"floasis-items/flow/overflow/demo_floasis_nfts_prep"
	"floasis-items/flow/overflow/inventory_prep"

	. "github.com/bjartek/overflow"
)

func main() {

	flow_network := "emulator"
	// flow_network := "embedded" // this will NOT set up the emulator

	o := Overflow(WithNetwork(flow_network))

	// convert demo floasis NFT PNGs to SVGs (if not already converted)
	convert.Convert(
		"./art/demo_floasis_nfts/png",
		"./art/demo_floasis_nfts/svg",
	)

	// convert accessories NFT PNGs to SVGs (if not already converted)
	convert.Convert(
		"./art/accessories/png",
		"./art/accessories/svg",
	)

	// initialize service account with FLOASISNFT Collection resource
	o.Tx(
		"FLOASISNFT/initialize_account",
		WithSigner("account")).
		Print()

	// service account mints demo FLOASIS NFTs
	art_names, planet_names, base_artwork, card_artwork, art_descriptions, art_thumbnails := demo_floasis_nfts_prep.PrepareArt("./art/demo_floasis_nfts", "art_list.csv", flow_network)
	o.Tx(
		"FLOASISNFT/batch_mint_demo_floasis_nfts",
		WithArg("recipient", "account"),
		WithArg("artNames", art_names),
		WithArg("planetNames", planet_names),
		WithArg("baseArtwork", base_artwork),
		WithArg("cardArtwork", card_artwork),
		WithArg("artDescriptions", art_descriptions),
		WithArg("artThumbnails", art_thumbnails),
		WithSigner("account")).
		Print()

	artist_name := "mats"
	series_name := "series1"

	// initialize service account
	o.Tx(
		"FLOASISItems/initialize_account",
		WithSigner("account")).
		Print()

	// service account adds artist to art libarary in FLOASISItemsStore
	o.Tx(
		"FLOASISItemsStore/add_artist_to_art_library",
		WithArg("artistName", artist_name),
		WithArg("artistAddress", "account"),
		WithSigner("account")).
		Print()

	// service account adds series to art libarary in FLOASISItemsStore
	o.Tx(
		"FLOASISItemsStore/add_series",
		WithArg("artistName", artist_name),
		WithArg("seriesName", series_name),
		WithSigner("account")).
		Print()

	// upload on-chain artwork to art library
	// TODO: investigate why helper script here requires no trailing slash after dir name and the demo floasis nfts script does
	artNamesItems, planetNamesItems, baseArtworkItems, cardArtworkItems, artDescriptionsItems, artThumbnailsItems := art_prep.PrepareArt("./art/accessories", "art_list.csv", flow_network)
	o.Tx(
		"FLOASISItemsStore/batch_add_art_to_artLibrary",
		WithArg("artistName", artist_name),
		WithArg("seriesName", series_name),
		WithArg("artNames", artNamesItems),
		WithArg("planetNames", planetNamesItems),
		WithArg("baseArtwork", baseArtworkItems),
		WithArg("cardArtwork", cardArtworkItems),
		WithArg("artDescriptions", artDescriptionsItems),
		WithArg("artThumbnails", artThumbnailsItems),
		WithSigner("account")).
		Print()

	// create inventory items
	item_names, item_descriptions, item_thumbnails, item_quantities, item_prices, item_artist_names, item_series_names, item_art_names, item_art_categories := inventory_prep.PrepareInventory("./art/accessories/store_inventory_list.csv", "./accessories/", flow_network)
	o.Tx(
		"FLOASISItemsStore/batch_add_inventory",
		WithArg("itemNames", item_names),
		WithArg("itemDescriptions", item_descriptions),
		WithArg("itemCategories", item_art_categories),
		WithArg("itemThumbnails", item_thumbnails),
		WithArg("itemQuantities", item_quantities),
		WithArg("itemPrices", item_prices),
		WithArg("itemArtistNames", item_artist_names),
		WithArg("itemSeriesNames", item_series_names),
		WithArg("itemArtNames", item_art_names),
		WithArg("allPaymentsRecipient", "account"),
		WithArg("allRoyaltiesRecipient", "account"),
		WithSigner("account")).
		Print()

	inventory_item_ids := []uint64{0, 1, 2}

	// batch mark inventory items active
	o.Tx(
		"FLOASISItemsStore/batch_set_inventory_active",
		WithArg("inventoryItemIDs", inventory_item_ids),
		WithSigner("account")).
		Print()

	// TODO: add more NFT available for purchase for given planet
	batch_buy_inventory_item_ids := []uint64{0}

	// service account batch purchases items NFTs
	o.Tx(
		"FLOASISItems/batch_buy_nfts",
		WithArg("inventoryItemIDs", batch_buy_inventory_item_ids),
		WithArg("floasisNFTID", "0"),
		WithSigner("account")).
		Print()

	demo_nft_id := 0
	demo_type_ids := []string{"A.f8d6e0586b0a20c7.FLOASISNFT.NFT", "A.f8d6e0586b0a20c7.FLOASISItems.NFT"}
	demo_composite_group_name := "A.f8d6e0586b0a20c7.FLOASISItems.NFT"
	demo_ids := []uint64{1, 0}
	demo_composite_name := "Demo Composite 1"

	// add multi layer composite
	o.Tx(
		"FLOASISNFT/composite_multiple_layers",
		WithArg("floasisNFTID", demo_nft_id),
		WithArg("typeIDs", demo_type_ids),
		WithArg("ids", demo_ids),
		WithArg("compositeGroupName", demo_composite_group_name),
		WithArg("compositeName", demo_composite_name),
		WithSigner("account")).
		Print()

	// remove composite
	o.Tx(
		"FLOASISNFT/remove_composite",
		WithArg("nftID", demo_nft_id),
		WithArg("compositeGroupName", demo_composite_group_name),
		WithArg("compositeName", demo_composite_name),
		WithSigner("account")).
		Print()

	// re-add multi layer composite
	o.Tx(
		"FLOASISNFT/composite_multiple_layers",
		WithArg("floasisNFTID", demo_nft_id),
		WithArg("typeIDs", demo_type_ids),
		WithArg("ids", demo_ids),
		WithArg("compositeGroupName", demo_composite_group_name),
		WithArg("compositeName", demo_composite_name),
		WithSigner("account")).
		Print()
	// o.Script(
	// 	"FLOASISNFT/get_composites_group_names_list",
	// 	WithArg("address", "account"),
	// 	WithArg("nftID", demo_nft_id)).
	// 	Print()
	// o.Script(
	// 	"FLOASISNFT/get_composites_names_by_group_name",
	// 	WithArg("address", "account"),
	// 	WithArg("compositeGroupName", demo_composite_group_name),
	// 	WithArg("nftID", demo_nft_id)).
	// 	Print()
	// o.Script(
	// 	"FLOASISNFT/get_composite_by_name",
	// 	WithArg("address", "account"),
	// 	WithArg("compositeGroupName", demo_composite_group_name),
	// 	WithArg("nftID", demo_nft_id),
	// 	WithArg("compositeName", demo_composite_name)).
	// 	Print()
	// o.Script(
	// 	"FLOASISNFT/get_nft_composites",
	// 	WithArg("address", "account"),
	// 	WithArg("nftID", demo_nft_id)).
	// 	Print()

}
