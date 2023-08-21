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
    document.getElementById('stopwatch').style.backgroundColor = 'white';
    displayQuestion();
    // Tampilkan tombol di samping pertanyaan
    document.getElementById('buttonHint').style.display = 'inline-block';
    document.querySelector('.form-control').disabled = false;
    document.querySelectorAll('.buttonKeypad, .buttonDelete, .buttonStart').forEach(btn => {
        btn.disabled = false;
    });
    const startRestartButton = document.getElementById('startRestartButton');
    startRestartButton.disabled = true;
    const playButton = document.querySelector('.buttonStart');
    if (playButton.textContent === 'Start') {
        playButton.textContent = 'Restart';
    }
    startStopwatch();
}

function displayQuestion() {
    const [a, b] = questions[currentQuestionIndex];
    document.getElementById('question').innerText = `${a} x ${b} = ...`;

    // Menampilkan buttonHint
    document.getElementById('buttonHint').style.display = 'inline-block';
}


document.getElementById('buttonHint').addEventListener('click', function () {
    const fillMultiplicationData = (parentElementId) => {
        let parentElement = document.getElementById(parentElementId);
        parentElement.innerHTML = ""; // Clear previous content

        for (let i = 1; i <= 10; i++) {
            let col = document.createElement("div");
            col.className = "col-6 col-md";

            let multiplicationData = "";
            for (let j = 1; j <= 10; j++) {
                multiplicationData += `${i} x ${j} = ${i * j}<br>`;
            }

            col.innerHTML = multiplicationData;
            parentElement.appendChild(col);
        }
    }

    fillMultiplicationData("multiplicationRow");

    let hintModal = new bootstrap.Modal(document.getElementById('hintModal'));
    hintModal.show();
});





