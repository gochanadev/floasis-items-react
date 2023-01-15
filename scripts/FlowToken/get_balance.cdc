// This script reads the balance field of an account's FlowToken Balance
import FungibleToken from "../../contracts/core/FungibleToken.cdc"
import FlowToken from "../../contracts/core/FlowToken.cdc"

pub fun main(account: Address): UFix64 {
    // Borrow the account's FlowToken Vault
    let vaultRef = getAccount(account)
        .getCapability(/public/flowTokenBalance)
        .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    // Return the balance in the FlowToken Vault
    return vaultRef.balance
}  