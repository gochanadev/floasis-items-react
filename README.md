# FLOASIS Items -- Create and Sell ***Decentralized NFT Accessories***!
Welcome to FLOASIS Items!!! Unleash your creativity and deploy your own NFT store on the Flow blockchain.

FLOSIS Items NFTs are the perfect accessories for [FLOASIS NFTs](https://floasis.fun), like hats, rocket ships, game assets, or many other things you can imagine, all created as pixel art and saved on-chain, inside the NFT itself. I like to call them ***Decentralized NFT Accessories*** because it's not just me who can create and sell the NFT accessories used by FLOASIS NFTs, it's anyone. You don't owe me a cut of your sales -- you don't need my permission!!! 

FLOASIS Items are created using [IaNFT](https://github.com/hichana/iaNFT), which means the ability to modify their on-chain artwork is embedded within the NFT itself. You can change their colors, composite them as layers to create new and unique on-chain art, and view/download them as SVGs or various image formats in front-end applications (with more functionality from IaNFT possible). It's the owner of the NFT who decides if and when to modify the internal state (the artwork) of the NFT, and they can do so across any future projects as it's only simple transaction code that is needed to change colors and recomposite layers! (link to the transactinos here).

This project should have all you need to create your own accessory NFTs for The FLOASIS and sell them on Flow. Join the movement to create truly collaborative and decentralized on-chain NFT experiences with your own FLOASIS Items project!!!

## About FLOASIS Items:

### No Bullshit
In theory, sales from FLOASIS Items stores deployed and run by various community members should drive sales of FLOASIS NFTs. Good for you, good for me :). The FLOASIS and FLOASIS Items should demonstrate the ability for IaNFT to enable us to create truly composable, truly decentralized cross-project NFTs. There is no hyped-up bullshit roadmap with IaNFT, The FLOASIS or FLOASIS Items. Let's instead build great NFT experiences on the merit of the technology and the blood, sweat and tears that we put into it!

### License
Let's get this out of the way before you start building... ALL artwork and source code from FLOASIS Items are in the public domain via [CCO 1.0](https://creativecommons.org/publicdomain/zero/1.0/) and [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html) respectively. Fork and build build build Flow devs!!! You're also welcome to use any of the art or code to create an entirely new NFT project and rally other devs to build upon it, just like I'm doing here :) I'm happy to support people who want to take IaNFT, FLOASIS and/or FLAOSIS Items any new direction they may feel inspired to go.

### Example Use Cases
IaNFT and FLOASIS Items are meant to unlock truly collaborative and decentralized on-chain NFT experiences on Flow. Simply put, this means that it's YOU who creates and sells the vast majority of accessory NFTs for the characters of The FLOASIS. With FLOASIS Items, it's like going from zero to *"I have my own mainnet deployed full stack NFT project"* quickly and with as little friction as possible.

In the real world I can get a smartphone case from anyone who makes one that fits my phone, not just the phone maker. I can buy art to hang on the wall in my room, score some pink and black retro Nike shoes to wear, or foolishly keep potted plants on the dashboard of my car, basically whatever I want. I want to do something similar with my NFTs as they travel around on the Flow blockchain. Here are some sample use cases illustrating what that might look like:

#### A community member forks FLOASIS Items and independantly sells NFT accessories
A totally unrelated and independant Flow developer creates the CryptoNyans project, *premium Nyan cats for FLOASIS NFTs to fly you around the metaverse* (someone please make this!!!). Inhabitants from each of the 7 known planets in The FLOASIS are able to purchase a NyanCat specific to their home planet.

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

Because the ability to change colors and composite IaNFTs as layers to create new on-chain art is embedded in the NFT code itself (add link here to IaNFTAnalogs contract, make sure it has a good explanation at top about the embedded code and unlocking/collaborative/decentralized concept), CryptoNyans doesn't need anyone's permission to create and sell NFTs that work with The FLOASIS NFTs. Changing artwork color or recompositing layers to create unique artwork can happen both in the CrypoNyans FLOASIS Items project builder tool, or in The FLOASIS builder tool at http://floasis.fun (under construction).

#### A secondary marketplace on Flow makes free merch for FLOASIS NFT holders to promote secondary FLOASIS NFT sales
As a limited mint free NFT, FLOASIS NFT holders who visit the marketplace can mint a special t-shirt or hat for their FLOASIS NFT with the marketplace logo on it.

```image
The NFT from above image shown, then show the NFT merch, then show the character now wearing the NFT shirt or hat.
```
Notice in the above two use cases there are three independant projects -- The FLOASIS, CryptoNyans, and the secondary marketplace. What's cool is they all operate on the same NFT, adding more and more NFTs with the ability to composite their artwork layers into The FLOASIS NFT's on-chain storage!!! It can happen the other way around too, The FLOASIS NFT art can be added to the accessory NFTs or a wholly different NFT project uisng IaNFT! Each of the three projects operates totally independantly and doesn't need permission from anyone to make and sell these compatible NFTs. Mucho funno!!!

#### A community member makes NFT characters instead of accessories for The FLOASIS
There's nothing stopping anyone from using FLOASIS Items to make a unique story and set of characters that accept their own accessories from other builders. If you're a slightly more advanced coder it's very possible, and I'd be happy to help guide you (message me please).

```image
Welcome to the Yo!ASIS, hip-hop characters for Flow!

Yo!ASIS character is a hip hop guy head with words Yo! Yo! Yo! atop

two nft accessories, one is shirt with arms and a bottle of Crystal, and the other is a big-pimpin' mercedes benz SUV.

Composite all
```

### Core Concept
FLOASIS Items is meant to be as simple as possible yet still be a *real* Flow blockchain project with web app code and smart contracts that you own. Here are the things you will need to do in order to sell FLOASIS accessory NFTs on Flow mainnet (detailed steps are provided later on in this guide):

- add data specific to your project (like the project name) to:
    - `flow.json`
    - `.env.local`
    - `constants.js`
    - `FLOASISItems.cdc`
    - `FLOASISItemsStore.cdc`
- deploy to testnet
- run store setup script on testnet
- deploy the web app to Vercel
- deploy to mainnet
- run store setup script on mainnet
- re-deploy the web app to Vercel

When I first started lerning to build on the Flow blockchain, I would have loved to have a minimalist NFT project codebase and a clear path to get me to mainnet with minimal friction and no backend complexity, leaving it to me to optimize any testing or backend later on. If you're interested in that too, I hope you can give FLOASIS Items a shot and help me improve it as you go along (your PRs are welcome!!!).

A number of choices went into keeping FLOASIS Items simple. Some of them are:
- There's no emulator deployment for FLOASIS Items, for now. I tabled an emulator deployment (tho it's partially implemented) as it would require multiple other smart contracts, transactions scripts and numerous setup steps. It can happen in the future if needed.
- There are no unit or integration tests, but there will be. Even a simple app like this should have meaningful test coverage. Once at least some Flow devs fork and deploy their own store, they can be added. Your computer won't explode or anything, so calm down my fellow nerds! For now, I've added a single integration test sample file with instructions to run it, so there is a path for any brave community member to build it out into a suite of tests.
- There are no detailed instructions and workflow for customizing the web app extensiv
- There is no detailed branching and merging workflow instructions yet that would facilitate extensive customizations to the web app, yet still keep your codebase lined up with changes made to the upstream FLOASIS Items repo (the one you forked from to make your repo). For now, the changes you make in your `flow.json` and `env.local` files should be enough to do things like re-skinning the web app with a new color scheme or changing some of the details about your project like the description of your accessories. You're of course welcome to branch out, customize and then merge any conflicts that may arise when you pull changes from upstream into your fork. 
- The instructions, for now, are made with OSX and Visual Studio Code in mind. Also, I'm using Vercel to deploy the web app, but you're welcome to swap it out for one of your choice. I hope we can make the options more diverse in the future.

