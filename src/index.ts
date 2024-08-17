import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import IndexRouter from "./routes/IndexRouter"
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json())


app.use("/api/v1", IndexRouter);


app.listen(3000, () => {
  console.log("express server started on port 3000");
});
