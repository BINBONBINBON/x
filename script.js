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
    document.querySelector('.form-control').disabled = false;
    document.querySelectorAll('.btn-dark, .btn-danger, .btn-warning').forEach(btn => {
        btn.disabled = false;
    });
    const startRestartButton = document.getElementById('startRestartButton');
    startRestartButton.disabled = true;
    const submitButton = document.querySelector('.btn-warning');
    if (submitButton.textContent === 'Start') {
        submitButton.textContent = 'Submit';
    }
    startStopwatch();
}

function displayQuestion() {
    const [a, b] = questions[currentQuestionIndex];
    document.getElementById('question').innerText = `${a} x ${b} = ... ?`;
}

function checkAnswer() {
    const [a, b] = questions[currentQuestionIndex];
    const userAnswer = parseInt(document.querySelector('.form-control').value);
    if (userAnswer !== a * b) {
        mistakes++;
        let modal = new bootstrap.Modal(document.getElementById('exampleModal'));
        modal.show();
    } else {
        showAlert();
        correctAnswers++;
        currentQuestionIndex++;
        document.querySelector('.form-control').value = '';
        if (correctAnswers === 2) {
            document.querySelector('.btn-warning').textContent = 'Finish';
        }
        if (correctAnswers === 3) {
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
    finalTimeElement.style.backgroundColor = currentBackgroundColor;
    finalTimeElement.style.padding = "10px 15px";
    finalTimeElement.style.borderRadius = "20px";
    finalTimeElement.style.margin = "10px 0";

    // Tampilkan jumlah kesalahan di modal
    document.getElementById('mistakesCount').textContent = mistakes.toString();

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
    const rankingsContainer = document.getElementById('rankingsList');
    const records = JSON.parse(localStorage.getItem('playerRecords')) || [];
    rankingsContainer.innerHTML = '<h3></h3>';
    const topFiveRecords = records.slice(0, 5);
    topFiveRecords.forEach((record, index) => {
        const minutes = Math.floor(record.time / 60).toString().padStart(2, '0');
        const seconds = (record.time % 60).toString().padStart(2, '0');
        rankingsContainer.innerHTML += `
    <div class="rank-item">
        ${index + 1}. ${record.name} - 
        <span class="record-time" 
              style="background-color:${record.bgColor}; 
                     padding: 10px 15px; 
                     border-radius: 20px; 
                     margin: 10px 0;">
              ${minutes}:${seconds}
        </span> 
        - Mistakes: ${record.mistakes}
    </div>
`;


    });
}

function startStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = setInterval(() => {
        elapsedTime++;
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        document.getElementById('stopwatch').textContent = `${minutes}:${seconds}`;
        if (elapsedTime >= 60) {
            document.getElementById('stopwatch').style.backgroundColor = '#dc3545';
        } else {
            let opacity = elapsedTime / 60;
            document.getElementById('stopwatch').style.backgroundColor = `rgba(255, 0, 0, ${opacity})`;
        }
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
    document.querySelector('.btn-warning').textContent = 'Submit';
    questions = generateUniqueQuestions(20);
    startGame();
}

questions = generateUniqueQuestions(20);
