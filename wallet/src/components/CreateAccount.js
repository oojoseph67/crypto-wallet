import React from "react";
import { Button, Card } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ethers } from "ethers";

function CreateAccount({ setSeedPhrase, setWallet }) {
  const navigate = useNavigate();
  const [newSeedPhrase, setNewSeedPhrase] = useState(null);

  async function generateWallet() {
    const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
    console.log("mnemonic :", mnemonic);
    setNewSeedPhrase(mnemonic);
  }

  function setWalletAndMnemonic() {
    setSeedPhrase(newSeedPhrase);
    setWallet(ethers.Wallet.fromPhrase(newSeedPhrase).address);
    console.log(
      "address from mnemonic",
      ethers.Wallet.fromPhrase(newSeedPhrase).address
    );
     console.log(
       "private key from mnemonic",
       ethers.Wallet.fromPhrase(newSeedPhrase).privateKey
     );
  }

  return (
    <>
      <div className="content">
        <div className="mnemonic">
          <ExclamationCircleOutlined style={{ fontSize: "20px" }} />
          <div>
            Once you generate the seed phrase, save it securely in order to
            recover your wallet in the future
          </div>
        </div>
        <Button
          disabled={newSeedPhrase}
          className="frontPageButton"
          type="primary"
          onClick={() => generateWallet()}>
          {newSeedPhrase ? "Phrase Already Generated" : "Generate Seed Phrase"}
        </Button>
        <Card className="seedPhraseContainer">
          {newSeedPhrase && (
            <pre style={{ whiteSpace: "pre-wrap" }}>{newSeedPhrase}</pre>
          )}
        </Card>
        <Button
          className="frontPageButton"
          type="default"
          onClick={() => setWalletAndMnemonic()}>
          Open Your New Wallet
        </Button>
        <p className="frontPageBottom" onClick={() => navigate("/")}>
          Back Home
        </p>
      </div>
    </>
  );
}

export default CreateAccount;
