var result = document.querySelector("#result");
var dataresult = "";
var detail = document.querySelector("#detail");
let venueshow = document.querySelector("#venueshow");
let venuepage = document.querySelector("#venue");

async function detectLocation() {
  const detectLocation = document.querySelector("#detectlocation");
  const location = document.querySelector("#location");
  const lat = document.querySelector("#lat");
  const lng = document.querySelector("#lng");
  if (detectLocation.checked) {
    const response = await fetch("https://ipinfo.io/?token=68c7f3dcab1c20");
    const locationData = await response.json();

    location.style.display = "none";
    location.value = locationData.city;
    document.querySelector(".form-check-label").innerHTML = "";

    lat.value = locationData.loc.split(",")[0];
    lng.value = locationData.loc.split(",")[1];
  } else {
    lat.value = "";
    lng.value = "";
    location.style.display = "block";
  }
}

async function onSubmit() {
  venuepage.style.display = "none";
  detail.style.display = "none";
  //   venueshow.innerHTML = "";

  const keyword = document.querySelector("#keyword").value;
  const radius = document.querySelector("#distance").value;
  const category = document.querySelector("#category").value;
  const location = document.querySelector("#location").value;
  //console.log(location);
  let segmentId;
  //console.log(category);
  if (category === "Music") {
    segmentId = "KZFzniwnSyZfZ7v7nJ";
  } else if (category === "Sports") {
    segmentId = "KZFzniwnSyZfZ7v7nE";
  } else if (category === "Arts & Theatre") {
    segmentId = "KZFzniwnSyZfZ7v7na";
  } else if (category === "Film") {
    segmentId = "KZFzniwnSyZfZ7v7nn";
  } else if (category === "Miscellaneous") {
    segmentId = "KZFzniwnSyZfZ7v7n1";
  } else {
    segmentId = "";
  }

  const geoLocationRaw = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=AIzaSyBvWVitWsTI12gtv6Pa0llHKPNvDEWju_I`
  );
  const geoLocationData = await geoLocationRaw.json();
  console.log(geoLocationData);
  const latValue = geoLocationData.results[0].geometry.location.lat;
  const lngValue = geoLocationData.results[0].geometry.location.lng;
  const geoPoint = Geohash.encode(latValue, lngValue, 7);
  const response = await fetch(
    "/search?keyword=" +
      keyword +
      "&segmentId=" +
      segmentId +
      "&radius=" +
      radius +
      "&geoPoint=" +
      geoPoint,
    {
      method: "get",
    }
  );
  const responseData = await response.json();
  console.log(responseData);
  if (responseData.page.totalElements === 0) {
    result.innerHTML = '<p class="red">No records found!</p>';
  } else {
    datalist = responseData._embedded.events;
    datafill(datalist);
  }
}

function datafill(datalist) {
  let data =
    "<table id='table' cellspacing=0 cellpadding=0>" +
    "<tr>" +
    "<th>" +
    "Date" +
    "</th>" +
    "<th>" +
    "Icon" +
    "</th>" +
    "<th onclick='eventsSort()'>" +
    "Event" +
    "</th>" +
    "<th onclick='genreSort()'>" +
    "Genre" +
    "</th>" +
    "<th onclick='venueSort()'>" +
    "Venue" +
    "</th>" +
    "</tr>";

  for (let i = 0; i < datalist.length; i++) {
    data +=
      "<tr>" +
      "<td>" +
      "<p>" +
      datalist[i].dates.start.localDate +
      "</p>" +
      "<p>" +
      datalist[i].dates.start.localTime +
      "</p>" +
      "</td>" +
      "<td>" +
      "<img src='" +
      datalist[i].images[3].url +
      "'>" +
      "</td>" +
      "<td>" +
      "<a onclick='eventsDetail(\"" +
      datalist[i].id +
      "\")'>" +
      datalist[i].name +
      "</a>" +
      "</td>" +
      "<td>";
    if ("classifications" in datalist[i]) {
      data += datalist[i].classifications[0].segment.name;
    }
    data +=
      "</td>" +
      "<td>" +
      datalist[i]._embedded.venues[0].name +
      "</td>" +
      "</tr>";
  }
  result.innerHTML = data + "</table>";
  result.scrollIntoView(true);
}

function eventsSort() {
  const sortAsc = (a, b) => {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  };
  datalist.sort(sortAsc);
  datafill(datalist);
}
function genreSort() {
  const sortDesc = (a, b) => {
    return a.classifications[0].segment.name > b.classifications[0].segment.name
      ? -1
      : a.classifications[0].segment.name < b.classifications[0].segment.name
      ? 1
      : 0;
  };
  datalist.sort(sortDesc);
  datafill(datalist);
}
function venueSort() {
  const sortVenueDesc = (a, b) => {
    return a._embedded.venues[0].name > b._embedded.venues[0].name
      ? -1
      : a._embedded.venues[0].name < b._embedded.venues[0].name
      ? 1
      : 0;
  };
  datalist.sort(sortVenueDesc);
  datafill(datalist);
}

async function eventsDetail(id) {
  venuepage.style.display = "none";
  detail.style.display = "block";
  let url = "/detail?id=" + id;
  let res = await fetch(url, { method: "get" });
  let response = await res.json();

  document.querySelector("#detailname").innerHTML = response.name;
  document.querySelector("#detaildate").innerHTML =
    response.dates.start.localDate + " " + response.dates.start.localTime;

  // Artist
  if (response._embedded.attractions) {
    document.querySelector("#showart").style.display = "block";
    document.querySelector("#detailart").innerHTML =
      response._embedded.attractions[0].name;
    document.querySelector("#detailarthref").href =
      response._embedded.attractions[0].url;
  } else {
    document.querySelector("#showart").style.display = "none";
  }

  document.querySelector("#detailvenue").innerHTML =
    response._embedded.venues[0].name;

  let detailgenres = [];
  const classifications = response.classifications[0];

  if (
    "subGenre" in classifications &&
    classifications.subGenre.name !== "Undefined"
  ) {
    detailgenres.push(classifications.subGenre.name);
  }
  if (
    "genre" in classifications &&
    classifications.genre.name !== "Undefined"
  ) {
    detailgenres.push(classifications.genre.name);
  }
  if (
    "segment" in classifications &&
    classifications.segment.name !== "Undefined"
  ) {
    detailgenres.push(classifications.segment.name);
  }
  if (
    "subType" in classifications &&
    classifications.subType.name !== "Undefined"
  ) {
    detailgenres.push(classifications.subType.name);
  }
  if ("type" in classifications && classifications.type.name !== "Undefined") {
    detailgenres.push(classifications.type.name);
  }

  document.querySelector("#detailgenres").innerHTML = detailgenres.join(" | ");

  if ("priceRanges" in response) {
    document.querySelector("#showprice").style.display = "block";
    document.querySelector("#detailprice").innerHTML =
      response.priceRanges[0].min +
      "-" +
      response.priceRanges[0].max +
      response.priceRanges[0].currency;
  } else {
    document.querySelector("#showprice").style.display = "none";
  }

  if (response.dates.status.code == "onsale") {
    document.querySelector("#detailticket").style.backgroundColor = "green";
  } else if (response.dates.status.code == "offsale") {
    document.querySelector("#detailticket").style.backgroundColor = "red";
  } else if (response.dates.status.code == "canceled") {
    document.querySelector("#detailticket").style.backgroundColor = "black";
  } else {
    document.querySelector("#detailticket").style.backgroundColor = "orange";
  }
  document.querySelector("#detailticket").innerHTML =
    response.dates.status.code;
  document.querySelector("#detailbuy").href = response.url;

  if ("seatmap" in response) {
    document.querySelector("#detailimg").src = response.seatmap.staticUrl;
  } else {
    document.querySelector("#detailimg").src = "";
  }

  detail.scrollIntoView(true);
  venueshowfill(response._embedded.venues[0].name);
}

function venueshowfill(venuelist) {
  venueshow.style.display = "block"; // 隐藏venuebutton
  let venuebutton =
    "<div class='venueshow' onclick='venuelist(\"" +
    venuelist +
    "\")'>" +
    "<p>Show Venue Details</p>" +
    "<p>∨</p>" +
    "</div>";
  venueshow.innerHTML = venuebutton;
}

function venuelist(venuelist) {
  venueshow.style.display = "none"; // 隐藏venuebutton
  venuepage.style.display = "block";
  let url = "/venue?keyword=" + venuelist;
  fetch(url, {
    method: "get",
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      document.querySelector("#venuetitle").innerHTML =
        response._embedded.venues[0].name;
      document.querySelector("#venueaddress").innerHTML =
        "Address:" + response._embedded.venues[0].address.line1;
      document.querySelector("#venuecity").innerHTML =
        response._embedded.venues[0].city.name;
      document.querySelector("#venuecode").innerHTML =
        response._embedded.venues[0].postalCode;
      document.querySelector(
        "#maps"
      ).href = `https://www.google.com/maps/search/?api=1&query=${response._embedded.venues[0].name}`;
      document.querySelector("#venueall").href =
        response._embedded.venues[0].url;
      venuepage.scrollIntoView(true);
    });
}

function onClear() {
  document.querySelector("#keyword").value = "";
  document.querySelector("#distance").value = "";
  document.querySelector("#location").value = "";

  result.innerHTML = "";
  venuepage.style.display = "none";
  detail.style.display = "none";
  venueshow.innerHTML = "";
}
