import { Router } from "express";
import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, Connection,PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import axios from "axios";
import BigNumber from "bignumber.js"


const router = Router();

router.post("/create", (req, res) => {
  try {
    let mnemonic = req.body.mnemonic;

    // If a mnemonic is provided, validate it; otherwise, generate a new one
    if (mnemonic) {
      if (!validateMnemonic(mnemonic)) {
        return res.status(400).json({ error: "Invalid mnemonic provided." });
      }
    } else {
      mnemonic = generateMnemonic();
    }

    // Derive the seed from the mnemonic
    const seedBuffer = mnemonicToSeedSync(mnemonic);

    // Derive the key pair using the derived seed
    const path = `m/44'/501'/0'/0'`;
    const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));
    const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
    const keypair = Keypair.fromSecretKey(secretKey);

    // Encode keys to base58
    const privateKeyBase58 = bs58.encode(secretKey);
    const publicKeyBase58 = keypair.publicKey.toBase58();

    // Return the generated mnemonic, public key, and private key
    res.json({
      mnemonic,
      publicKey: publicKeyBase58,
      privateKey: privateKeyBase58,
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res
      .status(500)
      .json({ error: "Failed to create wallet. Please try again." });
  }
});


router.get("/get-balance-sol", async (req, res) => {
    try {
        const url = "https://solana-mainnet.g.alchemy.com/v2/gN9fcg5Y_oVUVjoNZPYTewKErIQo-uwp";
        const publicKey = req.query.publicKey as string;

        if (!publicKey) {
            return res.status(400).json({ error: "Public key is required" });
        }

        const response = await axios.post(url, {
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [publicKey]
        });

        const balance = response.data.result?.value || 0;
        const solBalance = balance / 1e9; 
        
        res.json({ publicKey, solBalance });
    } catch (error) {
        // console.error("Error getting balance:", error.message || error);
        res.status(500).json({ error: "Failed to get balance. Please try again." });
    }
});

router.get("/get-balance-eth", async(req, res)=>{
    try {
        // thi is a rpc server link by alkcemy 
        const url = "https://eth-mainnet.g.alchemy.com/v2/gN9fcg5Y_oVUVjoNZPYTewKErIQo-uwp";
        const publicKey = req.query.publicKey as string;

        if (!publicKey) {
            return res.status(400).json({ error: "Public key is required" });
        }

        const response = await axios.post(url, {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getBalance",
            params: [publicKey, "latest"]
        });

        // in this response we get value in hex string so we have to convert it onto number
        const balanceInWeiHex = response.data.result;
        // Convert the hex string to a BigNumber
        const balanceInWei = new BigNumber(balanceInWeiHex, 16);
        // Convert Wei to Ether by dividing by 1e18
        const ethBalance = balanceInWei.dividedBy(1e18).toString(10);
        
        res.json({ publicKey, ethBalance });
    } catch (error) {
        // console.error("Error getting balance:", error.message || error);
        res.status(500).json({ error: "Failed to get balance. Please try again." });
    }
})

export default router;
