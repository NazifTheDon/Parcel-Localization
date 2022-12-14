//let parcelIDExample = 20134200210010000;
let map;
let lat;
let lng;
let title;

function getTokens() {
  fetch("https://www.zohoapis.com/crm/v2/Leads", {
    method: "GET",
    headers: {
      Authorization:
        "Zoho-oauthtoken 1000.6378758ecbb5792dcc5971f142b7b33d.3a896af072dbe06f2838761fb87efa75",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
}

// function getTokens() {
//   const xhr = new XMLHttpRequest();
//   xhr.open("POST", "https://accounts.zoho.com/oauth/v2/token", true);
//   xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//   xhr.onload = function () {
//     if (xhr.status === 200) {
//       const response = JSON.parse(xhr.responseText);
//       const accessToken = response.access_token;
//       const refreshToken = response.refresh_token;
//       console.log(accessToken, refreshToken);
//     } else {
//       console.error(xhr.statusText);
//     }
//   };
//   xhr.onerror = function () {
//     console.error(xhr.statusText);
//   };
//   xhr.send(
//     `grant_type=authorization_code&client_id=1000.VUMOJ02VDJNP7NZXRPAR3ZDIBMIGJO&client_secret=10bcc88bd47ed981ece5faa3dcc058d6c8894c65b7&redirect_uri=http://welcome/yourcallback&code=1000.ea5300e22c76d92ba076c741af2626bc.be477e41bca19d687ef61c5984bda5e9`
//   );
// }

//getTokens();

function initMap() {
  getTokens();
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
