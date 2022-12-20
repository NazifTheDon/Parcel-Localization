let map;
let info;

async function getTokens() {
  const response = await fetch("http://localhost:3000/api/tokens");
  const data = await response.json();
  return data["data"];
}

async function initMap() {
  info = await getTokens();
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.052059, lng: -86.470642 },
    zoom: 5,
  });
  for (let i = 0; i < info.length; i++) {
    if (info[i]["Parcel_ID"] !== null || info[i]["Zip_Code"] !== null) {
      console.log(info[i]["Parcel_ID"]);
      console.log(info[i]["Zip_Code"]);

      const request = new XMLHttpRequest();
      request.open(
        "GET",
        `https://reportallusa.com/api/parcels?client=FXgevQoNSg&v=5&region=${info[i]["Zip_Code"]}&parcel_id=${info[i]["Parcel_ID"]}`
      );
      request.send();
      request.onload = () => {
        if (request.status === 200) {
          //title = JSON.parse(request.response)["results"][0]["parcel_id"];
          let lat = parseFloat(
            JSON.parse(request.response)["results"][0]["latitude"]
          );
          let lng = parseFloat(
            JSON.parse(request.response)["results"][0]["longitude"]
          );

          let markerOption = {
            position: { lat: lat, lng: lng },
            map: map,
          };
          let marker = new google.maps.Marker(markerOption);
          marker.setMap(map);
        } else {
          console.log(`error ${request.status}`);
        }
      };
    }
  }
}

window.initMap = initMap;