function checkAnswer() {
    const userAnswerInput = document.querySelector('.form-control');

    if (!userAnswerInput.value.trim()) { // jika input kosong
        let modal = new bootstrap.Modal(document.getElementById('emptyInputModal'));
        modal.show();
        return; // Keluar dari fungsi sehingga tidak memproses lebih lanjut
    }

    const userAnswer = parseInt(userAnswerInput.value);
    const [a, b] = questions[currentQuestionIndex];

    if (userAnswer !== a * b) {
        mistakes++;
        showDangerAlert();

        // Tambahkan animasi wiggle ke input
        userAnswerInput.classList.add('wiggle-animation');

        // Hapus animasi setelah selesai
        setTimeout(() => {
            userAnswerInput.classList.remove('wiggle-animation');
        }, 400);  // 400ms (0.2s * 2) sesuai durasi animasi
    } else {
        showAlert();
        correctAnswers++;
        currentQuestionIndex++;
        document.querySelector('.form-control').value = '';
        if (correctAnswers === 1) {
            document.querySelector('.buttonStart').textContent = 'Finish';
        }
        if (correctAnswers === 2) {
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

    // Ambil warna background dari stopwatch saat ini
    const currentBackgroundColor = document.getElementById('stopwatch').style.backgroundColor;

    // Simpan warna background ke localStorage
    localStorage.setItem('lastGameBackgroundColor', currentBackgroundColor);

    const finalTimeElement = document.getElementById('finalTime');
    finalTimeElement.textContent = `${minutes}:${seconds}`;

    // Set warna background, padding, borderRadius, dan margin dari finalTimeElement
    finalTimeElement.style.backgroundColor = 'transparent';

    // Tampilkan jumlah kesalahan di modal
    document.getElementById('mistakesCount').textContent = mistakes.toString();

    const startRestartButton = document.getElementById('startRestartButton');
    startRestartButton.textContent = 'Restart';
    startRestartButton.disabled = false;

    // Nonaktifkan keypad
    document.querySelector('.form-control').disabled = true;
    document.querySelectorAll('.buttonKeypad, .buttonDelete, .buttonStart').forEach(btn => {
        btn.disabled = true;
    });

    // Hilangkan soal yang ditampilkan
    document.getElementById('question').innerText = '';

    // Sembunyikan tombol hint
    document.getElementById('buttonHint').style.display = 'none';


    // Mengambil catatan pemain dari localStorage
    let playerRecords = JSON.parse(localStorage.getItem('playerRecords')) || [];

    // Jika ada setidaknya 5 catatan dan waktu pemain saat ini lebih lambat ATAU SAMA DENGAN peringkat 5
    if (playerRecords.length >= 5 && timeTaken >= playerRecords[4].time) {  // perhatikan bahwa saya mengganti > menjadi >=
        const timeDifference = timeTaken - playerRecords[4].time;
        const timeDifferenceElement = document.getElementById('timeDifference');
        if (timeTaken > playerRecords[4].time) {  // hanya menampilkan selisih jika waktu pemain lebih lambat, tidak sama
            timeDifferenceElement.textContent = `Your time is ${timeDifference} seconds slower than the 5th rank.`;
        } else {
            timeDifferenceElement.textContent = `You have the same time as the 5th rank :( Try it faster.`;
        }

        // Tampilkan informasi selisih waktu
        document.getElementById('timeDifferenceInfo').style.display = 'block';

        // Sembunyikan tombol Save dan hanya tampilkan tombol Close
        const modalFooter = document.querySelector("#endGameModal .modal-footer");
        modalFooter.innerHTML = '<button type="button" class="btn btn-secondary" id="endGameCloseButton3" data-bs-dismiss="modal">Show Ranking</button>';

        document.getElementById('endGameCloseButton3').addEventListener('click', function () {
            document.getElementById('rankingTitle').style.display = 'block';
            displayRankings();
        });

    } else {
        // Sembunyikan informasi selisih waktu
        document.getElementById('timeDifferenceInfo').style.display = 'none';
    }

    // Tampilkan modal
    let modal = new bootstrap.Modal(document.getElementById('endGameModal'));
    modal.show();

    // Sementara sembunyikan teks "Ranking"
    document.getElementById('rankingTitle').style.display = 'none';
}









function calculateBackgroundColor(timeInSeconds) {
    if (timeInSeconds <= 60) {
        const percentage = timeInSeconds / 60;
        const redValue = Math.min(255, Math.round(255 * percentage));
        return `rgb(${255 - redValue}, ${redValue}, ${redValue})`;
    } else {
        return 'rgb(255, 255, 255)';
    }
}

function savePlayerRecord() {
    const playerName = document.getElementById('playerName').value;
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }

    const playerTime = elapsedTime;  // Dapatkan waktu yang diperlukan pemain
    const savedBackgroundColor = localStorage.getItem('lastGameBackgroundColor'); // Ambil dari local storage

    let playerRecords = JSON.parse(localStorage.getItem('playerRecords')) || [];

    playerRecords.push({
        name: playerName,
        time: playerTime,
        mistakes: mistakes,
        bgColor: savedBackgroundColor  // Gunakan warna yang diambil dari local storage
    });

    // Mengurutkan playerRecords
    playerRecords.sort((a, b) => {
        // Jika waktu sama, bandingkan berdasarkan jumlah kesalahan.
        if (a.time === b.time) {
            return a.mistakes - b.mistakes;
        }

        // Urutkan berdasarkan waktu.
        return a.time - b.time;
    });

    // Memotong list untuk mengambil hanya 5 peringkat terbaik
    playerRecords = playerRecords.slice(0, 5);

    localStorage.setItem('playerRecords', JSON.stringify(playerRecords));

    // Tampilkan teks "Ranking" setelah catatan disimpan
    document.getElementById('rankingTitle').style.display = 'block';

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
    const rankingsContainer = document.getElementById('rankingsList');
    const records = JSON.parse(localStorage.getItem('playerRecords')) || [];

    rankingsContainer.innerHTML = '';  // Ini untuk membersihkan konten sebelumnya

    const topFiveRecords = records.slice(0, 5);
    topFiveRecords.forEach((record, index) => {
        const minutes = Math.floor(record.time / 60).toString().padStart(2, '0');
        const seconds = (record.time % 60).toString().padStart(2, '0');

        const mistakesDisplay = record.mistakes === 0 ?
            `No Mistakes <svg class="bi me-2 text-success" width="16" height="16"><use xlink:href="#check-circle-fill"/></svg>` :
            `Mistakes: ${record.mistakes} <span style="color: #dc3545;">x</span>`;

        let backgroundColorStyle = index === 0 ? '' : `background-color:${record.bgColor};`;

        if (index === 0) {  // Jika peringkat 1
            rankingsContainer.innerHTML += `
                <div class="alert alert-warning">
                    ${index + 1}. ${record.name} - 
                    <span>
                          ${minutes}:${seconds}
                    </span> 
                    - ${mistakesDisplay}
                </div>
            `;
        } else {
            rankingsContainer.innerHTML += `
                <div class="rank-item">
                    ${index + 1}. ${record.name} - 
                    <span class="record-time" 
                          style="${backgroundColorStyle} 
                                 padding: 10px 15px; 
                                 border-radius: 20px; 
                                 margin: 10px 0;">
                          ${minutes}:${seconds}
                    </span> 
                    - ${mistakesDisplay}
                </div>
            `;
        }
    });
}



function startStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = setInterval(() => {
        elapsedTime++;
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        document.getElementById('stopwatch').textContent = `${minutes}:${seconds}`;
        if (elapsedTime >= 180) { //UBAH WAKTU GRADASI, INI 3 MENIT
            document.getElementById('stopwatch').style.backgroundColor = '#dc3545';
        } else {
            let opacity = elapsedTime / 180; //UBAH WAKTU GRADASI, INI 3 MENIT
            document.getElementById('stopwatch').style.backgroundColor = `rgba(255, 0, 0, ${opacity})`;
        }
    }, 1000);
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
}

