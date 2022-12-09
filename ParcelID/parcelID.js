let parcelIDExample = 20134200210010000;
let map;
let lat;
let lng;
let title;

let input = document.getElementById("input");
input.addEventListener("change", function () {
  readXlsxFile(input.files[0]).then(function (data) {
    let i = 0;
    data.map((row, index) => {
      if (i === 0) {
        let table = document.getElementById("tbl-data");
        generateTableHead(table, row);
      }
      if (i > 0) {
        let table = document.getElementById("tbl-data");
        generateTableRows(table, row);
      }
    });
  });
});

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
