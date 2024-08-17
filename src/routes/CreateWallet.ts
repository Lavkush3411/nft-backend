import { Router } from "express";
import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const CreateWallet = Router();

CreateWallet.post("/create", (req, res) => {
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
        res.status(500).json({ error: "Failed to create wallet. Please try again." });
    }
});

export default CreateWallet;
