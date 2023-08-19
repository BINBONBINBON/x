let currentQuestionIndex = 0;
let correctAnswers = 0;
let startTime;
let stopwatchInterval;
let elapsedTime = 0; // dalam detik
let mistakes = 0;
let previousQuestions = [];
let questions;

function generateRandomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

function generateUniqueQuestions(count) {
    const set = new Set();
    while (set.size < count) {
        const a = generateRandomNumber(10);
        const b = generateRandomNumber(10);
        const key = a + '*' + b;
        if (!previousQuestions.includes(key) && !set.has(key)) {
            set.add(key);
        }
    }
    return Array.from(set).map(q => q.split('*').map(n => parseInt(n)));
}

function startGame() {
    startTime = new Date().getTime();
    displayQuestion();
    document.querySelector('.form-control').disabled = false;
    document.querySelectorAll('.btn-dark, .btn-danger, .btn-warning').forEach(btn => {
        btn.disabled = false;
    });
    const startRestartButton = document.getElementById('startRestartButton');
    startRestartButton.disabled = true; // Menonaktifkan tombol saat game berjalan
    const submitButton = document.querySelector('.btn-warning');
    if (submitButton.textContent === 'Start') {
        submitButton.textContent = 'Submit';
    }
    startStopwatch(); // Mulai stopwatch
    previousQuestions = questions.slice();
}

function displayQuestion() {
    const [a, b] = questions[currentQuestionIndex];
    document.getElementById('question').innerText = `Berapa hasil dari ${a} x ${b}?`;
}


function checkAnswer() {
    const [a, b] = questions[currentQuestionIndex];
    const userAnswer = parseInt(document.querySelector('.form-control').value);

    if (userAnswer !== a * b) {
        mistakes++;  // Tambahkan kesalahan saat jawaban salah
        // Menampilkan modal saat jawaban salah
        let modal = new bootstrap.Modal(document.getElementById('exampleModal'));
        modal.show();
    } else {
        showAlert(); // Tampilkan alert
        correctAnswers++;
        currentQuestionIndex++;
        document.querySelector('.form-control').value = ''; // Membersihkan input

        if (correctAnswers === 19) { // Jika ini adalah pertanyaan sebelum terakhir
            document.querySelector('.btn-warning').textContent = 'Finish';
        }

        if (correctAnswers === 20) {
            endGame();
        } else {
            displayQuestion();
        }
    }
}

function endGame() {
    stopStopwatch(); // Hentikan stopwatch

    const endTime = new Date().getTime();
    const timeTaken = Math.round((endTime - startTime) / 1000);  
    const minutes = Math.floor(timeTaken / 60).toString().padStart(2, '0');
    const seconds = (timeTaken % 60).toString().padStart(2, '0');
    
    document.getElementById('finalTime').textContent = `${minutes}:${seconds}`;

    const startRestartButton = document.getElementById('startRestartButton');
    startRestartButton.textContent = 'Restart';
    startRestartButton.disabled = false;

    // Nonaktifkan keypad
    document.querySelector('.form-control').disabled = true;
    document.querySelectorAll('.btn-dark, .btn-danger, .btn-warning').forEach(btn => {
        btn.disabled = true;
    });

    // Hilangkan soal yang ditampilkan
    document.getElementById('question').innerText = '';

    // Tentukan apakah pengguna mendapat peringkat dalam 5 besar
    let playerRecords = JSON.parse(localStorage.getItem('playerRecords')) || [];
    if (playerRecords.length >= 5 && timeTaken > playerRecords[4].time) {
        // Sembunyikan tombol Save dan hanya tampilkan tombol Close
        const modalFooter = document.querySelector("#endGameModal .modal-footer");
        modalFooter.innerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>';
    }


    // Tampilkan modal
    let modal = new bootstrap.Modal(document.getElementById('endGameModal'));
    modal.show();
// Tampilkan teks "Ranking"
document.getElementById('rankingTitle').style.display = 'block';
    displayRankings();
}

