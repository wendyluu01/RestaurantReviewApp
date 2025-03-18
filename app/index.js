const express = require("express");
const config = require("config");
const winston = require("winston");
const mongoose = require("mongoose");
const { Pool } = require("pg");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "./log/all.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});
winston.add(logger);

const app = express();
const port = process.env.port || 3030;
const pool = new Pool(config.get("postgresql"));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

mongoose
  .connect(config.get("mongodb.url"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    winston.info("MongoDB - initialized");
  })
  .catch(() => {
    winston.error("MongoDB - error during initialization");
  });

mongoose.connection.on("connected", () => {
  winston.info("Mongoose connected!");
});

mongoose.connection.on("disconnected", () => {
  winston.error("Mongoose disconnected!");
});

app.get("/", (req, res) => {
  res.json({ success: true });
});

app.use("/mongodb", require("./routes/mongodb"));
app.use("/postgres", require("./routes/postgres"));
app.use("/docs", require("./routes/docs"));

app.listen(port, () => winston.info(`App listening at this port : ${port}`));