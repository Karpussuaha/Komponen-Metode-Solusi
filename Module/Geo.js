// Deklarasikan variabel global
let maps = {
  map: null, // Peta untuk ACO
  mapLNS: null, // Peta untuk LNS
  DistributionPoints: null,
};
let mapInitialized = {
  map: false, // Flag untuk memastikan peta ACO hanya diinisialisasi sekali
  mapLNS: false, // Flag untuk memastikan peta LNS hanya diinisialisasi sekali
  DistributionPoints: false,
};
let markers = {
  map: L.markerClusterGroup(), // Inisialisasi MarkerClusterGroup untuk ACO
  mapLNS: L.markerClusterGroup(), // Inisialisasi MarkerClusterGroup untuk LNS
  DistributionPoints: L.layerGroup(), // Gunakan L.layerGroup untuk sebaran tanpa cluster
};

// Objek untuk menyimpan warna rute berdasarkan ID
const routeColors = {
  1: "#0000FF", // Biru
  2: "#FF0000", // Merah
  3: "#008000", // Hijau
  4: "#A52A2A", // Cokelat
  5: "#FFA500", // Orange
  6: "#FFFF00", // Kuning
  7: "#800080", // Ungu
};

// Fungsi untuk menginisialisasi peta
function initializeMap(mapId) {
  if (mapInitialized[mapId] || maps[mapId]) return Promise.resolve();

  return new Promise((resolve) => {
    const mapElement = document.getElementById(mapId);
    if (!mapElement) {
      console.error("Map element not found.");
      resolve();
      return;
    }

    maps[mapId] = L.map(mapId).setView([-0.0272, 109.3421], 13); // Default Kota Pontianak

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 10,
    }).addTo(maps[mapId]);

    // Menambahkan kontrol fullscreen
    maps[mapId].addControl(
      new L.Control.Fullscreen({
        title: {
          false: "View Fullscreen", // Teks saat peta tidak fullscreen
          true: "Exit Fullscreen", // Teks saat peta dalam keadaan fullscreen
        },
      })
    );

    // Menambahkan marker cluster dan layer peta lainnya
    maps[mapId].addLayer(markers[mapId]);
    mapInitialized[mapId] = true;

    maps[mapId].addLayer(markers[mapId]);
    mapInitialized[mapId] = true;

    const resizeObserver = new ResizeObserver(() => {
      maps[mapId].invalidateSize();
    });
    resizeObserver.observe(mapElement);
    maps[mapId].invalidateSize();

    console.log("Initialize map:", mapId);
    resolve();
  });
}

// Fungsi untuk menampilkan section yang dipilih
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => (section.style.display = "none"));

  const selectedSection = document.getElementById(sectionId);
  selectedSection.style.display = "block";

  if (sectionId === "geoMapSection" || sectionId === "geoMapSectionLNS" || sectionId === "SpatialDistribution") {
      const mapId = sectionId === "geoMapSection" 
          ? "map" 
          : sectionId === "geoMapSectionLNS" 
          ? "mapLNS" 
          : "DistributionPoints";

      initializeMap(mapId).then(() => {
          maps[mapId].invalidateSize();
      });
  }
}

// Fungsi yang dijalankan setelah konten halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  showSection("setup-data");

  if (document.getElementById("geoMapSection").style.display !== "none") {
    initializeMap("map");
  }
  if (document.getElementById("geoMapSectionLNS").style.display !== "none") {
    initializeMap("mapLNS");
  }
  if (document.getElementById("SpatialDistribution").style.display !== "none") {
    initializeMap("DistributionPoints");
  }
});

// Fungsi untuk mengambil data dari tabel dan menampilkan marker
async function displayMarkers(mapId) {
  const map = maps[mapId];
  const markerCluster = markers[mapId];
  if (!map || !markerCluster) {
    console.error("Map is not initialized or markers are not ready.");
    return;
  }

  const { depot, customers } = getDataFromTable();
  markerCluster.clearLayers();

  if (depot && depot.latitude && depot.longitude) {
    const depotMarker = L.divIcon({
      className: "square-marker",
      html: `<div>${depot.locationID}</div>`,
    });
    L.marker([depot.latitude, depot.longitude], { icon: depotMarker })
      .addTo(markerCluster)
      .bindPopup(`<strong>Depot</strong><br>${depot.address}`);
  }

  for (const customer of customers) {
    if (customer.latitude && customer.longitude) {
      const customerMarker = L.divIcon({
        className: "square-marker",
        html: `<div>${customer.locationID}</div>`,
      });
      L.marker([customer.latitude, customer.longitude], {
        icon: customerMarker,
      })
        .addTo(markerCluster)
        .bindPopup(
          `<strong>Customer ${customer.locationID}</strong><br>${customer.address}`
        );
    }
  }
}