document.querySelectorAll('.buttonKeypad').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = document.querySelector('.form-control');
        input.value += e.target.innerText;
    });
});

document.querySelector('.buttonDelete').addEventListener('click', () => {
    const input = document.querySelector('.form-control');
    input.value = input.value.slice(0, -1);
});

document.querySelector('.buttonStart').addEventListener('click', checkAnswer);
document.querySelector('.btn-success').addEventListener('click', startGame);

function showAlert() {
    const alertContainer = document.createElement('div');
    alertContainer.id = 'alert-success-container';
    alertContainer.innerHTML = `
        <div class="alert alert-success d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
                <path fill="currentColor" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <div>
                Betul!
            </div>
        </div>
    `;
    document.body.appendChild(alertContainer);
    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}

function showDangerAlert() {
    const alertContainer = document.createElement('div');
    alertContainer.id = 'alert-danger-container';
    alertContainer.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:">
                <path fill="currentColor" d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <div>
                Salah!
            </div>
        </div>
    `;
    document.body.appendChild(alertContainer);
    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}

function handleStartRestartClick() {
    const button = document.getElementById('startRestartButton');
    if (button.textContent === 'Start') {
        startGame();
    } else {
        restartGame();
    }
}


function restartGame() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    elapsedTime = 0;
    mistakes = 0;
    document.getElementById('stopwatch').textContent = '00:00';
    document.querySelector('.form-control').value = '';
    document.getElementById('question').innerText = '';
    document.querySelector('.buttonStart').textContent = 'Submit';
    questions = generateUniqueQuestions(20);
    startGame();
}

document.getElementById('endGameCloseButton1').addEventListener('click', function () {
    document.getElementById('rankingTitle').style.display = 'block';
    displayRankings();
});

document.getElementById('endGameCloseButton2').addEventListener('click', function () {
    document.getElementById('rankingTitle').style.display = 'block';
    displayRankings();
});


document.getElementById('saveRecordCloseButton').addEventListener('click', function () {
    document.getElementById('rankingTitle').style.display = 'block';
    displayRankings();
});


document.getElementById('saveRecordModal').addEventListener('shown.bs.modal', function () {
    document.getElementById('playerName').focus();
});


questions = generateUniqueQuestions(20);
