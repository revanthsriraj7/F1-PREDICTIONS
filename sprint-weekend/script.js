// Configuration - Update this with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIt1hY-OXHGj0hsjBX4U63AODC3wakk4JAnVo47D37QbzdXHvP7QeFL2XW0LBEH-w/exec';

// F1 2025 Drivers Data
const drivers = [
    // Red Bull Racing
    { number: 1, name: 'MAX VERSTAPPEN', team: 'Red Bull Racing' },
    { number: 22, name: 'YUKI TSUNODA', team: 'Red Bull Racing' },
    // McLaren
    { number: 4, name: 'LANDO NORRIS', team: 'McLaren' },
    { number: 81, name: 'OSCAR PIASTRI', team: 'McLaren' },
    // Ferrari
    { number: 44, name: 'LEWIS HAMILTON', team: 'Ferrari' },
    { number: 16, name: 'CHARLES LECLERC', team: 'Ferrari' },
    // Mercedes
    { number: 63, name: 'GEORGE RUSSELL', team: 'Mercedes' },
    { number: 12, name: 'KIMI ANTONELLI', team: 'Mercedes' },
    // Williams
    { number: 55, name: 'CARLOS SAINZ', team: 'Williams' },
    { number: 23, name: 'ALEX ALBON', team: 'Williams' },
    // Aston Martin
    { number: 14, name: 'FERNANDO ALONSO', team: 'Aston Martin' },
    { number: 18, name: 'LANCE STROLL', team: 'Aston Martin' },
    // Racing Bulls
    { number: 21, name: 'ISACK HADJAR', team: 'Racing Bulls' },
    { number: 40, name: 'LIAM LAWSON', team: 'Racing Bulls' },
    // Sauber
    { number: 27, name: 'NICO HULKENBERG', team: 'Sauber' },
    { number: 5, name: 'GABRIEL BORTOLETO', team: 'Sauber' },
    // Haas
    { number: 87, name: 'OLIVER BEARMAN', team: 'Haas' },
    { number: 31, name: 'ESTEBAN OCON', team: 'Haas' },
    // Alpine
    { number: 10, name: 'PIERRE GASLY', team: 'Alpine' },
    { number: 43, name: 'FRANCO COLAPINTO', team: 'Alpine' }
];

// Driver image mapping
const driverImages = {
    'MAX VERSTAPPEN': 'max.png',
    'YUKI TSUNODA': 'yuki.png',
    'LEWIS HAMILTON': 'hamilton.png',
    'CHARLES LECLERC': 'charles.png',
    'LANDO NORRIS': 'lundo.png',
    'OSCAR PIASTRI': 'piastri.png',
    'GEORGE RUSSELL': 'george.png',
    'KIMI ANTONELLI': 'kimi.png',
    'FERNANDO ALONSO': 'fernando.png',
    'LANCE STROLL': 'stroll.png',
    'PIERRE GASLY': 'gasly.png',
    'FRANCO COLAPINTO': 'franco.png',
    'OLIVER BEARMAN': 'bear.png',
    'ESTEBAN OCON': 'ocon.png',
    'NICO HULKENBERG': 'nico.png',
    'GABRIEL BORTOLETO': 'gabriel.png',
    'CARLOS SAINZ': 'carlos.png',
    'ALEX ALBON': 'albon.png',
    'ISACK HADJAR': 'hadjar.png',
    'LIAM LAWSON': 'lawson.png'
};

// Sprint Questions (P1-P8, P17-P20, sprint pole time, most positions)
const sprintQuestions = [
    ...Array.from({ length: 8 }, (_, i) => ({
        id: `sprint_p${i + 1}`,
        title: `SPRINT - YOUR P${i + 1}`,
        type: 'driver',
        questionNumber: `QUESTION ${i + 1}`
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `sprint_p${i + 17}`,
        title: `SPRINT - YOUR P${i + 17}`,
        type: 'driver',
        questionNumber: `QUESTION ${i + 9}`
    })),
    { id: 'sprint_pole_driver', title: 'SPRINT - POLE POSITION DRIVER', type: 'driver', questionNumber: 'QUESTION 13' },
    { id: 'sprint_pole_time', title: 'SPRINT - POLE LAP TIME', type: 'time', questionNumber: 'QUESTION 14', placeholder: '12.246' },
    { id: 'sprint_most_positions', title: 'SPRINT - MOST POSITIONS GAINED', type: 'driver', questionNumber: 'QUESTION 15' }
];

