class LNS {
  constructor(depot, customers, vehicleCapacity, numVehicles, maxIterations) {
    this.depot = depot; //Titik lokasi pusat distribusi yang menjadi titik awal dan akhir dari rute
    this.customers = customers; //Array yang berisi objek pelanggan
    this.vehicleCapacity = vehicleCapacity; //Kapasitas maksimum kendaraan dalam satuan unit pengiriman
    this.numVehicles = numVehicles; //Jumlah kendaraan yang tersedia untuk pengiriman
    this.maxIterations = maxIterations; //Jumlah iterasi dalam algoritma optimasi untuk mencari solusi terbaik
  }

  // Fungsi untuk menginisialisasi seed
  initializeRandomSeed(seed) {
    Math.seedrandom(seed);  // Mengatur seed untuk Math.random()
  }

  calculateDistance(point1, point2) {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = this.degreesToRadians(point2.latitude - point1.latitude);
    const dLng = this.degreesToRadians(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(point1.latitude)) *
        Math.cos(this.degreesToRadians(point2.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam kilometer
  }

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  initializeSolution() {
    let routes = [];
    let remainingCustomers = [...this.customers];
    let vehicleIndex = 0; // Indeks kendaraan

    while (remainingCustomers.length > 0) {
        let route = [this.depot]; // Mulai dari depot
        let currentLoad = 0;

        while (remainingCustomers.length > 0) {
            let customer = remainingCustomers[0];

            // Tambahkan ke rute jika kapasitas mencukupi
            if (currentLoad + customer.demand <= this.vehicleCapacity) {
                route.push(customer);
                currentLoad += customer.demand;
                remainingCustomers.shift();
            } else {
                break; // Jika kapasitas penuh, berhenti menambahkan ke rute ini
            }
        }

        route.push(this.depot); // Kembali ke depot
        routes.push(route);

        // Rotasi ke kendaraan berikutnya
        vehicleIndex = (vehicleIndex + 1) % this.numVehicles;
    }

    return routes;
  }


  calculateRouteDistance(route) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += this.calculateDistance(route[i], route[i + 1]);
    }
    return totalDistance;
  }

  calculateRouteDemand(route) {
    return route
      .slice(1, -1) // Mengabaikan depot di awal dan akhir
      .reduce((total, customer) => total + customer.demand, 0);
  }

  destroySolution(routes) {
    const removedCustomers = [];

    // Menghancurkan 30% dari total pelanggan
    const numToRemove = Math.floor(this.customers.length * 0.3);
    for (let i = 0; i < numToRemove; i++) {
      const routeIndex = Math.floor(Math.random() * routes.length);
      const customerIndex =
        Math.floor(Math.random() * (routes[routeIndex].length - 2)) + 1; // Tidak termasuk depot
      const removedCustomer = routes[routeIndex].splice(customerIndex, 1)[0];
      removedCustomers.push(removedCustomer);
    }
    return removedCustomers;
  }

  repairSolution(routes, removedCustomers) {
    for (let customer of removedCustomers) {
      let bestRouteIndex = -1;
      let bestPosition = -1;
      let bestDistanceIncrease = Infinity;

      routes.forEach((route, routeIndex) => {
        // Pastikan tidak melebihi kapasitas kendaraan
        if (
          this.calculateRouteDemand(route) + customer.demand <=
          this.vehicleCapacity
        ) {
          for (let i = 1; i < route.length; i++) {
            let newRoute = [...route];
            newRoute.splice(i, 0, customer); // Sisipkan pelanggan
            const newDistance = this.calculateRouteDistance(newRoute);
            const distanceIncrease =
              newDistance - this.calculateRouteDistance(route);

            // Memperbarui posisi terbaik jika jarak baru lebih baik
            if (distanceIncrease < bestDistanceIncrease) {
              bestDistanceIncrease = distanceIncrease;
              bestRouteIndex = routeIndex;
              bestPosition = i;
            }
          }
        }
      });

      if (bestRouteIndex !== -1) {
        // Menyisipkan pelanggan pada posisi terbaik
        routes[bestRouteIndex].splice(bestPosition, 0, customer);
      }
    }
    return routes;
  }
  
