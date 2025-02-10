// Fungsi untuk menyimpan data ke localStorage
function LocaldataToLocalStorage() {
  const data = getDataFromTable();
  localStorage.setItem("locationTableData", JSON.stringify(data));
}

// Fungsi untuk memuat data dari localStorage
function loadDataFromLocalStorage() {
  const savedData = localStorage.getItem("locationTableData");
  if (savedData) {
    const { depot, customers } = JSON.parse(savedData);
    const table = document
      .getElementById("locationTable")
      .getElementsByTagName("tbody")[0];
    table.innerHTML = ""; // Hapus isi tabel saat ini

    // Isi ulang data depot
    const depotRow = table.insertRow();
    depotRow.innerHTML = `
            <td>${depot.locationID}</td>
            <td><input type="text" id="address${depot.locationID}" value="${depot.address}" placeholder="Alamat Depot"></td>
            <td><input type="text" id="lat${depot.locationID}" value="${depot.latitude}" placeholder="Latitude Depot"></td>
            <td><input type="text" id="lng${depot.locationID}" value="${depot.longitude}" placeholder="Longitude Depot"></td>
        `;

    // Isi ulang data customers
    customers.forEach((customer) => {
      const row = table.insertRow();
      row.innerHTML = `
                <td>${customer.locationID}</td>
                <td><input type="text" id="address${customer.locationID}" value="${customer.address}" placeholder="Alamat Customer ${customer.locationID}"></td>
                <td><input type="text" id="lat${customer.locationID}" value="${customer.latitude}" placeholder="Latitude Customer ${customer.locationID}"></td>
                <td><input type="text" id="lng${customer.locationID}" value="${customer.longitude}" placeholder="Longitude Customer ${customer.locationID}"></td>
                <td><input type="number" id="demand${customer.locationID}" value="${customer.demand}" placeholder="Demand Customer ${customer.locationID}"></td>
            `;
    });

    // Update locationId berdasarkan data yang dimuat
    locationId = customers.length + 1;
  }
}

// Fungsi untuk menghapus data dari localStorage
function resetTable() {
  localStorage.removeItem("locationTableData"); // Hapus data dari localStorage

  const table = document
    .getElementById("locationTable")
    .getElementsByTagName("tbody")[0];
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

// Panggil fungsi ini saat halaman dimuat untuk memuat data yang disimpan
window.onload = function () {
  loadDataFromLocalStorage();
};

// Panggil fungsi ini setelah setiap perubahan pada tabel untuk menyimpan data
document
  .getElementById("locationTable")
  .addEventListener("input", LocaldataToLocalStorage);

// Jangan lupa panggil LocaldataToLocalStorage() setelah operasi seperti addRow() atau deleteLastRow()
function addRow() {
  const table = document
    .getElementById("locationTable")
    .getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();
  newRow.innerHTML = `
        <td>${locationId}</td>
        <td><input type="text" id="address${locationId}" placeholder="Alamat Customer ${locationId}"></td>
        <td><input type="text" id="lat${locationId}" placeholder="Latitude Customer ${locationId}"></td>
        <td><input type="text" id="lng${locationId}" placeholder="Longitude Customer ${locationId}"></td>
        <td><input type="number" id="demand${locationId}" placeholder="Demand Customer ${locationId}"></td>
    `;
  locationId++; // Tingkatkan locationId setelah baris ditambahkan
  LocaldataToLocalStorage(); // Simpan data setelah menambahkan baris baru
}

document.addEventListener("DOMContentLoaded", function () {
  const lastUsedElement = document.querySelector(".last-used");

  if (lastUsedElement) {
    lastUsedElement.addEventListener("click", function () {
      // Ambil data dari atribut "data-*"
      const address = lastUsedElement.getAttribute("data-address");
      const latitude = lastUsedElement.getAttribute("data-latitude");
      const longitude = lastUsedElement.getAttribute("data-longitude");
      const demand = lastUsedElement.getAttribute("data-demand");

      // Set nilai input di tabel
      document.getElementById("address").value = address;
      document.getElementById("latitude").value = latitude;
      document.getElementById("longitude").value = longitude;
      document.getElementById("demand").value = demand;
    });
  }
});
