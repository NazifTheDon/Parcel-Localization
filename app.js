const express = require("express");
const https = require("https");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const requestModule = require("request");
const fs = require("fs");

app.use(cors());
let accessToken;

const refreshAccessToken = () => {
  // Set up the options for the API call to refresh the access token
  const options = {
    hostname: "accounts.zoho.com",
    port: 443,
    path: "/oauth/v2/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  // Set up the body of the request
  const refreshToken =
    "1000.694e904d8c06a75321ebc752ac8e597e.ae6a2b1030eb2c83fca0c9f8c90170e3";
  const clientId = "1000.UQJ7KP5JKNHFJY601GOUOK2KAJOF4W";
  const clientSecret = "d01cf6e97a4538e1d97ffdfeeda5958fddbd087d21";
  const grantType = "refresh_token";
  const body = `refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}`;

  // Make the API call to refresh the access token
  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      // Parse the response data as JSON
      const tokenResponse = JSON.parse(data);
      // Extract the new access token from the response
      accessToken = tokenResponse.access_token;
      // Save the access token to a file
      console.log(accessToken);
      fs.writeFileSync("access_token.txt", accessToken);
    });
  });

  // Set the body of the request and send it
  req.write(body);
  req.end();
};

// Set up a timer to refresh the access token every hour
setInterval(refreshAccessToken, 3600000);

app.get("/api/tokens", (response) => {
  accessToken = fs.readFileSync("access_token.txt", "utf8");
  console.log(accessToken);
  // Make a request to the Zoho CRM API to get the leads data
  const options = {
    hostname: "www.zohoapis.com",
    port: 443,
    path: "/crm/v2/Leads",
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  };
  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      // Parse the response data as JSON
      const leads = JSON.parse(data);
      console.log(data);
      // Extract the parcel_id, zip_code, and lead_status for each lead
      const leadData = leads.data.map((lead) => ({
        parcel_id: lead.Parcel_ID,
        zip_code: lead.Zip_Code,
        lead_status: lead.Lead_Status,
      }));
      // Connect to the MongoDB database
      MongoClient.connect(
        "mongodb+srv://NazifTheDon:Aareyuok.123@map.fzvcuyl.mongodb.net/?retryWrites=true&w=majority",
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
          if (err) {
            console.error(err);
            response.send({ error: err });
            return;
          }
          // Insert the lead data into the "leads" collection in the database
          const db = client.db("map");
          db.collection("leads").insertMany(leadData, (insertErr, result) => {
            if (insertErr) {
              console.error(insertErr);
              response.send({ error: insertErr });
              return;
            }
            console.log(
              `Inserted ${result.insertedCount} documents into the "leads" collection`
            );
            // Iterate over the lead data and make a request to the reportallusa API for each lead
            leadData.forEach((lead) => {
              if (lead.parcel_id !== null || lead.zip_code !== null) {
                console.log(lead.parcel_id);
                console.log(lead.zip_code);
                // Use the request module to make a request to the reportallusa API
                requestModule(
                  `https://reportallusa.com/api/parcels?client=FXgevQoNSg&v=5&region=${lead["Zip_Code"]}&parcel_id=${lead["Parcel_ID"]}`,
                  (error, reportallusaRes, body) => {
                    if (error) {
                      console.error(error);
                      return;
                    }
                    console.log(body);
                    // Extract the latitude and longitude from the response
                    let lat = parseFloat(
                      JSON.parse(body)["results"][0]["latitude"]
                    );
                    let lng = parseFloat(
                      JSON.parse(body)["results"][0]["longitude"]
                    );
                    // Update the lead document in the database with the latitude and longitude
                    db.collection("leads").updateOne(
                      {
                        parcel_id: lead.parcel_id,
                        zip_code: lead.zip_code,
                        lead_status: lead.lead_status,
                      },
                      { $set: { latitude: lat, longitude: lng } },
                      (updateErr, updateResult) => {
                        if (updateErr) {
                          console.error(updateErr);
                        } else {
                          console.log(
                            `Updated ${updateResult.modifiedCount} documents`
                          );
                        }
                      }
                    );
                  }
                );
              }
            });
            client.close();
          });
          response.send({ message: "Successfully inserted lead data" });
        }
      );
    });
  });
  req.end();
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
