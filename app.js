const express = require("express");
const https = require("https");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const requestModule = require("request");

app.use(cors());
app.get("/api/tokens", (request, response) => {
  // Make a request to the Zoho CRM API to get the leads data
  const options = {
    hostname: "www.zohoapis.com",
    port: 443,
    path: "/crm/v2/Leads",
    method: "GET",
    headers: {
      Authorization:
        "Zoho-oauthtoken 1000.83e67e919a870af9a5e0bf76814bf48b.7314f9d99db35d09adbca4c78cee07e3",
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
