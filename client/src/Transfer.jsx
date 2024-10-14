// client/src/Transfer.jsx
import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from "ethereum-cryptography/keccak";

// private key 6c3a567cf815c6568b0ef7713498f8146bf125a2322792b53a6cfaac82dcc756
// public key: 02bea88fb18d1a962cdca58909a24db226c0f37236042536738981a844a6d6df15

// private key 0ac8dc0ab9e209a65348ecfcaf28c3770c2a41c3c56efba1496ba475f85692f5
// public key: 031d8d425b3bf19561822735a3f535ce40b29901d433c5e7bbeaaec9b15852dc26

// private key 04e66614e85f2eb5e9bb8f78e80c14f7064373cc840be606a6d3df8ec9e4312f
// public key: 036a609a36e80458267c791b1a36217ed13900dc95f7ea44586bdbfeef9b22469a

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const hashMessage = message => keccak256(Uint8Array.from(message));
  const signMessage = msg => secp256k1.sign(hashMessage(msg), privateKey);

  async function transfer(evt) {
    evt.preventDefault();

    const msg = { amount: parseInt(sendAmount), recipient };
    const sig = signMessage(msg);

    const stringifyBigInts = obj => {
      for (let prop in obj) {
        let value = obj[prop];
        if (typeof value === 'bigint') {
          obj[prop] = value.toString();
        } else if (typeof value === 'object' && value !== null) {
          obj[prop] = stringifyBigInts(value);
        }
      }
      return obj;
    }

    // convert BigInts to String before sending to server
    const sigStringed = stringifyBigInts(sig);

    const tx = {
      sig: sigStringed, msg, sender: address
    }

    try {
      const {
        data: { balance },
      } = await server.post(`send`, tx);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;