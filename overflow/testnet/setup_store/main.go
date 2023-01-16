package main

import (
	"floasis-items/flow/overflow/art_prep"
	"floasis-items/flow/overflow/inventory_prep"

	o "github.com/bjartek/overflow"
)

func main() {

	flow_network := "testnet"
	c := o.Overflow(o.WithNetwork(flow_network))

	artist_name := "mats"
	series_name := "accessoriesSeries1"

	// service account adds artist to art libarary in FLOASISItemsStore
	c.Tx(
		"FLOASISItemsStore/add_artist_to_art_library",
		o.WithArg("artistName", artist_name),
		o.WithArg("artistAddress", "account"),
		o.WithSigner("account")).
		Print()

	// service account adds series to art libarary in FLOASISItemsStore
	c.Tx(
		"FLOASISItemsStore/add_series",
		o.WithArg("artistName", artist_name),
		o.WithArg("seriesName", series_name),
		o.WithSigner("account")).
		Print()

	// upload on-chain artwork to art library
	artNamesItems, planetNamesItems, baseArtworkItems, cardArtworkItems, artDescriptionsItems, artThumbnailsItems := art_prep.PrepareArt("./art/accessories", "art_list.csv", flow_network)
	c.Tx(
		"FLOASISItemsStore/batch_add_art_to_artLibrary",
		o.WithArg("artistName", artist_name),
		o.WithArg("seriesName", series_name),
		o.WithArg("artNames", artNamesItems),
		o.WithArg("planetNames", planetNamesItems),
		o.WithArg("baseArtwork", baseArtworkItems),
		o.WithArg("cardArtwork", cardArtworkItems),
		o.WithArg("artDescriptions", artDescriptionsItems),
		o.WithArg("artThumbnails", artThumbnailsItems),
		o.WithSigner("account")).
		Print()

	// create inventory items
	item_names, item_descriptions, item_thumbnails, item_quantities, item_prices, item_artist_names, item_series_names, item_art_names, item_art_categories := inventory_prep.PrepareInventory("./art/accessories/store_inventory_list.csv", "./art/accessories", flow_network)
	c.Tx(
		"FLOASISItemsStore/batch_add_inventory",
		o.WithArg("itemNames", item_names),
		o.WithArg("itemDescriptions", item_descriptions),
		o.WithArg("itemCategories", item_art_categories),
		o.WithArg("itemThumbnails", item_thumbnails),
		o.WithArg("itemQuantities", item_quantities),
		o.WithArg("itemPrices", item_prices),
		o.WithArg("itemArtistNames", item_artist_names),
		o.WithArg("itemSeriesNames", item_series_names),
		o.WithArg("itemArtNames", item_art_names),
		o.WithArg("allPaymentsRecipient", "account"),
		o.WithArg("allRoyaltiesRecipient", "account"),
		o.WithSigner("account")).
		Print()

	inventory_item_ids := []uint64{0, 1, 2}

	// batch mark inventory items active
	c.Tx(
		"FLOASISItemsStore/batch_set_inventory_active",
		o.WithArg("inventoryItemIDs", inventory_item_ids),
		o.WithSigner("account")).
		Print()

}