  runAlgorithm() {
    const startTime = performance.now(); // Mulai penghitungan waktu

    let bestRoutes = [];
    let bestDistances = [];
    let totalDemands = [];
    let bestDistancesPerIterationLNS = []; // Array untuk menyimpan jarak terbaik di setiap iterasi
    let groupedDistancesLNS = []; // Array untuk menyimpan data dalam rentang iterasi

    // Proses iterasi algoritma
    let initialRoutes = this.initializeSolution();
    let initialDistances = initialRoutes.map((route) =>
      this.calculateRouteDistance(route)
    );
    let initialDemands = initialRoutes.map((route) =>
      this.calculateRouteDemand(route)
    );

    // Inisialisasi seed
    this.initializeRandomSeed(12345);  // Set seed dengan nilai tertentu

    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      let currentRoutes = JSON.parse(JSON.stringify(initialRoutes));
      let removedCustomers = this.destroySolution(currentRoutes);
      let repairedRoutes = this.repairSolution(currentRoutes, removedCustomers);
      let currentDistances = repairedRoutes.map((route) =>
        this.calculateRouteDistance(route)
      );
      let currentDemands = repairedRoutes.map((route) =>
        this.calculateRouteDemand(route)
      );

      // Simpan rute terbaik berdasarkan jarak terpendek
      const currentTotalDistance = currentDistances.reduce((a, b) => a + b, 0);
      const initialTotalDistance = initialDistances.reduce((a, b) => a + b, 0);

      if (currentTotalDistance < initialTotalDistance) {
        bestRoutes = repairedRoutes;
        bestDistances = currentDistances;
        totalDemands = currentDemands;
        initialDistances = currentDistances; // Update jarak awal ke yang baru
      }

      // Simpan jarak terbaik ke array per iterasi
      const bestDistanceSoFar = initialDistances.reduce((a, b) => a + b, 0);
      bestDistancesPerIterationLNS.push(bestDistanceSoFar);
      // Grupkan jarak berdasarkan rentang iterasi setiap 500 iterasi
      if ((iteration + 1) % 500 === 0 || iteration === this.maxIterations - 1) {
        groupedDistancesLNS.push([...bestDistancesPerIterationLNS]); // Salin data
        
      }
    
    }

    this.displayResults(bestRoutes, bestDistances, totalDemands);

    // Setelah semua perhitungan selesai, akhiri penghitungan waktu
    const endTime = performance.now();
    const computationTimeMs = (endTime - startTime).toFixed(3); // Dalam milidetik dengan 3 angka di belakang koma
    const computationTimeSec = (computationTimeMs / 1000).toFixed(3); // Konversi ke detik dengan 3 angka di belakang koma

    // Tampilkan waktu komputasi di console
    console.log(
      `LNS Computation Time: ${computationTimeMs} ms or ${computationTimeSec} s`
    );

    // Tampilkan array jarak terbaik per iterasi di console
    console.log("Best Distances Per Iteration LNS:", groupedDistancesLNS);

    return {
      bestRoutes: bestRoutes,
      bestDistances: bestDistances,
      totalDemands: totalDemands,
      bestDistancesPerIterationLNS: bestDistancesPerIterationLNS, // Return tambahan untuk analisis
    };
    
  }

  displayResults(routes, distances, demands) {
    const resultdataLNSContainer = document.getElementById("resultdataLNS");
    let resultdataLNSHTML = "";

    routes.forEach((route, index) => {
      const routeIDs = route.map((location) => location.locationID).join("-");
      const distance = distances[index].toFixed(8);
      const convertedDistanceKm = `${distances[index].toFixed(2)} Kilometers`;
      const convertedDistanceMeters = `${(distance * 1000).toFixed(0)} Meters`;
      const totalDemand = demands[index];

      // Gunakan modulo untuk memastikan nomor kendaraan sesuai
      const vehicleNumber = (index % this.numVehicles) + 1;

      resultdataLNSHTML += `
            <div class="resultdataLNS-item">
                <h2>Details</h2>
                <p>Vehicle ${vehicleNumber} to Route ${index + 1}</p>
                <p>Route: ${routeIDs}</p>
                <p>Best Distances: ${distance} km or (${convertedDistanceKm}) or (${convertedDistanceMeters})</p>
                <p>Total Delivery Request ${index + 1}: ${totalDemand}</p>
                <p>Routes for Vehicles ${index + 1} ${
        totalDemand <= this.vehicleCapacity
          ? "According to capacity."
          : "Exceeding capacity!"
      }</p>
            </div>`;
    });

    resultdataLNSContainer.innerHTML = resultdataLNSHTML;

    if (
      routes.every(
        (route) => this.calculateRouteDemand(route) <= this.vehicleCapacity
      )
    ) {
      openPopup("Finish!", true);
    } else {
      openPopup("Failed!", false);
    }
  }
}