function createDynamicControl(routeLayers, map) {
  // Cek apakah kontrol sudah ada di map
  if (map.routeControl) {
    map.removeControl(map.routeControl); // Hapus kontrol lama sebelum menambahkan yang baru
  }

  const control = L.control({ position: "topright" });

  control.onAdd = function () {
    const div = L.DomUtil.create("div", "route-control");
    div.style.background = "transparan";
    div.style.padding = "10px";

    const title = L.DomUtil.create("div", "", div);
    title.innerHTML = "<b>Filter Routes</b>";
    title.style.marginBottom = "10px";

    // Tambahkan tombol untuk setiap routeID
    Object.keys(routeLayers).forEach((routeID) => {
      const button = L.DomUtil.create("button", "", div);
      button.textContent = `Route ${routeID}`;
      button.style.margin = "5px";
      button.style.backgroundColor = routeColors[routeID] || "#007bff";
      button.style.color = "white";
      button.style.border = "none";
      button.style.padding = "5px 10px";
      button.style.cursor = "pointer";
      button.style.borderRadius = "3px";

      // Event listener untuk menampilkan atau menyembunyikan rute
      L.DomEvent.on(button, "click", () => {
        const layer = routeLayers[routeID];
        if (map.hasLayer(layer)) {
          map.removeLayer(layer); // Sembunyikan layer
        } else {
          map.addLayer(layer); // Tampilkan layer
        }
      });
    });

    return div;
  };

  // Simpan referensi kontrol ke map agar dapat dicegah duplikasi
  map.routeControl = control;
  control.addTo(map);
}



// Fungsi untuk menggambar rute
async function drawRoutes(routes, mapId) {
  const map = maps[mapId];
  if (!map) {
    console.error("Map is not initialized.");
    return;
  }

  if (!routes || routes.length === 0) {
    console.warn("No routes data available.");
    return;
  }

  const algorithmType = mapId === "map" ? "ACO" : "LNS";
  console.log(
    `Processing routes for ${algorithmType}. Total routes: ${routes.length}`
  );

  const routeStreetNames = []; // Array untuk menyimpan nama jalan per rute
  const routeTravelTimes = []; // Array untuk menyimpan waktu perjalanan per rute
  const routeLayers = {}; // Objek untuk menyimpan layer per routeID

  // Proses setiap rute satu per satu
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    if (!route || route.length === 0) {
      console.warn(`Route ${index + 1} is empty.`);
      continue;
    }

    const latlngs = route
      .filter((location) => location && location.latitude && location.longitude)
      .map((location) => [location.latitude, location.longitude]);

    if (latlngs.length === 0) {
      console.warn(`Route ${index + 1} does not contain valid coordinates.`);
      continue;
    }

    const routeID = route[0]?.routeID || index + 1;
    const routeColor = routeColors[routeID] || "#007bff";

    // Buat urutan ID lokasi dengan alamat dari route
    const routeSequence = route.map((location) => ({
      id: location.locationID,
      address: location.address || `Address for ${location.locationID}`, // Ambil alamat dari lokasi atau berikan default
    }));

    // Konversi koordinat ke string untuk OSRM
    const coordinatesString = latlngs
      .map((coord) => coord.reverse().join(","))
      .join(";");
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&steps=true&geometries=geojson`;

    try {
      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        console.warn(
          `No route data available from OSRM response for route ${routeID}.`
        );
        continue;
      }

      let coordinates = data.routes[0].geometry.coordinates.map((coord) =>
        coord.reverse()
      );

      // Mendapatkan data jalan dengan tag 'highway=secondary' menggunakan Overpass API
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];way[highway=secondary](around:50,${latlngs[0][1]},${latlngs[0][0]});out;`;
      const overpassResponse = await fetch(overpassUrl);
      const overpassData = await overpassResponse.json();

      // Filter koordinat yang berada pada jalan 'highway=secondary'
      let secondaryCoordinates = overpassData.elements
        .filter((element) => element.type === "way")
        .map((way) => way.nodes)
        .flat()
        .map((nodeId) => {
          const node = overpassData.elements.find((elem) => elem.type === "node" && elem.id === nodeId);
          return [node.lat, node.lon];
        });

      // Gabungkan koordinat OSRM dan Overpass (secondary) jika ada
      let combinedCoordinates = [...coordinates, ...secondaryCoordinates];

      // Array untuk menyimpan nama jalan dari steps di dalam rute saat ini
      const streetNames = [];
      data.routes[0].legs.forEach((leg) => {
        leg.steps.forEach((step) => {
          if (step.maneuver && step.name && step.geometry) {
            // Ambil koordinat dari geometri langkah
            const stepCoordinates = step.geometry.coordinates.map((coord) =>
              coord.reverse()
            );

            // Periksa apakah langkah memiliki koordinat yang sesuai dengan polyline
            const isPartOfPolyline = stepCoordinates.some((stepCoord) =>
              combinedCoordinates.some(
                (polyCoord) =>
                  Math.abs(polyCoord[0] - stepCoord[0]) < 0.0001 &&
                  Math.abs(polyCoord[1] - stepCoord[1]) < 0.0001
              )
            );

            // Tambahkan nama jalan jika langkah sesuai dengan polyline
            if (isPartOfPolyline) {
              streetNames.push(step.name);
            }
          }
        });
      });


      // Menyimpan urutan ID lokasi dengan alamat dan nama jalan dalam bentuk objek
      routeStreetNames.push({
        routeId: routeID,
        routeSequence: routeSequence, // Menyimpan ID dan alamat lokasi
        streetNames: [...new Set(streetNames)], // Menghapus duplikasi nama jalan
      });

      // Hitung waktu perjalanan berdasarkan kecepatan 35 km/jam
      const distanceKm = data.routes[0].distance / 1000; // Konversi meter ke kilometer
      const speedKmPerHour = 35; // Kecepatan dalam km/jam
      const travelTimeHours = distanceKm / speedKmPerHour; // Waktu dalam jam

      // Pisahkan jam dan menit
      const hours = Math.floor(travelTimeHours);
      const minutes = Math.round((travelTimeHours - hours) * 60);

      // Simpan waktu perjalanan dalam array sebagai objek
      routeTravelTimes.push({
        routeId: routeID,
        travelTime: `${hours} jam ${minutes} menit`,
      });

      // Gambar rute di peta
      const polyline = L.polyline(combinedCoordinates, {
        color: routeColor,
        weight: 3,
        opacity: 0.7,
        lineJoin: "round",
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      map.setZoom(13);

      const { depot } = getDataFromTable();

      if (depot && depot.latitude && depot.longitude) {
        // Jika depot tersedia, pusatkan peta ke depot
        maps[mapId].setView([depot.latitude, depot.longitude], 13);
      } else {
        // Jika depot tidak tersedia, gunakan default koordinat
        maps[mapId].setView([-0.0272, 109.3421], 13);
      }

      routeLayers[routeID] = polyline.addTo(map); // Simpan layer ke objek
      createDynamicControl(routeLayers, map);
    } catch (error) {
      console.error(
        `Error fetching route from OSRM for route ${routeID}:`,
        error
      );
    }
  }

  // Menampilkan urutan lokasi dengan alamat dan nama jalan per rute di konsol dalam format array objek
  console.log(`Street Route for ${algorithmType}:`, routeStreetNames);

  // Menampilkan waktu perjalanan per rute di konsol sebagai array objek
  console.log(`Travel Time Route for ${algorithmType}:`, routeTravelTimes);
}

