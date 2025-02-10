let locationId = 4; // Mulai dari 4 karena 0 hingga 3 sudah ada di tabel

// Fungsi untuk menambah baris baru pada tabel
function addRow() {
    const table = document.getElementById('locationTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${locationId}</td>
        <td><input type="text" id="address${locationId}" placeholder="Alamat Customer ${locationId}"></td>
        <td><input type="text" id="lat${locationId}" placeholder="Latitude Customer ${locationId}"></td>
        <td><input type="text" id="lng${locationId}" placeholder="Longitude Customer ${locationId}"></td>
        <td><input type="number" id="demand${locationId}" placeholder="Demand Customer ${locationId}"></td>
    `;
    locationId++; // Tingkatkan locationId setelah baris ditambahkan
}

// Fungsi untuk menghapus baris terakhir dari tabel
function deleteLastRow() {
    const table = document.getElementById('locationTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    if (rowCount > 1) { // Pastikan tidak menghapus baris Depot (baris pertama)
        table.deleteRow(rowCount - 1);
        locationId--;
        openPopup("Data sudah dihapus!", true);
    } else {
        openPopup("Tidak ada baris Customer untuk dihapus!");
    }
}

// Fungsi untuk mereset tabel ke kondisi awal
function resetTable() {
    const table = document.getElementById('locationTable').getElementsByTagName('tbody')[0];
    table.innerHTML = `
        <tr>
            <td>0</td>
            <td><input type="text" id="address0" placeholder="Alamat Depot"></td>
            <td><input type="text" id="lat0" placeholder="Latitude Depot"></td>
            <td><input type="text" id="lng0" placeholder="Longitude Depot"></td>
        </tr>
        <tr>
            <td>1</td>
            <td><input type="text" id="address1" placeholder="Alamat Customer 1"></td>
            <td><input type="text" id="lat1" placeholder="Latitude Customer 1"></td>
            <td><input type="text" id="lng1" placeholder="Longitude Customer 1"></td>
            <td><input type="number" id="demand1" placeholder="Demand Customer 1"></td>
        </tr>
        <tr>
            <td>2</td>
            <td><input type="text" id="address2" placeholder="Alamat Customer 2"></td>
            <td><input type="text" id="lat2" placeholder="Latitude Customer 2"></td>
            <td><input type="text" id="lng2" placeholder="Longitude Customer 2"></td>
            <td><input type="number" id="demand2" placeholder="Demand Customer 2"></td>
        </tr>
        <tr>
            <td>3</td>
            <td><input type="text" id="address3" placeholder="Alamat Customer 3"></td>
            <td><input type="text" id="lat3" placeholder="Latitude Customer 3"></td>
            <td><input type="text" id="lng3" placeholder="Longitude Customer 3"></td>
            <td><input type="number" id="demand3" placeholder="Demand Customer 3"></td>
        </tr>
    `;
    locationId = 4; // Reset ID lokasi ke 4
}

function recordData() {
    const table = document.getElementById('locationTable').getElementsByTagName('tbody')[0];
    const rows = table.rows;
    const data = [];

    // Memeriksa apakah ada baris data yang dimasukkan
    if (rows.length === 0) {
        openPopup("Error: Tidak ada data yang dimasukkan!", false);
        return;
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const locationID = row.cells[0].innerText;

        // Memeriksa apakah input ada sebelum mencoba mengakses nilai
        const addressElement = document.getElementById(`address${locationID}`);
        const latElement = document.getElementById(`lat${locationID}`);
        const lngElement = document.getElementById(`lng${locationID}`);
        const demandElement = locationID == 0 ? null : document.getElementById(`demand${locationID}`);

        if (!addressElement || !latElement || !lngElement || (locationID != 0 && !demandElement)) {
            openPopup(`Error: Data tidak ditemukan untuk Location ID ${locationID}!`, false);
            console.error(`Element with ID ${locationID} not found or not fully loaded.`);
            return;
        }

        const address = addressElement.value.trim();
        const latitude = latElement.value.trim();
        const longitude = lngElement.value.trim();
        const demand = locationID == 0 ? 0 : demandElement.value.trim();

        // Validasi bahwa input tidak boleh kosong
        if (!address || !latitude || !longitude || (locationID != 0 && !demand)) {
            openPopup(`Error: Data tidak lengkap untuk Location ID ${locationID}!`, false);
            return;
        }

        // Validasi tipe data
        const latitudeValue = parseFloat(latitude);
        const longitudeValue = parseFloat(longitude);
        const demandValue = locationID == 0 ? 0 : parseFloat(demand);

        if (isNaN(latitudeValue) || isNaN(longitudeValue) || (locationID != 0 && isNaN(demandValue))) {
            openPopup(`Error: Data tidak valid untuk Location ID ${locationID}!`, false);
            return;
        }

        data.push({ locationID, address, latitude: latitudeValue, longitude: longitudeValue, demand: demandValue });
    }

    console.log(data);
    openPopup('Data telah disimpan!', true);
}


// Fungsi untuk membuka popup dengan pesan tertentu
function openPopup(message, isSuccess) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    const popupIcon = document.getElementById('popupIcon');
    
    popupMessage.innerText = message;
    popup.classList.add('active');
    
    if (isSuccess) {
        popupIcon.classList.add('fa-check-circle', 'success');
        popupIcon.classList.remove('fa-times-circle', 'error');
    } else {
        popupIcon.classList.add('fa-times-circle', 'error');
        popupIcon.classList.remove('fa-check-circle', 'success');
    }
}

// Fungsi untuk menutup popup
function closePopup() {
    const popup = document.getElementById('popup');
    const popupIcon = document.getElementById('popupIcon');
    
    popup.classList.remove('active');
    
    // Hapus kelas ikon untuk persiapan selanjutnya
    popupIcon.classList.remove('fa-check-circle', 'fa-times-circle', 'success', 'error');
}

// Ambil referensi ke semua elemen input dalam halaman
const inputs = document.getElementsByTagName('input');

// Tambahkan event listener untuk menangkap keydown event pada document
document.addEventListener('keydown', function(event) {
    const target = event.target;
    const tagName = target.tagName.toLowerCase();

    // Pastikan event hanya diproses jika fokus pada input atau textarea
    if (tagName === 'input' || tagName === 'textarea') {
        const row = target.closest('tr');
        const cellIndex = Array.from(row.children).indexOf(target.closest('td'));

        switch (event.key) {
            case 'ArrowUp':
                if (row.previousElementSibling) {
                    const prevInput = row.previousElementSibling.children[cellIndex].querySelector('input');
                    if (prevInput) {
                        prevInput.focus();
                    }
                }
                break;
            case 'ArrowDown':
                if (row.nextElementSibling) {
                    const nextInput = row.nextElementSibling.children[cellIndex].querySelector('input');
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
                break;
            case 'ArrowLeft':
                if (cellIndex > 0) {
                    const leftInput = row.children[cellIndex - 1].querySelector('input');
                    if (leftInput) {
                        leftInput.focus();
                    }
                }
                break;
            case 'ArrowRight':
                if (cellIndex < row.children.length - 1) {
                    const rightInput = row.children[cellIndex + 1].querySelector('input');
                    if (rightInput) {
                        rightInput.focus();
                    }
                }
                break;
            default:
                return; // Keluar dari function jika tombol selain panah yang ditekan
        }

        event.preventDefault(); // Untuk mencegah default behavior dari tombol panah
    }
});


// Fungsi untuk mengambil data dari tabel dan mengembalikan depot dan customers
function getDataFromTable() {
    const table = document.getElementById('locationTable').getElementsByTagName('tbody')[0];
    const rows = table.rows;
    const data = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const locationID = row.cells[0].innerText;
        
        if (locationID === '0') {
            // Hanya ambil data depot (baris pertama dengan ID 0)
            const addressElement = document.getElementById(`address${locationID}`);
            const latElement = document.getElementById(`lat${locationID}`);
            const lngElement = document.getElementById(`lng${locationID}`);

            if (!addressElement || !latElement || !lngElement) {
                console.error(`Element with ID ${locationID} not found or not fully loaded.`);
                continue; // Skip this row and proceed to the next one
            }

            const address = addressElement.value;
            const latitude = parseFloat(latElement.value);
            const longitude = parseFloat(lngElement.value);

            data.push({ locationID, address, latitude, longitude, demand: 0 }); // Depot memiliki demand 0
        } else {
            // Ambil data pelanggan (baris dengan ID 1, 2, dst.)
            const addressElement = document.getElementById(`address${locationID}`);
            const latElement = document.getElementById(`lat${locationID}`);
            const lngElement = document.getElementById(`lng${locationID}`);
            const demandElement = document.getElementById(`demand${locationID}`);

            if (!addressElement || !latElement || !lngElement || !demandElement) {
                console.error(`Element with ID ${locationID} not found or not fully loaded.`);
                continue; // Skip this row and proceed to the next one
            }

            const address = addressElement.value;
            const latitude = parseFloat(latElement.value);
            const longitude = parseFloat(lngElement.value);
            const demand = parseFloat(demandElement.value);

            data.push({ locationID, address, latitude, longitude, demand });
        }
    }

    // Temukan depot di dalam data
    const depot = data.find(item => item.locationID === '0');
    // Sisanya adalah customers
    const customers = data.filter(item => item.locationID !== '0');

    return { depot, customers };
}

function Execute() {
    const { depot, customers } = getDataFromTable();
    const vehicleCapacity = 110;
    const numVehicles = 2;
    const numAnts = 120;
    const maxIterations = 500;
    const alpha = 1;
    const beta = 2;
    const evaporationRate = 0.5;

    // Inisialisasi pheromoneMatrix untuk ACO
    const numLocations = customers.length + 1; // +1 untuk depot
    const pheromoneMatrix = Array.from({ length: numLocations }, () => Array(numLocations).fill(1));

    // Inisialisasi objek ACO dan LNS
    const aco = new ACO(depot, customers, vehicleCapacity, numVehicles, numAnts, maxIterations, alpha, beta, evaporationRate, pheromoneMatrix);
    const lns = new LNS(depot, customers, vehicleCapacity, numVehicles, maxIterations);

    // Menjalankan algoritma ACO dan LNS serta menampilkan hasilnya
    window.runAlgorithmACO = async () => {
        const result = await aco.runAlgorithm();
        await displayMarkers("map"); // Tampilkan marker untuk ACO
        await drawRoutes(result.bestRoutes, "map"); // Gambarkan rute ACO
        await createDistanceChart(result.bestDistancesPerIterationACO, "DistancesChartaco");
        await createDistanceChartACO(result.bestDistancesPerIterationACO, "DistancesChartaco");
        
    }; 

    window.runAlgorithmLNS = async () => {
        const result = await lns.runAlgorithm();
        await displayMarkers("mapLNS"); // Tampilkan marker untuk LNS
        await drawRoutes(result.bestRoutes, "mapLNS"); // Gambarkan rute LNS
        await createDistanceChartLNS(result.bestDistancesPerIterationLNS, "DistancesChartlns");
    };
    
}
