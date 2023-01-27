
# FLOASIS Items -- Create and Sell ***Decentralized NFT Accessories***!
Welcome to FLOASIS Items!!! Unleash your creativity and deploy your own NFT store on the Flow blockchain.

FLOSIS Items NFTs are the perfect accessories for [FLOASIS NFTs](https://floasis.fun), like hats, rocket ships, game assets, or anything else you can imagine, all created as pixel art and saved on-chain, inside the NFT itself. I like to call them ***Decentralized NFT Accessories*** because it's not just me who can create and sell the NFT accessories used by FLOASIS NFTs, it's anyone. You don't owe me a cut of your sales, you don't need my permission!!!

FLOASIS Items are created using [IaNFT](https://github.com/hichana/iaNFT), which means the ability to modify their on-chain artwork is embedded within the NFT itself. You can change their colors, composite them as layers to create new and unique on-chain art, and view/download them as SVGs or various image formats in front-end applications (with more functionality to come). It's the owner of the NFT who decides if and when to modify the internal state (the artwork) of the NFT, and they can do so across any future projects as it's only simple transaction code that is needed to change colors and recomposite layers! (link to the transactinos here).

This project should have all you need to create your own accessory NFTs for The FLOASIS and sell them on Flow. Join the movement to create truly collaborative and decentralized on-chain NFT experiences with your own FLOASIS Items project!!!

## About FLOASIS Items:

### License
Let's get this one out of the way before you start building... ALL artwork and source code from FLOASIS Items are in the public domain via [CCO 1.0](https://creativecommons.org/publicdomain/zero/1.0/) and [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html) respectively. Fork and build build build Flow devs!!! You're also welcome to use any of the art or code to create an entirely new NFT project and rally other devs to build upon it, just like I'm doing here :) 

### Example Use Case
IaNFT and FLOASIS Items are meant to unlock truly collaborative and decentralized on-chain NFT experiences on Flow. Simply put, this means that it's YOU who creates and sells the vast majority of accessory NFTs for the characters of The FLOASIS. With FLOASIS Items, it's like going from zero to *"I have my own mainnet deployed full stack NFT project"* quickly and with as little friction as possible.

In the real world I can get a smartphone case from anyone who makes one that fits my phone, not just the phone maker. I can buy art to hang on the wall in my room, score some pink and black retro Nike shoes to wear, or foolishly keep potted plants on the dashboard of my car, basically whatever I want. I want to do something similar with my NFTs as they travel around on the Flow blockchain. Here are some sample use cases illustrating how that looks:

##### A community member forks FLOASIS Items and independantly sells NFT accessories
A totally unrelated and independant Flow developer creates the CryptoNyans project, *premium Nyan cats for FLOASIS NFTs to ride around the metaverse* (someone please make this!!!). Inhabitants from each of the 7 known planets in The FLOASIS are able to purchase a NyanCat specific to their home planet.

```images
FLOASIS NFT (build by hichana)

FLOASIS Items NFT 1 (hat) (build by hichana)
FLOASIS Items NFT 2 (shirt) (build by hichana)
FLOASIS Items NFT 3 (rocket ship) (build by hichana)
FLOASIS Items NFT 4 (clouds) (build by hichana)

"composite NFT layers to create new art", flying behind the clouds
FLOASIS NFT composited order 1

"re-composite layers with a different order", now flying in front of the clouds
FLOASIS NFT composited order 2

CryptoNyans NFT 1 (palm trees) (build by another Flow developer)
CryptoNyans NFT 2 (rainbow nyan cat) (build by another Flow developer)
FLOASIS NFT with composite order 2 but with rocket ship replaced by Nyan cat and palm trees in background (removes the clouds)
```

Because the ability to change colors and composite IaNFTs as layers to create new on-chain art is embedded in the NFT code itself (add link here to IaNFTAnalogs contract, make sure it has a good explanation at top about the embedded code and unlocking/collaborative/decentralized concept), CryptoNyans doesn't need anyone's permission to create and sell NFTs that work with The FLOASIS NFTs. Changing artwork color or recompositing layers to create unique artwork can happen both in the CrypoNyans FLOASIS Items project builder tool, or in The FLOASIS builder tool at http://floasis.fun.

##### A secondary marketplace on Flow makes free merch for FLOASIS NFT holders to promote secondary FLOASIS NFT sales
As a limited mint free NFT, FLOASIS NFT holders who visit the marketplace can mint a special t-shirt or hat for their FLOASIS NFT with the marketplace logo on it.

```image
The NFT from above image shown, then show the NFT merch, then show the character now wearing the NFT shirt or hat.
```
Notice in the above two use cases there are three independant projects -- The FLOASIS, CryptoNyans, and the secondary marketplace. What's cool is they all operate on the same NFT, adding more NFTs to composite their artwork layers into The FLOASIS NFT!!! It can happen the other way around too, The FLOASIS NFT art can be added to the accessory NFTs! Each of the three projects operates totally independantly and doesn't need permission from anyone to make and sell these compatible NFTs. Mucho funno!!!

##### A community member makes NFT characters instead of accessories for The FLOASIS
There's nothing stopping anyone from using FLOASIS Items to make a unique story and set of characters that accept their own accessories from other builders. If you're a slightly more advanced coder it's very possible, and I'd be happy to help guide you (message me please).

```image
Welcome to the Yo!ASIS, hip-hop characters for Flow!

Yo!ASIS character is a hip hop guy head with words Yo! Yo! Yo! atop

two nft accessories, one is shirt with arms and a bottle of Crystal, and the other is a big-pimpin' mercedes benz SUV.

Composite all
```

### Core Concept
Besides creating the theme and artwork for your FLOASIS Items store, there are a small number of files you will need to modify:
- `flow.json` (add link for each)
- `.env`

Following the guides in this repo will walk you through that process, and the various other steps to get you from the emulator to your mainnet deployment. You're welcome to modify as much or as little of the app as you want. For relatively unexperienced developers this may be a chance to get a live project out there with minimal friction, and learn more about smart contracts, automation, integration tests and full stack web apps as you run your project. When I was learning that's something that I would have loved to have but never found...

In theory, sales from FLOASIS Items stores deployed and run by various community members should drive sales of The FLOASIS NFTs. This is how I hope to support ongoing development of IaNFT and The FLOASIS. It would be amazing to see the Flow developer community come up with fun themes and artwork for their own FLOASIS Items stores!!! 

Finally, I will be making a guide on pulling upstream changes from the parent repo (this one). This means that your FLOASIS Items store deployment can merge in improvements and bug fixes.

## Getting Started:
FLOASIS Items can and should run on emulator, testnet and mainnet. Those three environments represent the basic development path for the dapp. Working with emulator, you can spin up a detailed scenario of usage with multiple users, creating and adding all artwork on-chain, having users purchase NFTs, and so on. Its state is reset each time you turn it on and off and it's a great place also to run integration tests. The blockchain state of the dapp on testnet is tied to the testnet deployer account to which you deploy the smart contracts and execute transactions against. While emulator should reflect testnet closely, in my experience, something in the client (the web app) that works without any problems on emulator may in fact need to be re-architected to work as intended against testnet. Testnet is also where you can get others to start using the dapp. From there the step from testnet to mainnet is mostly simple.

Let's get started on your deployment.

### Demo Floasis NFT resoruce storage path
- should be unique for each deployer, even tho the FLOASISNFT contract here is only being used as a demo contract for creating NFTs on emulator and testnet
- your setup step will be to change the path in that contract

### Create FLOW Accounts
I highly recommend you have both testnet and mainnet Flow accounts.

Create a testnet account:
1. With the [Flow CLI](https://developers.flow.com/tools/flow-cli) installed on your computer
    - generate keys: `flow keys generate --network=testnet --sig-algo "ECDSA_P256"`
    - temporarily keep the private and public keys so you can use them in the following steps
2. Create and fund your testnet account with with flow via testnet faucet: https://testnet-faucet.onflow.org/
    - in the faucet, copy/paste in your public key
    - if not already set, make sure Signature Algorithm to be ECDSA_P256, and Hash Algorithm to be SHA3_256
    - follow the steps to create the Flow account, and once done make note of the account address that it gives you. Example: 0x75327e876546b2d1
    - click on the 'View Account' link on the page once you've successfully created an account. This should open up the testnet version of flow-view-source and show that your account has 1000 $FLOW in it.
3. Save your address, public and private keys in whatever cold-storage or other secure method you like

Create a deployer mainnet account:
I recommend creating and keeping a fresh mainnet account as your deployer account. Jacob Tucker made a great video called '[How to create a Non-Custodial account on Flow MainNet](https://www.youtube.com/watch?v=vXui7uO4cIQ&t) to do just that. It uses [Flow Port](https://port.onflow.org/). Be sure to save your address, public and private keys securely using your preferred method.

Create a test user account for both testnet and mainnet:
To do this you can use [Lilico wallet](https://lilico.app/), as it gives you easy access to your public and private keys and can toggle between testnet and mainnet. Given this is a test user account, I wouldn't recommend storing any significant funds or assets in this account. Follow their steps for installing their browswer extension [here](https://lilico.app/download). After you installed it, follow their steps to 'Create A New Wallet' and save all credentials using your preferred secure backup method. That's it for now, when you set up flow.json you'll circle back to use some of these credentials.

### Set up flow.json
Credentials for your Flow accounts will live in flow.json. This repo contains a 'flow_example.json' file in the root directory. Change its name to be 'flow.json'. Note, in the '.gitignore' file in this project, 'flow.json' is added to excluded it from version control as it contains private keys. You should back up the flow.json file securely outside of this project directory. Here are the steps for setting flow.json up:

1. Replace addresses
    - [YOUR-TESTNET-ACCOUNT-ADDRESS] should be replaced with the account address you got when creating your testnet account

    5. in flow.json, add the credentials under the 'account' section, creating your testnet account user as 'testnet-account', like so:

        "accounts": {
            "emulator-account": {
                "address": "f8d6e0586b0a20c7",
                "key": "f8e188e8af0b8b414be59c4a1a15cc666c898fb34d94156e9b51e18bfde754a5"
            },
            "testnet-account": {
                "address": "[your-testnet-account-address-from-step-2]",
                "key":{
                    "type": "hex",
                    "index": 0,
                    "signatureAlgorithm": "ECDSA_P256",
                    "hashAlgorithm": "SHA3_256",
                    "privateKey": "[your-testnet-account-private-key-from-step-2]"
                }
            }
        },
    6. in flow.json, add the deployment alias to multiple places

- add deployment designation and update aliases
    - 'deployment' section is set up
    - each contract to be deployed has the testnet address added in aliases section 

MORE NOTES ABOUT THE FLOW.JSON file
- the following contract deployment addresses point to the FLOASIS mainnet account address (???) as the deployment address:
    - FLOASISNFT
    - FLOASISPrimitives
    - IaNFTAnalogs


### NOTE
- each deployer needs to update the paths in FLOASISItems, FLOASISItemsStore, FLOASISNFT (the demo contract for floasis NFTs) also!!!

### Set up .env
In the root of this project, find the '.env.example' file and change it to just be '.env'. Now open the .env file and add the 'TESTNET_DEPLOYER_ADDRESS' env var value as your testnet account address. Note, this file is also excluded from version control. You should securely back this one up elsewhere as well.

- note, deployer address in .env should NOT have 0x prefix
- make sure deployer addresses in .env match from flow.json

- update all env vars where appropriate

### Set up constants.ts
This is a file where we keep some more data that establishes your unique project variables.
- open the 'constants.ts' file (lib -> constants.js) and update the fully qualified identifier with new testnet deployer address. To do this, chop off the '0x' from your testnet account address and replace the address part of the identfier, so it resembles this: 'A.75327e876546b2d1.FLOASISItems.NFT'

### Run on emulator
- Setup scripts
Deploy contracts and run various transactions against the emulator:
!!! note, if the setup script's 'flow_network' variable is set to 'embedded', the emulator will not be set up. Make sure it's set to 'emulator'.
go run ./overflow/setup_web/setup_web.go

### Create some accessories art!
The default project here has some placeholder art so that you can immediately run setup and deploy to emulator. But you'll need to come up with your own theme and FLOASIS Items accessories art. Here are the basic parameters for the artwork:

- FLOASIS Items NFTs are a composite of two layers stored on the NFT -- the 'base', which is 100px x 100px, and the 'card', which is 140px (height) x 100px (width). The two layers stacked with the base on top of the card make a great way to present the NFT for sale in your store. When compositing NFT accessories onto a FLOASIS NFT, only the base artwork is used, because that's the actual accessory. 
- when you create artwork, it will be in PNG format. There are instructions below on how to do it. The scripts you'll run form emulator, testnet and mainnet will convert the PNG to SVG automatically for you. There's one important thing to note -- the script checks first if the SVG file exists when converting from PNG, and if it does the script does not convert the file again. So if you update your art PNG, you'll need to go into the SVG folder and delete the obsolete version of the art.

- Piskel instructions
https://www.piskelapp.com/

### !!!!
also update the collection metadata text in the contract for each deployer
- make sure storage paths are prefixed with this project name so they won't conflict with other ones
- composite_multiple_layers_testnet and mainnet will need to have both the user's account and the official floasis account addresses
- deployer devs need to prefix their paths in FLOASISItems and FLOASISItemsStore
- deployer needs to go into one or more smart contracst (like the NFT contract) and update strings like metadata standard data

### Run emulator
go run ./overflow/setup_web/setup_web.go

### Deploy to testnet

- account for this somewhere!!!
    - also update constants.js and .env.local
    - also update the composite_multiple_layers transaction hard-coded identifiers

`flow project deploy --network=testnet`

### Deploy to mainnet
`flow project deploy --network=mainnet`

### Getting ready to deploy
- change the NFT `Type<MetadataViews.NFTCollectionDisplay>` with you IPFS CID, etc.

## Running on Flow Emulator
go run ./overflow/setup_web/setup_web.go

## Testnet setup
- setup testnet-user1 with demo FLOASIS NFTs
    - go run ./overflow/testnet/setup_demo_floasis_nfts/main.go
- setup store
    - go run ./overflow/testnet/setup_store/main.go

### Worklfow notes
You must first get the dapp working on emulator, then testnet, then mainnet. It's not just best practice, it's going to get everything set up correctly, like converting the artwork from PNG to SVG.

### royalty receiver in floasis items
- change to your preferred

- note, part of the process is to add FLOW_ENV=testnet env var for development env in vercel
---

The web app for this project is a Next.js project that interacts with the Flow Client Library (FCL).

## Running on Flow Testnet
This project will run on the Flow testnet simply as:
```bash
npm run build
npm run start
```

## Developing with Flow emulator


# PISKEL
- make sure give instructions on how to export the thumbnail image at a higher resolution, and it should be a composite of the base and the card

**Pre-Requisite**: To develop locally, make sure you have the Flow CLI installed: https://docs.onflow.org/flow-cli/install/

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start the emulator, deploy the contracts, followed by the development server:

```bash
flow emulator start --dev-wallet
flow project deploy --network emulator

npm run dev
# or start the server and open the app in a new browser tab
npm run dev -- --open
```

> NOTE: If you are switching between testnet and the emulator without changing tabs, FCL will keep you logged in with your testnet address (or vice-versa). Remember to logout inbetween environments to avoid runtime errors!

## Building

Before creating a production version of your app, build it!

```bash
npm run build
```

## Testimonials
