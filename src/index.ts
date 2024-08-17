import express from "express";
import bodyParser from "body-parser";
import { indexRouter } from "./routes/indexRouter";
import cookieParser from "cookie-parser";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", indexRouter);

app.listen(3000, () => {
  console.log("express server started on port 3000");
});
