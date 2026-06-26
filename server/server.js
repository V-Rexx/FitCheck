const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const analyzeRoute = require("./routes/analyze");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Analyzer API is running"));
app.use("/", analyzeRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));