// Fungsi untuk menjalankan CVRP dan menampilkan hasil di peta
async function execute(mapId) {
  await initializeMap(mapId);

  if (!maps[mapId]) {
      console.error(`Map with ID ${mapId} is not initialized.`);
      return;
  }

  if (mapId === "DistributionPoints") {
    // Dapatkan data depot dan customers dari tabel
    const { depot, customers } = getDataFromTable();
    markers[mapId].clearLayers(); // Bersihkan semua marker sebelumnya dari layer

    // Tambahkan marker untuk depot (jika ada)
    if (depot && depot.latitude && depot.longitude) {
        L.marker([depot.latitude, depot.longitude])
            .addTo(markers[mapId]) // Tambahkan ke layerGroup untuk DistributionPoints
            .bindPopup(`<strong>Depot</strong><br>${depot.address}`);
    }

    // Tambahkan marker untuk setiap customer
    for (const customer of customers) {
        if (customer.latitude && customer.longitude) {
            L.marker([customer.latitude, customer.longitude])
                .addTo(markers[mapId]) // Tambahkan ke layerGroup untuk DistributionPoints
                .bindPopup(
                    `<strong>Customer ${customer.locationID}</strong><br>${customer.address}`
                );
        }
    }

    // Tambahkan layerGroup ke peta
    maps[mapId].addLayer(markers[mapId]);

    // Atur tampilan peta (pusatkan ke depot jika ada, atau default)
    if (depot && depot.latitude && depot.longitude) {
        maps[mapId].setView([depot.latitude, depot.longitude], 15);
    } else {
        maps[mapId].setView([-0.0272, 109.3421], 13);
    }
    return;
  }

  // Eksekusi algoritma berdasarkan mapId
  const result =
      mapId === "map" ? window.runAlgorithmACO() : window.runAlgorithmLNS();

  if (!result || !result.bestRoutes) return;

  await displayMarkers(mapId);
  await drawRoutes(result.bestRoutes, mapId);
}


// Event listener untuk tombol eksekusi
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector("button[onclick='Execute()']")
    .addEventListener("click", async function () {
      await execute("map");
      await execute("mapLNS");
      await execute("DistributionPoints");
    });
});
