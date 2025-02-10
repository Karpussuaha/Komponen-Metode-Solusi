class ACO {
    constructor(depot, customers, vehicleCapacity, numVehicles, numAnts, maxIterations, alpha, beta, evaporationRate, pheromoneMatrix) {
        // Inisialisasi variabel dengan parameter yang diberikan
        this.depot = depot; //Titik lokasi pusat distribusi yang menjadi titik awal dan akhir dari rute
        this.customers = customers; //Array yang berisi objek pelanggan
        this.vehicleCapacity = vehicleCapacity; //Kapasitas maksimum kendaraan dalam satuan unit pengiriman
        this.numVehicles = numVehicles; //Jumlah kendaraan yang tersedia untuk pengiriman
        this.numAnts = numAnts; //Jumlah semut yang digunakan dalam algoritma untuk mencari rute optimal
        this.maxIterations = maxIterations; //Jumlah iterasi dalam algoritma optimasi untuk mencari solusi terbaik
        this.alpha = alpha; //Parameter yang mempengaruhi pentingnya pheromone dalam perhitungan probabilitas semut
        this.beta = beta; //Parameter yang mempengaruhi pentingnya jarak dalam perhitungan probabilitas semut
        this.evaporationRate = evaporationRate; //Kecepatan penguapan pheromone setelah setiap iterasi
        this.pheromoneMatrix = pheromoneMatrix; //menyimpan nilai pheromone pada setiap rute atau jalur antara titik
    }

    // Fungsi untuk menginisialisasi seed
    initializeRandomSeed(seed) {
        Math.seedrandom(seed);  // Mengatur seed untuk Math.random()
    }

    calculateDistance(point1, point2) {
        // Menghitung jarak antara dua titik menggunakan rumus Haversine
        const R = 6371; // Radius bumi dalam kilometer
        const dLat = this.degreesToRadians(point2.latitude - point1.latitude);
        const dLng = this.degreesToRadians(point2.longitude - point1.longitude);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.degreesToRadians(point1.latitude)) * Math.cos(this.degreesToRadians(point2.latitude)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Jarak dalam kilometer
    }

    degreesToRadians(degrees) {
        // Mengonversi derajat menjadi radian
        return degrees * (Math.PI / 180);
    }

    runAlgorithm() {
        const startTime = performance.now();  // Mulai penghitungan waktu
    
        let bestRoutes = [];
        let bestDistances = [];
        let totalDemands = [];
        let bestDistancesPerIterationACO = []; // Array untuk menyimpan jarak terbaik setiap iterasi per kendaraan
    
        // Membagi pelanggan ke dalam kelompok untuk setiap kendaraan
        let customersPerVehicle = Math.ceil(this.customers.length / this.numVehicles);
        let customerGroups = [];
    
        for (let i = 0; i < this.numVehicles; i++) {
            customerGroups.push(this.customers.slice(i * customersPerVehicle, (i + 1) * customersPerVehicle));
        }
    
        // Deklarasi vehicleIndex di luar loop utama
        let vehicleIndex = 0;
        let remainingCustomers = [...this.customers]; // Pelanggan yang belum dilayani
    
        // Loop untuk setiap kendaraan, dengan rotasi kendaraan
        while (remainingCustomers.length > 0) { // Selama masih ada pelanggan yang belum dilayani
            let bestRoute = null;
            let bestDistance = Infinity;
            let bestTotalDemand = 0;
    
            let iterationDistances = []; // Array untuk menyimpan jarak terbaik pada setiap iterasi
    
            // Loop untuk setiap iterasi algoritma
            // Inisialisasi seed
            this.initializeRandomSeed(12345);  // Set seed dengan nilai tertentu
            for (let iteration = 0; iteration < this.maxIterations; iteration++) {
                // Loop untuk setiap semut (ant)
                for (let ant = 0; ant < this.numAnts; ant++) {
                    let currentRoute = [this.depot]; // Mulai dari depot
                    let remainingForThisVehicle = [...remainingCustomers]; // Pelanggan yang belum dikunjungi oleh kendaraan ini
                    let currentLoad = 0; // Muatan kendaraan saat ini
                    let currentPosition = this.depot; // Posisi saat ini
    
                    // Loop sampai semua pelanggan dikunjungi atau kapasitas kendaraan terpenuhi
                    while (remainingForThisVehicle.length > 0) {
                        let probabilities = [];
    
                        // Hitung probabilitas untuk setiap pelanggan yang tersisa
                        for (let customer of remainingForThisVehicle) {
                            let pheromone = this.pheromoneMatrix[currentPosition.locationID][customer.locationID];
                            let distance = this.calculateDistance(currentPosition, customer);
                            let heuristic = 1 / distance; // Heuristik berdasarkan jarak (semakin dekat, semakin baik)
                            let probability = Math.pow(pheromone, this.alpha) * Math.pow(heuristic, this.beta);
                            probabilities.push({ customer, probability });
                        }
    
                        // Pilih pelanggan berdasarkan probabilitas yang dihitung
                        let selectedCustomer = null;
                        let totalProbability = probabilities.reduce((acc, { probability }) => acc + probability, 0);
                        let rand = Math.random() * totalProbability;
                        let cumulativeProbability = 0;
    
                        for (let { customer, probability } of probabilities) {
                            cumulativeProbability += probability;
                            if (cumulativeProbability >= rand) {
                                if (currentLoad + customer.demand <= this.vehicleCapacity) {
                                    selectedCustomer = customer;
                                    break;
                                }
                            }
                        }
    
                        // Jika ada pelanggan yang dipilih, tambahkan ke rute saat ini
                        if (selectedCustomer) {
                            currentRoute.push(selectedCustomer);
                            currentLoad += selectedCustomer.demand; // Tambahkan muatan pelanggan ke muatan kendaraan
                            currentPosition = selectedCustomer; // Perbarui posisi saat ini
                            remainingForThisVehicle = remainingForThisVehicle.filter(c => c !== selectedCustomer); // Hapus pelanggan dari daftar yang tersisa
                        } else {
                            // Jika tidak ada pelanggan yang bisa dipilih, kembali ke depot
                            currentRoute.push(this.depot);
                            break;
                        }
                    }
    
                    // Pastikan depot ditambahkan di akhir rute
                    if (currentRoute[currentRoute.length - 1] !== this.depot) {
                        currentRoute.push(this.depot);
                    }
    
                    // Hitung total jarak untuk rute saat ini
                    let totalDistance = 0;
                    for (let i = 0; i < currentRoute.length - 1; i++) {
                        totalDistance += this.calculateDistance(currentRoute[i], currentRoute[i + 1]);
                    }
    
                    // Jika rute saat ini lebih baik (lebih pendek), perbarui rute dan jarak terbaik
                    if (totalDistance < bestDistance && currentLoad <= this.vehicleCapacity) {
                        bestDistance = totalDistance;
                        bestRoute = currentRoute;
                        bestTotalDemand = currentLoad;
                    }
                }
    
                // Perbarui matriks feromon berdasarkan rute terbaik yang ditemukan
                for (let i = 0; i < bestRoute.length - 1; i++) {
                    let from = bestRoute[i].locationID;
                    let to = bestRoute[i + 1].locationID;
                    this.pheromoneMatrix[from][to] += 1 / bestDistance; // Tambahkan feromon berdasarkan kebalikan dari jarak terbaik
                }
    
                // Menguapkan feromon pada setiap iterasi
                for (let i = 0; i < this.pheromoneMatrix.length; i++) {
                    for (let j = 0; j < this.pheromoneMatrix[i].length; j++) {
                        this.pheromoneMatrix[i][j] *= (1 - this.evaporationRate); // Mengurangi nilai feromon
                    }
                }
    
                iterationDistances.push(bestDistance); // Simpan jarak terbaik pada iterasi ini
            }
    
            // Tambahkan rute terbaik ke bestRoutes
            bestRoutes.push(bestRoute);
    
            // Perbarui pelanggan yang tersisa
            remainingCustomers = remainingCustomers.filter(customer => !bestRoute.includes(customer));
            
            // Rotasi ke kendaraan berikutnya
            vehicleIndex = (vehicleIndex + 1) % this.numVehicles; // Rotasi kendaraan
    
            // Simpan rute, jarak, dan total permintaan terbaik untuk kendaraan ini
            bestDistances.push(bestDistance);
            totalDemands.push(bestTotalDemand);
            bestDistancesPerIterationACO.push(iterationDistances); // Simpan semua jarak terbaik untuk kendaraan ini
        }

        // Tampilkan hasil untuk setiap kendaraan di dalam HTML
        const resultdataContainer = document.getElementById('resultdata');
        
        // Mulai dengan string kosong
        let resultdataHTML = '';

        bestRoutes.forEach((route, index) => {
            const routeIDs = route.map(location => location.locationID).join('-');
            const distance = bestDistances[index];
            const convertedDistanceKm = distance.toFixed(2) + " Kilometers";
            const convertedDistanceMeters = (distance * 1000).toFixed(0) + " Meters";
            const totalDemand = totalDemands[index];

            // Gunakan modulo untuk memastikan nomor kendaraan sesuai
            const vehicleNumber = (index % this.numVehicles) + 1;

            // Tampilkan di HTML
            resultdataHTML += `
            <div class="resultdata-item">
                <h2>Details</h2>
                <p>Vehicle ${vehicleNumber} to Route ${index + 1}</p>
                <p>Route: ${routeIDs}</p>
                <p>Best Distances: ${distance.toFixed(8)} km or (${convertedDistanceKm}) or (${convertedDistanceMeters})</p>
                <p>Total Delivery Request ${index + 1}: ${totalDemand}</p>
                <p>Routes for Vehicles ${index + 1} ${totalDemand <= this.vehicleCapacity ? 'According to capacity.' : 'Exceeding capacity!'}</p>
            </div>
            `;
        });

        // Tambahkan hasil ke container
        resultdataContainer.innerHTML = resultdataHTML;

        // Validasi hasil yang ditemukan untuk memastikan bahwa rute benar
        const isValid = this.validateResults(bestRoutes, bestDistances, totalDemands);
        if (isValid) {
            openPopup("Finish!", true); // Tampilkan popup jika validasi sukses
        } else {
            openPopup("Failed!", false); // Tampilkan popup jika validasi gagal
        }

        // Setelah semua perhitungan selesai, akhiri penghitungan waktu
        const endTime = performance.now();
        const computationTimeMs = (endTime - startTime).toFixed(3);  // Dalam milidetik dengan 3 angka di belakang koma
        const computationTimeSec = (computationTimeMs / 1000).toFixed(3);  // Konversi ke detik dengan 3 angka di belakang koma

        // Tampilkan waktu komputasi di console
        console.log(`ACO Computation Time: ${computationTimeMs} ms or ${computationTimeSec} s`);

        console.log("Best distances per iteration ACO:", bestDistancesPerIterationACO);

        return {
            bestRoutes: bestRoutes,
            bestDistances: bestDistances,
            totalDemands: totalDemands,
            bestDistancesPerIterationACO: bestDistancesPerIterationACO,
        };

    }

    validateResults(routes, distances, demands) {
        // Validasi hasil untuk memastikan bahwa setiap pelanggan dilayani dengan benar
        return routes.every((route, index) => {
            let totalDemand = 0;
            for (let i = 0; i < route.length - 1; i++) {
                let currentCustomer = route[i];
                let nextCustomer = route[i + 1];
                if (currentCustomer === this.depot || nextCustomer === this.depot) continue;
                totalDemand += currentCustomer.demand;
                if (totalDemand > this.vehicleCapacity) return false;
            }
            return true;
        });
    }
}
