import React, { useState } from "react";
import { BulbOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const { TextArea } = Input;

function RecoverAccount({ setSeedPhrase, setWallet }) {
  const navigate = useNavigate();
  const [typedSeed, setTypedSeed] = useState("");
  const [nonValid, setNonValid] = useState(false);

  const seedAdjust = (e) => {
    setNonValid(false);
    setTypedSeed(e.target.value);
  };

  const recoverWallet = () => {
    let recoveredWallet;
    try {
      recoveredWallet = ethers.Wallet.fromPhrase(typedSeed);
    } catch (e) {
      setNonValid(true);
      console.log(e);
      return;
    }

    setSeedPhrase(typedSeed)
    setWallet(recoveredWallet.address)
    navigate("/yourwallet")
  };

  return (
    <>
      <div className="content">
        <div className="mnemonic">
          <BulbOutlined style={{ fontSize: "20px" }} />
          <div>
            Type your seed phrase in the field below to recover your wallet (it
            should include 12 words separated with spaces)
          </div>
        </div>
        <TextArea
          rows={4}
          className="seedPhraseContainer"
          placeholder="Type your seed phrase here..."
          onChange={seedAdjust}
          value={typedSeed}
        />
        <Button
          disabled={
            typedSeed.split(" ").length !== 12 || typedSeed.slice(-1) === " "
          }
          className="frontPageButton"
          type="primary"
          onClick={() => recoverWallet()}>
          Recover Wallet
        </Button>
        {nonValid && <p style={{ color: "red" }}> Invalid Seed Phrase </p>}
        <p className="frontPageBottom" onClick={() => navigate("/")}>
          <span>Back Home</span>
        </p>
      </div>
    </>
  );
}

export default RecoverAccount;
