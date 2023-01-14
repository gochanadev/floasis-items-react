import FLOASISItemsStore from "../../contracts/FLOASISItemsStore.cdc"

pub fun main(): {UInt64: FLOASISItemsStore.InventoryItem} {  
    return FLOASISItemsStore.getAllActiveInventory()
}
