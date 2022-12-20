const express = require("express");
const https = require("https");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/tokens", (request, response) => {
  const options = {
    hostname: "www.zohoapis.com",
    port: 443,
    path: "/crm/v2/Leads",
    method: "GET",
    headers: {
      Authorization:
        "Zoho-oauthtoken 1000.bdf3c96958649c5d128a33116b3f9479.af8782e9f4d0c5c5b25491ee55032fe0",
    },
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      response.send(data);
    });
  });

  req.on("error", (error) => {
    console.error(error);
    response.send(error);
  });

  req.end();
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
