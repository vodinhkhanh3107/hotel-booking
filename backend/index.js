const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const database = require("./config/database");
const routerAdmin = require("./api/v1/routes/admin/index.route");
const routerClient = require("./api/v1/routes/client/index.route");
const routerPartner = require("./api/v1/routes/partner/index.route");

const cron = require("./config/cron");

// cors
const cors = require("cors");

app.use(cors({
    origin: process.env.URL_FRONTEND,
    method: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["Content-Type","Authorization"]
}))

// body parser
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());


database.connect();

cron.cronPromotion();
cron.cronRoom();


routerAdmin(app);
routerClient(app);
routerPartner(app);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

