export const FLOASIS_PROJECT_TYPE = "FLOASIS";
export const ITEMS_PROJECT_TYPE = "ITEMS";
export const VIEW_MODE_ONCHAIN_COMPOSITES = "ONCHAIN";
export const VIEW_MODE_LOCAL_COMPOSITES = "LOCAL";
export const EDIT_MODE_LAYERS_ORDER = "ORDER";
export const EDIT_MODE_COLORS = "COLORS";
export const ON_CHAIN_COMPOSITE_TYPE = "ON-CHAIN-COMPOSITE";
export const ON_CHAIN_COMPOSITES_GROUP_NAME = "FLOASIS_ITEMS"

/*
Note, we are setting fcl limit using this constant as setting it in the fcl config does not 
appear to work.
*/
export const FCL_LIMIT = 9999;

/*
The following constants pull from env vars so deployers can customize their app.
*/
export const APP_DETAIL_TITLE = process.env.NEXT_PUBLIC_UI_APP_DETAIL_TITLE || "FLOASIS Items -- NFT Accessories for The FLOASIS!!!";
export const ITEMS_STORE_NAME = process.env.NEXT_PUBLIC_UI_ITEMS_STORE_NAME || "FLOASIS Items";
export const PRIMARY = process.env.NEXT_PUBLIC_UI_PRIMARY || "#58e594"
export const PRIMARY_HOVER = process.env.NEXT_PUBLIC_UI_PRIMARY_HOVER || "#00ce78"
export const PRIMARY_FOCUS = process.env.NEXT_PUBLIC_UI_PRIMARY_FOCUS || "rgba(67, 160, 71, 0.125)"
export const PRIMARY_INVERSE = process.env.NEXT_PUBLIC_UI_PRIMARY_INVERSE || "#fff"