function savePlayerRecord() {
    const playerName = document.getElementById('playerName').value;
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }

    const playerTime = elapsedTime;  // Dapatkan waktu yang diperlukan pemain

    let playerRecords = JSON.parse(localStorage.getItem('playerRecords')) || [];

    playerRecords.push({
        name: playerName,
        time: playerTime,
        mistakes: mistakes
    });

    // Mengurutkan playerRecords berdasarkan waktu tercepat
    playerRecords.sort((a, b) => a.time - b.time);

    // Memotong list untuk mengambil hanya 5 peringkat terbaik
    playerRecords = playerRecords.slice(0, 5);

    localStorage.setItem('playerRecords', JSON.stringify(playerRecords));

    // Update rankings
    displayRankings();

    // Menutup modal setelah data disimpan
    const saveRecordModal = bootstrap.Modal.getInstance(document.getElementById('saveRecordModal'));
    saveRecordModal.hide();

     // Membersihkan input
     document.getElementById('playerName').value = '';

     // Mengatur ulang elapsedTime dan menampilkan ulang stopwatch ke 00:00
    elapsedTime = 0;
    document.getElementById('stopwatch').textContent = '00:00';
}


function displayRankings() {
    const rankingsList = document.getElementById('rankingsList');
    const records = JSON.parse(localStorage.getItem('playerRecords')) || [];

    rankingsList.innerHTML = '';  // Membersihkan daftar peringkat yang ada

    const topFiveRecords = records.slice(0, 5);

    topFiveRecords.forEach((record, index) => {
        const minutes = Math.floor(record.time / 60).toString().padStart(2, '0');
        const seconds = (record.time % 60).toString().padStart(2, '0');

        rankingsList.innerHTML += `
            <div class="rank-item">
                ${index + 1}. ${record.name} - ${minutes}:${seconds} - Mistakes: ${record.mistakes}
            </div>
        `;
    });
}







function getPlayerRecord() {
    const storedRecord = localStorage.getItem('playerRecord');

    // Konversi string kembali ke objek JavaScript
    if (storedRecord) {
        return JSON.parse(storedRecord);
    } else {
        return null; // atau handle jika tidak ada record yang disimpan sebelumnya
    }
}


function restartGame() {
    console.log('Restarting game...');
    // Reset semua variabel dan tampilan
    currentQuestionIndex = 0;
    correctAnswers = 0;
    elapsedTime = 0;
    mistakes = 0; 
    document.getElementById('stopwatch').textContent = '00:00';
    document.querySelector('.form-control').value = '';
    document.getElementById('question').innerText = '';
    
    // Ubah teks tombol "Finish" menjadi "Submit" kembali
    document.querySelector('.btn-warning').textContent = 'Submit';

    // Buat kumpulan soal baru untuk game yang akan datang
    questions = generateUniqueQuestions(20);
    
    startGame();
}






function showAlert() {
    const alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.innerHTML = `
        <div class="alert alert-success d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
                <path fill="currentColor" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <div>
                Jawaban Anda benar!
            </div>
        </div>
    `;
    document.body.appendChild(alertContainer);
    setTimeout(() => {
        alertContainer.remove();
    }, 3000); // Alert akan hilang setelah 3 detik
}

function startStopwatch() {
    clearInterval(stopwatchInterval); // Pastikan untuk menghentikan stopwatch jika sudah berjalan
    stopwatchInterval = setInterval(() => {
        elapsedTime++;
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        document.getElementById('stopwatch').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
}

document.querySelectorAll('.btn-dark').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = document.querySelector('.form-control');
        input.value += e.target.innerText;
    });
});

document.querySelector('.btn-danger').addEventListener('click', () => {
    const input = document.querySelector('.form-control');
    input.value = input.value.slice(0, -1);
});

document.querySelector('.btn-warning').addEventListener('click', checkAnswer);
document.querySelector('.btn-success').addEventListener('click', startGame);

// ... semua kode Anda ...

function handleStartRestartClick() {
    const button = document.getElementById('startRestartButton');
    console.log('Button clicked:', button.textContent);
    if (button.textContent === 'Start') {
        startGame();
    } else {
        restartGame();
    }
}

document.querySelector('.btn-warning').addEventListener('click', checkAnswer);

// Serta pemanggilan berikut ini juga:
document.querySelector('.btn-success').addEventListener('click', startGame);

questions = generateUniqueQuestions(20);