import {Router} from "express";
import WalletController from "../controllers/WalletController";

const IndexRouter = Router();

IndexRouter.use("/wallet", WalletController);

export default IndexRouter;