Now, at last, let's get started on your deployment.

## Getting Started:

### Fork FLOASIS Items
1. Visit the [hichana/floasis-items-react](https://github.com/hichana/floasis-items-react) repo and fork it. You can leave "Copy the main branch only" checked. If you're new to forking a repo, follow the [Fork a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo) instructions from Github.
2. Clone the forked repo onto your local machine (instructions if you need them [here](https://docs.github.com/en/get-started/quickstart/fork-a-repo#cloning-your-forked-repository))

### Create FLOW Accounts
If you don't already have deployer accounts for testnet and mainnet, you'll need to create them.

Create a testnet account:
1. With the [Flow CLI](https://developers.flow.com/tools/flow-cli) installed on your computer
    - generate keys: `flow keys generate --network=testnet --sig-algo "ECDSA_P256"`
    - add the private, public keys and mnemonic it gives you to your preferred backup secure solution outside of this repo
2. Create and fund your testnet account with with flow via testnet faucet: https://testnet-faucet.onflow.org/
    - in the faucet, copy/paste in your public key
    - if not already set, make sure Signature Algorithm to be ECDSA_P256, and Hash Algorithm to be SHA3_256
    - follow the steps to create the Flow account, and once done make note of the account address that it gives you. For example: 0x75327e876546b2d1
    - click on the 'View Account' link on the page once you've successfully created an account. This should open up the testnet version of flow-view-source and show that your account has 1000 $FLOW in it.

Create a deployer mainnet account:
Jacob Tucker made a great video called '[How to create a Non-Custodial account on Flow MainNet](https://www.youtube.com/watch?v=vXui7uO4cIQ&t) to do just that. It uses [Flow Port](https://port.onflow.org/). Be sure to save your address, mnemonic, public and private keys securely using your preferred secure backup method outside of this repo.

Create a test user account for both testnet and mainnet:
To use and manually test your FLOASIS Items deployment, you're going to need a Flow account that you can log in using a wallet provider in the UI. One easy way we can do this is to use [Lilico wallet](https://lilico.app/). Lilico gives you easy access to your public and private keys, and you can toggle between testnet and mainnet easily. Given this is a test user account, I wouldn't recommend storing any significant funds or assets in this account when on mainnet. Follow the steps for installing their browswer extension [here](https://lilico.app/download). After you installed it, follow their steps to 'Create A New Wallet' and save all credentials using your preferred secure backup method. 

### Set Up `flow.json`
In the root directory of this project, change the name of `flow_example.json` to be just `flow.json`. In VS Code, you'll notice that once you do that the file name has been changed the file name in the left-side "Explorer" section will become grey instead of white. This indicates that it is not included in git version control. Once you complete this file and `.env.local` you should back them up securely outside of the repo using your preferred method.

In your `flow.json`, replace thew following with the corresponding values you got from creating your testnet and mainnet deployer accounts:
- YOUR-TESTNET-DEPLOYER-ACCOUNT
- YOUR-MAINNET-DEPLOYER-ACCOUNT
- YOUR-TESTNET-DEPLOYER-ACCOUNT-PRIVATE-KEY






### Demo Floasis NFT resoruce storage path
- should be unique for each deployer, even tho the FLOASISNFT contract here is only being used as a demo contract for creating NFTs on emulator and testnet
- your setup step will be to change the path in that contract

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

- add your web3 storage API key

### Set up constants.ts
This is a file where we keep some more data that establishes your unique project variables.
- open the 'constants.ts' file (lib -> constants.js) and update the data relevant to your app like title

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
- explain how handle FLOW_ENV in package.json and vercel
- in svg_prep, dev will need to change the artist name and series name when adding art on-chain
- don't forget, if I change the testnet address for the official floasis project, I need to change it here as well wherever it is used, ex. in flow.json
- for developer deployer, the artist name and series name in the setup_store script will need to line up with the CSF file for inventory
- dev deployer must change contract paths
- make guide on pulling from upstream. Finally, I will be making a guide on pulling upstream changes from the parent repo (this one). This means that your FLOASIS Items store deployment can merge in improvements and bug fixes.
- you'll notice that the web app is similar to @Andrea's Flow quickstart for Next.js. 
- add instructions for pulling from upstream

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







```
Besides creating the theme and artwork for your FLOASIS Items store, there are a small number of files you will need to modify:
- `flow.json` (add link for each)
- `.env`

Following the guides in this repo will walk you through that process, and the various other steps to get you from the emulator to your mainnet deployment. You're welcome to modify as much or as little of the app as you want. For relatively unexperienced developers this may be a chance to get a live project out there with minimal friction, and learn more about smart contracts, automation, integration tests and full stack web apps as you run your project. When I was learning that's something that I would have loved to have but never found...


It would be amazing to see the Flow developer community come up with fun themes and artwork for their own FLOASIS Items stores!!!
I can do that in the future, but for now it's best to keep it ultra simple. It's easier to just start grag the FLOASIS NFT on testnet and then use it with the NFT accessories you create. The same goes for integration tests. 

Starting development

can and should run on emulator, testnet and mainnet. Those three environments represent the basic development path for the dapp. Working with emulator, you can spin up a detailed scenario of usage with multiple users, creating and adding all artwork on-chain, having users purchase NFTs, and so on. Its state is reset each time you turn it on and off and it's a great place also to run integration tests. The blockchain state of the dapp on testnet is tied to the testnet deployer account to which you deploy the smart contracts and execute transactions against. While emulator should reflect testnet closely, in my experience, something in the client (the web app) that works without any problems on emulator may in fact need to be re-architected to work as intended against testnet. Testnet is also where you can get others to start using the dapp. From there the step from testnet to mainnet is mostly simple.

# Create your development and deployment branch
Here is the basic workflow for FLOASIS Items (more detailed instructions below):
- Leave the `main` branch in your FLOASIS Items fork as-is. Periodically pull changes from the upstream FLOASIS Items repo (the one you forked from to make your repo) into the `main` branch
- Maintain a development branch that you originally branch off from `main`. You can call it anything you want, but to make things simple let's call it the `dev` branch. This is where you can make any custom changes to the web app if you like. Note, if you do go down the path of tailoring the web app with customizations (ex. new styling, layout, etc.), then each time you pull upstream changes from the original FLOASIS Items repo, you'll have to [resolve any conflicts](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts). That's totally ok, but I'd recommend keeping the number of changes small until you decide that you don't require changes/improvements/bug-fixes to the original FLOASIS Items repo anymore.
- maintain a deployment branch that will be used to deploy the production web app to Vercel. We'll call this one `deploy`. Once your `dev` branch is to your liking, 


3. after you clone the repo, 

1. visit https://github.com/hichana/floasis-items-react
2. 

