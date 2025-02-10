function createDistanceChart(bestDistancesPerIterationACO) {
    const maxIterations = bestDistancesPerIterationACO[0].length;
    const numVehicles = bestDistancesPerIterationACO.length;

    // Cari nilai minimal untuk setiap kendaraan
    const filteredData = []; // Data untuk grafik
    let minY = Infinity; // Simpan nilai minimum global untuk sumbu Y
    let maxY = -Infinity; // Simpan nilai maksimum global untuk sumbu Y

    for (let vehicle = 0; vehicle < numVehicles; vehicle++) {
        let minDistance = Infinity;
        let minIteration = 0;
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const distance = bestDistancesPerIterationACO[vehicle][iteration];
            if (distance < minDistance) {
                minDistance = distance;
                minIteration = iteration + 1; // Iterasi dimulai dari 1
            }
        }
        minY = Math.min(minY, minDistance); // Perbarui nilai minimum global
        maxY = Math.max(maxY, minDistance); // Perbarui nilai maksimum global

        // Tambahkan data minimum ke grafik
        filteredData.push({
            x: minIteration, // Iterasi dengan nilai minimum untuk vehicle ini
            y: minDistance,  // Nilai jarak minimum
            r: 10,           // Ukuran bubble tetap
            label: `Vehicle ${vehicle + 1} ACO` // Label lebih spesifik
        });
    }

    // Tambahkan padding pada sumbu Y
    const paddingY = (maxY - minY) * 0.2; // Padding 20% dari rentang nilai Y
    const minYWithPadding = Math.max(0, minY - paddingY); // Pastikan tidak negatif
    const maxYWithPadding = maxY + paddingY;

    // Buat grafik bubble chart
    const ctx = document.getElementById("DistancesChart").getContext("2d");
    const chartData = {
        datasets: filteredData.map((data, index) => ({
            label: data.label, // Label untuk kendaraan
            data: [data], // Data untuk kendaraan ini
            backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)`, // Warna berbeda dengan hue bergeser
            borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
            borderWidth: 1
        }))
    };

    new Chart(ctx, {
        type: "bubble",
        data: chartData,
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Iterations"
                    },
                    beginAtZero: true,
                    max: maxIterations // Tambahkan padding untuk sumbu X
                },
                y: {
                    title: {
                        display: true,
                        text: "Distance"
                    },
                    beginAtZero: false, // Mulai dari nilai minimum yang sudah dipadukan
                    min: minYWithPadding, // Minimum sumbu Y dengan padding
                    max: maxYWithPadding  // Maksimum sumbu Y dengan padding
                }
            },
            plugins: {
                legend: {
                    position: "top"
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: (${context.raw.x}, ${context.raw.y})`;
                        }
                    }
                }
            }
        }
    });
}

function createDistanceChartACO(bestDistancesPerIterationACO) {
    // Iterasi sesuai dengan jumlah data
    const iterations = bestDistancesPerIterationACO[0].map((_, index) => index + 1);

    // Gabungkan jarak terbaik per iterasi untuk semua kendaraan
    const totalDistancesPerIteration = [];
    for (let i = 0; i < iterations.length; i++) {
        let totalDistance = 0;
        for (let vehicle = 0; vehicle < bestDistancesPerIterationACO.length; vehicle++) {
            totalDistance += bestDistancesPerIterationACO[vehicle][i];  // Menjumlahkan jarak untuk setiap kendaraan pada iterasi ke-i
        }
        totalDistancesPerIteration.push(totalDistance);  // Simpan total jarak per iterasi
    }

    // Membuat grafik menggunakan Chart.js
    const ctx = document.getElementById('DistancesChartaco').getContext('2d');
    const DistancesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: iterations,
            datasets: [{
                label: 'Total Distance per Iteration',  // Ubah label menjadi Total Distance
                data: totalDistancesPerIteration,  // Gunakan data total jarak per iterasi
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: 'blue',
                tension: 0.2 // Untuk garis melengkung
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Iteration'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Distance (km)'
                    },
                    beginAtZero: false,
                    ticks: {
                        min: Math.min(...totalDistancesPerIteration),  // Sesuaikan dengan minimum total jarak
                        max: Math.max(...totalDistancesPerIteration)   // Sesuaikan dengan maksimum total jarak
                    }
                }
            }
        }
    });
}


function createDistanceChartLNS(bestDistancesPerIterationLNS) {
    // Iterasi sesuai dengan jumlah data
    const iterations = bestDistancesPerIterationLNS.map((_, index) => index + 1);

    // Membuat grafik menggunakan Chart.js tanpa anotasi
    const ctx = document.getElementById('DistancesChartlns').getContext('2d');
    const DistancesChartlns = new Chart(ctx, {
        type: 'line',
        data: {
            labels: iterations,
            datasets: [{
                label: 'Best Distance per Iteration',
                data: bestDistancesPerIterationLNS,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: 'blue',
                tension: 0.2 // Untuk garis melengkung
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Iteration'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Distance (km)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}