// Main Race Questions (All standard questions)
const raceQuestions = [
    ...Array.from({ length: 20 }, (_, i) => ({
        id: `race_p${i + 1}`,
        title: `RACE - YOUR P${i + 1}`,
        type: 'driver',
        questionNumber: `QUESTION ${i + 1}`
    })),
    { id: 'race_pole_driver', title: 'RACE - POLE POSITION DRIVER', type: 'driver', questionNumber: 'QUESTION 21' },
    { id: 'race_pole_time', title: 'RACE - POLE LAP TIME', type: 'time', questionNumber: 'QUESTION 22', placeholder: '12.246' },
    { id: 'race_fastest_lap_driver', title: 'RACE - FASTEST LAP DRIVER', type: 'driver', questionNumber: 'QUESTION 23' },
    { id: 'race_fastest_lap_time', title: 'RACE - FASTEST LAP TIME', type: 'time', questionNumber: 'QUESTION 24', placeholder: '12.246' },
    { id: 'race_most_positions', title: 'RACE - MOST POSITIONS GAINED', type: 'driver', questionNumber: 'QUESTION 25' }
];

// State
let currentTab = 'sprint'; // 'sprint' or 'race'
let currentQuestion = 0;
let predictions = {
    participantName: '',
    timestamp: ''
};
let selectedDrivers = {
    sprint: new Set(),
    race: new Set()
};

// Initialize
function startPrediction() {
    const name = document.getElementById('participantName').value.trim();
    
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    predictions.participantName = name;
    predictions.timestamp = new Date().toISOString();
    document.getElementById('displayName').textContent = name;
    
    showScreen('predictionScreen');
    switchTab('sprint'); // Start with sprint tab
    setupTimeInputFormatting();
}

function switchTab(tab) {
    currentTab = tab;
    currentQuestion = 0;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Render appropriate navigation
    renderQuestionNavigation();
    showQuestion(0);
}

function getCurrentQuestions() {
    return currentTab === 'sprint' ? sprintQuestions : raceQuestions;
}

