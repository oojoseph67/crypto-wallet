import React, { useEffect, useState } from "react";
import {
  Divider,
  Tooltip,
  List,
  Avatar,
  Spin,
  Tabs,
  Input,
  Button,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../noImg.png";
import axios from "axios";
import { CHAINS_CONFIG } from "../chains"
import { ethers } from "ethers";  

function WalletView({
  wallet,
  setWallet,
  seedPhrase,
  setSeedPhrase,
  selectedChain,
}) {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);
  const [nfts, setNFTs] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [amountToSend, setAmountToSend] = useState(null) 
  const [sendToAddress, setSendToAddress] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [hash, setHash] = useState(null)

  const logout = () => {
    setSeedPhrase(null);
    setWallet(null);
    setNFTs(null);
    setTokens(null);
    setBalance(0);
    navigate("/");
  };

  async function getAccountTokens() {
    setFetching(true);

    const res = await axios.get(`http://localhost:8000/getTokens`, {
      params: {
        userAddress: wallet,
        chain: selectedChain,
      },
    });

    const response = res.data;

    console.log("response", response);

    if (response.tokens.length > 0) {
      setTokens(response.tokens);
    }

    if (response.nfts.length > 0) {
      nftProcessing(response.nfts);
      // setNFTs(response.nfts);
      // setNFTDisplay(response.displayNFT);
    }

    setBalance(response.balance);

    setFetching(false);
  }

  function nftProcessing(nftData) {
    for (let i = 0; i < nftData.length; i++) {
      let meta = JSON.parse(nftData[i].metadata);
      if (meta && meta.image) {
        if (meta.image.includes(".")) {
          nftData[i].image = meta.image;
        } else {
          nftData[i].image = "https://ipfs.moralis.io:2053/ipfs/" + meta.image;
        }
      }
    }
    setNFTs(nftData);
  }

  async function sendTransaction(to, amount) {
    const chain = CHAINS_CONFIG[selectedChain]
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl)
    const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey
    const wallet = new ethers.Wallet(privateKey, provider)

    const tx = {
      to: to,
      value: ethers.parseEther(amount.toString())
    }

    setProcessing(true)
    try {
      const transaction = await wallet.sendTransaction(tx)
      
      setHash(transaction.hash)
      const receipt = await transaction.wait()

      setHash(null)
      setProcessing(false)
      setAmountToSend(null)
      setSendToAddress(null)

      if (receipt.status === 1) {
        getAccountTokens()
      } else {
        console.log('failed')
      }

    } catch (err) {
      console.log("send error", err)
      setAmountToSend(null)
      setSendToAddress(null)
    }
  }

  const items = [
    {
      key: "3",
      label: "Tokens",
      children: (
        <>
          {tokens ? (
            <>
              <List
                bordered
                itemLayout="horizontal"
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item style={{ textAlign: "left" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      title={item.symbol}
                      description={item.name}
                    />
                    <div>
                      {(
                        Number(item.balance) /
                        10 ** Number(item.decimals)
                      ).toFixed(2)}{" "}
                      Tokens
                    </div>
                  </List.Item>
                )}
              />
              <p className="frontPageBottom" onClick={() => getAccountTokens()}>
                <span>Refresh</span>
              </p>
            </>
          ) : (
            <>
              <span>You seem to not have any tokens yet</span>
              <p className="frontPageBottom">
                Find Alt Coin Gems{" "}
                <a
                  href="https://moralismonry.com"
                  target="_blank"
                  rel="noreferrer">
                  money.moralis.io
                </a>
              </p>
            </>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: "NFTs",
      children: (
        <>
          {nfts ? (
            <>
              {nfts.map((e, i) => {
                return (
                  <>
                    {e && (
                      <img
                        key={i}
                        className="nftImage"
                        alt="nftImage"
                        src={e.image}
                      />
                    )}
                  </>
                );
              })}
            </>
          ) : (
            <>
              <span>You seem to not have any tokens yet</span>
              <p className="frontPageBottom">
                Find Alt Coin Gems{" "}
                <a
                  href="https://moralismonry.com"
                  target="_blank"
                  rel="noreferrer">
                  money.moralis.io
                </a>
              </p>
            </>
          )}
        </>
      ),
    },
    {
      key: "1",
      label: "Transfer",
      children: (
        <>
          <h3>Native Balance</h3>
          <h1>
            {/* {Number(ethers.utils.formatEther(balance.toString()))}{" "} */}
            {(balance / 10 ** 18).toFixed(2)}
            {CHAINS_CONFIG[selectedChain].ticker}
          </h1>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}>To:</p>
            <Input
              value={sendToAddress}
              onChange={(e) => setSendToAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}>Amount:</p>
            <Input
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="Native tokens you wish to send..."
            />
          </div>
          <Button
            style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
            type="primary"
            onClick={() => sendTransaction(sendToAddress, amountToSend)}
          >
            {" "}
            Send Tokens{" "}
          </Button>
          {processing && (
            <>
              <Spin />
              {
                hash && (
                  <Tooltip title={hash}>
                    <p>Hover for Tx Hash</p>
                  </Tooltip>
                )
              }
            </>
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!wallet || !selectedChain) return;
    setNFTs(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, []);

  useEffect(() => {
    if (!wallet) return;
    setNFTs(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, [selectedChain]);

  return (
    <>
      <div className="content">
        <div className="LogoutButton" onClick={logout}>
          <LogoutOutlined />
        </div>
        <div className="walletName">Wallet</div>
        <Tooltip title={wallet}>
          <div>
            {wallet.slice(0, 4)}...{wallet.slice(38)}
          </div>
        </Tooltip>
        <Divider />
        {fetching ? (
          <Spin />
        ) : (
          <Tabs defaultActiveKey="1" items={items} className="walletView" />
        )}
      </div>
    </>
  );
}

export default WalletView;
