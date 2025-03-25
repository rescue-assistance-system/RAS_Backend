import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import corsOptions from "./config/cors-option.js";

import initApiController from "./controller/index.js";
import handleGlobalError from './middleware/global-error.middleware.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors(corsOptions));
app.set('trust proxy', true)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));

app.use("/cron-job", express.Router().get('/', (req, res, next) => {
    res.status(200).json({ message: "Secret path" });
}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

initApiController(app);

app.all('*', (req, res) => {
    res.status(400).json({error: 'This route doesnt exist, check for the request type (GET/POST/PUT/DELETE) or the route itself'});
});

handleGlobalError(app);

app.listen(PORT, () => console.log(`Server running on  http://localhost:${PORT}`));