function setupTimeInputFormatting() {
    const timeInputSeconds = document.getElementById('timeInputSeconds');
    const timeInputMilliseconds = document.getElementById('timeInputMilliseconds');
    
    // Seconds input handling
    timeInputSeconds.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value.length > 2) value = value.slice(0, 2);
        if (parseInt(value) > 59) value = '59';
        e.target.value = value;
        if (value.length === 2) timeInputMilliseconds.focus();
    });
    
    // Milliseconds input handling
    timeInputMilliseconds.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        e.target.value = value;
    });
    
    // Allow backspace to go back to seconds input
    timeInputMilliseconds.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value.length === 0) {
            timeInputSeconds.focus();
            setTimeout(() => {
                timeInputSeconds.setSelectionRange(timeInputSeconds.value.length, timeInputSeconds.value.length);
            }, 0);
        }
    });
    
    // Prevent invalid keys
    [timeInputSeconds, timeInputMilliseconds].forEach(input => {
        input.addEventListener('keydown', function(e) {
            if ([8, 9, 13, 27, 37, 38, 39, 40, 46].includes(e.keyCode) ||
                (e.ctrlKey && [65, 67, 86, 88, 90].includes(e.keyCode))) {
                return;
            }
            if (e.key && !/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'welcomeScreen') {
        document.body.classList.add('welcome-active');
    } else {
        document.body.classList.remove('welcome-active');
    }
}

function renderQuestionNavigation() {
    const questionNav = document.getElementById('questionNav');
    questionNav.innerHTML = '';
    
    const questions = getCurrentQuestions();
    
    questions.forEach((question, index) => {
        const navItem = document.createElement('div');
        navItem.className = 'question-nav-item';
        
        // Determine label based on question type
        let label = '';
        if (question.id.includes('_p')) {
            const pNum = question.id.split('_p')[1];
            label = `P${pNum}`;
        } else if (question.id.includes('pole_driver')) {
            label = 'POLE';
        } else if (question.id.includes('pole_time')) {
            label = 'P.TIME';
        } else if (question.id.includes('fastest_lap_driver')) {
            label = 'FAST';
        } else if (question.id.includes('fastest_lap_time')) {
            label = 'F.TIME';
        } else if (question.id.includes('most_positions')) {
            label = 'MOST';
        }
        
        navItem.textContent = label;
        navItem.onclick = () => navigateToQuestion(index);
        
        questionNav.appendChild(navItem);
    });
    
    updateQuestionNavigation();
}

function updateQuestionNavigation() {
    const navItems = document.querySelectorAll('.question-nav-item');
    const questions = getCurrentQuestions();
    
    navItems.forEach((item, index) => {
        item.classList.remove('active', 'completed');
        
        const question = questions[index];
        
        if (predictions[question.id]) {
            item.classList.add('completed');
        }
        
        if (index === currentQuestion) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

function navigateToQuestion(index) {
    showQuestion(index);
}

function showQuestion(index) {
    currentQuestion = index;
    const questions = getCurrentQuestions();
    const question = questions[index];
    
    updateQuestionNavigation();
    
    // Update progress
    const progress = ((index + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Update question details
    document.getElementById('questionNumber').textContent = question.questionNumber;
    document.getElementById('questionTitle').textContent = question.title;
    
    // Show appropriate input type
    const driversGrid = document.getElementById('driversGrid');
    const timeInputContainer = document.getElementById('timeInputContainer');
    
    if (question.type === 'driver') {
        driversGrid.style.display = 'grid';
        timeInputContainer.style.display = 'none';
        renderDrivers(question.id);
    } else {
        driversGrid.style.display = 'none';
        timeInputContainer.style.display = 'block';
        const timeInputSeconds = document.getElementById('timeInputSeconds');
        const timeInputMilliseconds = document.getElementById('timeInputMilliseconds');
        
        const existingValue = predictions[question.id];
        if (existingValue && existingValue.startsWith('1:')) {
            const parts = existingValue.split(':');
            if (parts.length === 2) {
                const timeParts = parts[1].split('.');
                timeInputSeconds.value = timeParts[0] || '';
                timeInputMilliseconds.value = timeParts[1] || '';
            }
        } else {
            timeInputSeconds.value = '';
            timeInputMilliseconds.value = '';
        }
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');
    
    prevBtn.style.display = index > 0 ? 'block' : 'none';
    
    // Check if we're on the last question of the race tab
    const isLastQuestion = currentTab === 'race' && index === questions.length - 1;
    nextBtnText.textContent = isLastQuestion ? 'SUBMIT' : 'NEXT →';
}

function renderDrivers(questionId) {
    const driversGrid = document.getElementById('driversGrid');
    driversGrid.innerHTML = '';
    
    // Filter out already selected drivers ONLY for race position predictions
    let availableDrivers = drivers;
    const isPosQuestion = questionId.match(/_(p\d+)$/);
    
    if (isPosQuestion) {
        const currentSet = selectedDrivers[currentTab];
        availableDrivers = drivers.filter(driver => 
            !currentSet.has(driver.name) || predictions[questionId] === driver.name
        );
    }
    
    const sortedDrivers = [...availableDrivers];
    
    sortedDrivers.forEach(driver => {
        const card = document.createElement('div');
        card.className = 'driver-card';
        
        if (predictions[questionId] === driver.name) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <div class="driver-header">
                <div class="driver-number">${driver.number}</div>
                <img src="../driver pics/${driverImages[driver.name]}" alt="${driver.name}" class="driver-image">
            </div>
            <div class="driver-info">
                <div class="driver-name">${driver.name}</div>
                <div class="driver-team">${driver.team}</div>
            </div>
        `;
        
        card.onclick = () => selectDriver(questionId, driver.name);
        card.ondblclick = () => {
            selectDriver(questionId, driver.name);
            setTimeout(() => nextQuestion(), 100);
        };
        driversGrid.appendChild(card);
    });
}

function selectDriver(questionId, driverName) {
    const isPosQuestion = questionId.match(/_(p\d+)$/);
    
    // Remove previous selection for this question from the set (only for position predictions)
    if (predictions[questionId] && isPosQuestion) {
        selectedDrivers[currentTab].delete(predictions[questionId]);
    }
    
    // Add new selection
    predictions[questionId] = driverName;
    if (isPosQuestion) {
        selectedDrivers[currentTab].add(driverName);
    }
    
    renderDrivers(questionId);
    updateQuestionNavigation();
}

function allQuestionsAnswered() {
    const allQuestions = [...sprintQuestions, ...raceQuestions];
    return allQuestions.every(question => predictions[question.id]);
}

function nextQuestion() {
    const questions = getCurrentQuestions();
    const question = questions[currentQuestion];
    
    // Validate current question
    if (question.type === 'driver') {
        if (!predictions[question.id]) {
            alert('Please select a driver');
            return;
        }
    } else {
        const timeInputSeconds = document.getElementById('timeInputSeconds').value.trim();
        const timeInputMilliseconds = document.getElementById('timeInputMilliseconds').value.trim();
        
        if (!timeInputSeconds || !timeInputMilliseconds) {
            alert('Please enter both seconds and milliseconds');
            return;
        }
        if (!validateTime(timeInputSeconds + '.' + timeInputMilliseconds)) {
            alert('Please enter valid time (seconds: 00-59, milliseconds: 000-999)');
            return;
        }
        predictions[question.id] = '1:' + timeInputSeconds + '.' + timeInputMilliseconds;
        updateQuestionNavigation();
    }
    
    // Move to next question or switch tab/submit
    if (currentQuestion < questions.length - 1) {
        showQuestion(currentQuestion + 1);
    } else {
        // If we're on sprint tab, switch to race tab
        if (currentTab === 'sprint') {
            switchTab('race');
        } else {
            // We're on race tab, check if all questions are answered
            if (!allQuestionsAnswered()) {
                alert('Get yo ass back here and submit all questions before leaving nigga');
                return;
            }
            submitPredictions();
        }
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        showQuestion(currentQuestion - 1);
    }
}

function validateTime(time) {
    const pattern = /^\d{2}\.\d{3}$/;
    return pattern.test(time);
}

async function submitPredictions() {
    try {
        const nextBtn = document.getElementById('nextBtn');
        const originalText = nextBtn.innerHTML;
        nextBtn.innerHTML = '<span>SUBMITTING...</span>';
        nextBtn.disabled = true;
        
        const submissionData = {
            participantName: predictions.participantName,
            timestamp: predictions.timestamp,
            ...predictions
        };
        
        console.log('Submitting data:', submissionData);
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });
        
        document.getElementById('successName').textContent = predictions.participantName;
        showScreen('successScreen');
        
    } catch (error) {
        console.error('Error submitting predictions:', error);
        alert('Error submitting predictions. Please try again.');
        
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.innerHTML = originalText;
        nextBtn.disabled = false;
    }
}

function resetForm() {
    currentQuestion = 0;
    currentTab = 'sprint';
    predictions = {
        participantName: '',
        timestamp: ''
    };
    selectedDrivers = {
        sprint: new Set(),
        race: new Set()
    };
    
    document.getElementById('participantName').value = '';
    showScreen('welcomeScreen');
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen.id === 'welcomeScreen') {
            startPrediction();
        } else if (activeScreen.id === 'predictionScreen') {
            nextQuestion();
        }
    }
});
