const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 8000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  return res.status(200).json("Hello Wrld")
})

app.get("/getTokens", async (req, res) => {
  const { userAddress, chain } = req.query

  const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: chain,
    address: userAddress
  })

  const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
    chain: chain,
    address: userAddress,
    mediaItems: true
  })

  const balance = await Moralis.EvmApi.balance.getNativeBalance({
    chain: chain,
    address: userAddress
  })

  const nftMedia = nfts.raw.result.map((e, i) => {
    if (e?.media?.media_collection?.high?.url && !e.possible_spam && (e?.media?.category !== "video")) {
      return e["media"]["media_collection"]["high"]["url"]
    }
  })

  const jsonResponse = {
    tokens: tokens.raw,
    nfts: nfts.raw.result,
    displayNFT: nftMedia,
    balance: balance.raw.balance
  }

  return res.status(200).json(jsonResponse)
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
