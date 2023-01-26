package main

import (
	// "floasis-items/flow/overflow/art_prep"
	"floasis-items/flow/overflow/art_prep"
	"floasis-items/flow/overflow/convert"
	// "floasis-items/flow/overflow/demo_floasis_nfts_prep"
	// "floasis-items/flow/overflow/inventory_prep"

	o "github.com/bjartek/overflow"
)

func main() {

	flow_network := "emulator"
	// flow_network := "embedded" // this will NOT set up the emulator

	c := o.Overflow(o.WithNetwork(flow_network))

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
	c.Tx(
		"FLOASISNFT/initialize_account",
		o.WithSigner("account")).
		Print()

	// add artist to library
	c.Tx(
		"FLOASISNFT/addArtistToArtLibrary",
		o.WithArg("artistName", "floasisDemoArtist"),
		o.WithArg("address", "account"),
		o.WithSigner("account")).
		Print()

	// create series for artist
	c.Tx(
		"FLOASISNFT/createSeries",
		o.WithArg("artistName", "floasisDemoArtist"),
		o.WithArg("seriesName", "floasisDemoSeries"),
		o.WithSigner("account")).
		Print()

	// upload on-chain artwork to art library
	art_names, planet_names, base_artwork, card_artwork, art_descriptions, art_thumbnails, art_thumbnail_paths := art_prep.PrepareArt("/Users/matthewchana/documents/floasis_monorepo/art", "art_list.csv", flow_network)
	// fmt.Println(art_names)
	// fmt.Println(planet_names)
	// fmt.Println(card_artwork)
	// fmt.Println(art_descriptions)
	// fmt.Println(art_thumbnails)
	// fmt.Println(art_thumbnail_paths)
	// fmt.Println(base_artwork)

	c.Tx(
		"FLOASISNFT/batch_add_art_to_art_library",
		o.WithArg("artistName", "mats1"),
		o.WithArg("seriesName", "series1"),
		o.WithArg("artNames", art_names),
		o.WithArg("planetNames", planet_names),
		o.WithArg("baseArtwork", base_artwork),
		o.WithArg("cardArtwork", card_artwork),
		o.WithArg("artDescriptions", art_descriptions),
		o.WithArg("artThumbnails", art_thumbnails),
		o.WithArg("artThumbnailPaths", art_thumbnail_paths),
		o.WithSigner("admin1")).
		Print()

	// // service account mints demo FLOASIS NFTs
	// art_names, planet_names, base_artwork, card_artwork, art_descriptions, art_thumbnails, art_thumbnail_paths := demo_floasis_nfts_prep.PrepareArt("./art/demo_floasis_nfts", "art_list.csv", flow_network)
	// c.Tx(
	// 	"FLOASISNFT/batch_mint_demo_floasis_nfts",
	// 	o.WithArg("recipient", "account"),
	// 	o.WithArg("artNames", art_names),
	// 	o.WithArg("planetNames", planet_names),
	// 	o.WithArg("baseArtwork", base_artwork),
	// 	o.WithArg("cardArtwork", card_artwork),
	// 	o.WithArg("artDescriptions", art_descriptions),
	// 	o.WithArg("artThumbnails", art_thumbnails),
	// 	o.WithArg("artThumbnailPaths", art_thumbnail_paths),
	// 	o.WithSigner("account")).
	// 	Print()

	// artist_name := "mats"
	// series_name := "accessoriesSeries1"

	// // initialize service account
	// c.Tx(
	// 	"FLOASISItems/initialize_account",
	// 	o.WithSigner("account")).
	// 	Print()

	// // service account adds artist to art libarary in FLOASISItemsStore
	// c.Tx(
	// 	"FLOASISItemsStore/add_artist_to_art_library",
	// 	o.WithArg("artistName", artist_name),
	// 	o.WithArg("artistAddress", "account"),
	// 	o.WithSigner("account")).
	// 	Print()

	// // service account adds series to art libarary in FLOASISItemsStore
	// c.Tx(
	// 	"FLOASISItemsStore/add_series",
	// 	o.WithArg("artistName", artist_name),
	// 	o.WithArg("seriesName", series_name),
	// 	o.WithSigner("account")).
	// 	Print()

	// // upload on-chain artwork to art library
	// artNamesItems, planetNamesItems, baseArtworkItems, cardArtworkItems, artDescriptionsItems, artThumbnailsItems, artThumbnailPathsItems := art_prep.PrepareArt("./art/accessories", "art_list.csv", flow_network)
	// c.Tx(
	// 	"FLOASISItemsStore/batch_add_art_to_artLibrary",
	// 	o.WithArg("artistName", artist_name),
	// 	o.WithArg("seriesName", series_name),
	// 	o.WithArg("artNames", artNamesItems),
	// 	o.WithArg("planetNames", planetNamesItems),
	// 	o.WithArg("baseArtwork", baseArtworkItems),
	// 	o.WithArg("cardArtwork", cardArtworkItems),
	// 	o.WithArg("artDescriptions", artDescriptionsItems),
	// 	o.WithArg("artThumbnails", artThumbnailsItems),
	// 	o.WithArg("artThumbnailPaths", artThumbnailPathsItems),
	// 	o.WithSigner("account")).
	// 	Print()

	// // create inventory items
	// item_names, item_descriptions, item_thumbnails, item_thumbnail_paths, item_quantities, item_prices, item_artist_names, item_series_names, item_art_names, item_art_categories := inventory_prep.PrepareInventory("./art/accessories/store_inventory_list.csv", "./art/accessories", flow_network)
	// c.Tx(
	// 	"FLOASISItemsStore/batch_add_inventory",
	// 	o.WithArg("itemNames", item_names),
	// 	o.WithArg("itemDescriptions", item_descriptions),
	// 	o.WithArg("itemCategories", item_art_categories),
	// 	o.WithArg("itemThumbnails", item_thumbnails),
	// 	o.WithArg("itemThumbnailPaths", item_thumbnail_paths),
	// 	o.WithArg("itemQuantities", item_quantities),
	// 	o.WithArg("itemPrices", item_prices),
	// 	o.WithArg("itemArtistNames", item_artist_names),
	// 	o.WithArg("itemSeriesNames", item_series_names),
	// 	o.WithArg("itemArtNames", item_art_names),
	// 	o.WithArg("allPaymentsRecipient", "account"),
	// 	o.WithArg("allRoyaltiesRecipient", "account"),
	// 	o.WithSigner("account")).
	// 	Print()

	// inventory_item_ids := []uint64{0, 1, 2}

	// // batch mark inventory items active
	// c.Tx(
	// 	"FLOASISItemsStore/batch_set_inventory_active",
	// 	o.WithArg("inventoryItemIDs", inventory_item_ids),
	// 	o.WithSigner("account")).
	// 	Print()

	// // TODO: add more NFT available for purchase for given planet
	// batch_buy_inventory_item_ids := []uint64{0}

	// // service account batch purchases items NFTs
	// c.Tx(
	// 	"FLOASISItems/batch_buy_nfts",
	// 	o.WithArg("inventoryItemIDs", batch_buy_inventory_item_ids),
	// 	o.WithArg("floasisNFTID", "0"),
	// 	o.WithSigner("account")).
	// 	Print()

	// demo_nft_id := 0
	// demo_type_ids := []string{"A.f8d6e0586b0a20c7.FLOASISNFT.NFT", "A.f8d6e0586b0a20c7.FLOASISItems.NFT"}
	// demo_composite_group_name := "A.f8d6e0586b0a20c7.FLOASISItems.NFT"
	// demo_ids := []uint64{1, 0}
	// demo_composite_name := "Demo Composite 1"

	// // add multi layer composite
	// c.Tx(
	// 	"FLOASISNFT/composite_multiple_layers",
	// 	o.WithArg("floasisNFTID", demo_nft_id),
	// 	o.WithArg("typeIDs", demo_type_ids),
	// 	o.WithArg("ids", demo_ids),
	// 	o.WithArg("compositeGroupName", demo_composite_group_name),
	// 	o.WithArg("compositeName", demo_composite_name),
	// 	o.WithSigner("account")).
	// 	Print()

	// // remove composite
	// c.Tx(
	// 	"FLOASISNFT/remove_composite",
	// 	o.WithArg("nftID", demo_nft_id),
	// 	o.WithArg("compositeGroupName", demo_composite_group_name),
	// 	o.WithArg("compositeName", demo_composite_name),
	// 	o.WithSigner("account")).
	// 	Print()

	// // re-add multi layer composite
	// c.Tx(
	// 	"FLOASISNFT/composite_multiple_layers",
	// 	o.WithArg("floasisNFTID", demo_nft_id),
	// 	o.WithArg("typeIDs", demo_type_ids),
	// 	o.WithArg("ids", demo_ids),
	// 	o.WithArg("compositeGroupName", demo_composite_group_name),
	// 	o.WithArg("compositeName", demo_composite_name),
	// 	o.WithSigner("account")).
	// 	Print()
	// // c.Script(
	// // 	"FLOASISNFT/get_composites_group_names_list",
	// // 	o.WithArg("address", "account"),
	// // 	o.WithArg("nftID", demo_nft_id)).
	// // 	Print()
	// // c.Script(
	// // 	"FLOASISNFT/get_composites_names_by_group_name",
	// // 	o.WithArg("address", "account"),
	// // 	o.WithArg("compositeGroupName", demo_composite_group_name),
	// // 	o.WithArg("nftID", demo_nft_id)).
	// // 	Print()
	// // c.Script(
	// // 	"FLOASISNFT/get_composite_by_name",
	// // 	o.WithArg("address", "account"),
	// // 	o.WithArg("compositeGroupName", demo_composite_group_name),
	// // 	o.WithArg("nftID", demo_nft_id),
	// // 	o.WithArg("compositeName", demo_composite_name)).
	// // 	Print()
	// // c.Script(
	// // 	"FLOASISNFT/get_nft_composites",
	// // 	o.WithArg("address", "account"),
	// // 	o.WithArg("nftID", demo_nft_id)).
	// // 	Print()

}
