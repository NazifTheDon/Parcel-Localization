let parcelIDExample = 20134200210010000;
let map;
let lat;
let lng;
let title;

// let input = document.getElementById("input");
// input.addEventListener("change", function () {
//   readXlsxFile(input.files[0]).then(function (data) {
//     let i = 0;
//     data.map((row, index) => {
//       if (i === 0) {
//         let table = document.getElementById("tbl-data");
//         generateTableHead(table, row);
//       }
//       if (i > 0) {
//         let table = document.getElementById("tbl-data");
//         generateTableRows(table, row);
//       }
//     });
//   });
// });

async function getTokens() {
  try {
    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&client_id=1000.VUMOJ02VDJNP7NZXRPAR3ZDIBMIGJO&client_secret=10bcc88bd47ed981ece5faa3dcc058d6c8894c65b7&code=1000.a37ee2b77486eec958c379acab3d5948.1cf87f66f5a708219688a9c2b95f471c`,
    });
    const data = await response.json();

    // extract the access and refresh tokens from the response data
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    // do something with the access and refresh tokens
    console.log(accessToken, refreshToken);
  } catch (error) {
    // handle any errors that occur during the fetch request
    console.error(error);
  }
}

getTokens();

function initMap() {
  const request = new XMLHttpRequest();
  request.open(
    "GET",
    `https://reportallusa.com/api/parcels?client=FXgevQoNSg&v=5&region=99347&parcel_id=20134200210010000`
  );
  request.send();
  request.onload = () => {
    if (request.status === 200) {
      title = JSON.parse(request.response)["results"][0]["parcel_id"];
      lat = parseFloat(JSON.parse(request.response)["results"][0]["latitude"]);
      lng = parseFloat(JSON.parse(request.response)["results"][0]["longitude"]);
      console.log(lat, lng);

      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 40.052059, lng: -86.470642 },
        zoom: 5,
      });

      let markerOption = {
        position: { lat: lat, lng: lng },
        map: map,
      };
      let marker = new google.maps.Marker(markerOption);
    } else {
      console.log(`error ${request.status}`);
    }
  };
}

window.initMap = initMap;
