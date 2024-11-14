import express from "express";
import morgan from "morgan";
import path from "path";
import routes from "./routes/index.js";
import cors from "cors";
import db from "./models/index.js";
import PurchaseProcessor from "./util/purchaseProcessor.js";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const purchaseProcessor = new PurchaseProcessor([process.env.STEAM_ID]);

if (process.env.DEBUG) {
  console.debug("Using env variables:");
  const env = Object.keys(process.env).map(k => {
    return `${k}: ${process.env[k]}`;
  });
  console.debug(env.join('\n'));
}

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined'))

app.use('/api', routes)

const PORT = process.env.PORT || 30000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    db.mongoose
    .connect(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
      authSource: "admin"
    })
    .then(() => {
      console.log("Connected to the database!");
      if (!process.env.API_ONLY) {
        purchaseProcessor.start();
      }
    })
    .catch(err => {
      console.log("Cannot connect to the database!", err);
      process.exit();
    });
});