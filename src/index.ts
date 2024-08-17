import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import CreateWallet from "./routes/CreateWallet"
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json())


app.use("/api/v1", CreateWallet);

app.listen(3000, () => {
  console.log("express server started on port 3000");
});
