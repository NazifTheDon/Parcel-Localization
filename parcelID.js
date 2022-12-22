let map;

async function getLeads() {
  // Make a request to the backend API to get the lead data
  const response = await fetch("http://localhost:3000/api/tokens");
  const data = await response.json();
  console.log(data); // log the data to debug the issue
  return data;
}

async function initMap() {
  // Get the lead data from the backend API
  const leadData = await getLeads();
  if (Array.isArray(leadData)) {
    // check if leadData is an array
    // Initialize the map with a default center and zoom level
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 40.052059, lng: -86.470642 },
      zoom: 5,
    });
    // Iterate over the lead data and add a marker for each lead
    leadData.forEach((lead) => {
      if (lead.latitude && lead.longitude) {
        // Set the marker options based on the lead status
        let markerOption = {
          position: { lat: lead.latitude, lng: lead.longitude },
          map: map,
        };
        if (lead.lead_status === "Contacted") {
          markerOption.icon =
            "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
        } else if (lead.lead_status === "Left Voicemail") {
          markerOption.icon =
            "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        }
        // Add the marker to the map
        let marker = new google.maps.Marker(markerOption);
        marker.setMap(map);
      }
    });
  } else {
    console.error("leadData is not an array");
  }
}

window.initMap = initMap;
