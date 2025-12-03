// Configuration - Update this with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzkBfeCEWauTDERnnf9rkJkp5f_n9Bsw9b7TlqEcfQGLRjBWSryxE5YZBYRhk3WER0/exec';

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

// Questions structure
const questions = [
    // Position predictions (P1 to P20)
    ...Array.from({ length: 20 }, (_, i) => ({
        id: `p${i + 1}`,
        title: `ABU DHABI GP - YOUR P${i + 1}`,
        type: 'driver',
        questionNumber: `QUESTION ${i + 1} / 24`
    })),
    // Special predictions
    { id: 'pole_driver', title: 'ABU DHABI - POLE POSITION DRIVER', type: 'driver', questionNumber: 'QUESTION 21 / 24' },
    { id: 'pole_time', title: 'ABU DHABI - POLE LAP TIME', type: 'time', questionNumber: 'QUESTION 22 / 24', placeholder: '12.246' },
    { id: 'fastest_lap_driver', title: 'ABU DHABI - FASTEST LAP DRIVER', type: 'driver', questionNumber: 'QUESTION 23 / 24' },
    { id: 'fastest_lap_time', title: 'ABU DHABI - FASTEST LAP TIME', type: 'time', questionNumber: 'QUESTION 24 / 24', placeholder: '12.246' },
    { id: 'most_positions', title: 'ABU DHABI - MOST POSITIONS GAINED', type: 'driver', questionNumber: 'QUESTION 25 / 24' }
];

// Update questions count
questions.forEach((q, index) => {
    q.questionNumber = `QUESTION ${index + 1} / ${questions.length}`;
});

// State
let currentQuestion = 0;
let predictions = {
    participantName: '',
    timestamp: ''
};
let selectedDrivers = new Set();

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
    renderQuestionNavigation();
    showQuestion(0);
    
    // Add time input formatting
    setupTimeInputFormatting();
}

function setupTimeInputFormatting() {
    const timeInputSeconds = document.getElementById('timeInputSeconds');
    const timeInputMilliseconds = document.getElementById('timeInputMilliseconds');
    
    // Seconds input handling
    timeInputSeconds.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
        
        // Limit to 2 digits
        if (value.length > 2) {
            value = value.slice(0, 2);
        }
        
        // Don't allow seconds greater than 59
        if (parseInt(value) > 59) {
            value = '59';
        }
        
        e.target.value = value;
        
        // Auto-focus to milliseconds when 2 digits entered
        if (value.length === 2) {
            timeInputMilliseconds.focus();
        }
    });
    
    // Milliseconds input handling
    timeInputMilliseconds.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
        
        // Limit to 3 digits
        if (value.length > 3) {
            value = value.slice(0, 3);
        }
        
        e.target.value = value;
    });
    
    // Allow backspace to go back to seconds input
    timeInputMilliseconds.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value.length === 0) {
            timeInputSeconds.focus();
            // Move cursor to end of seconds input
            setTimeout(() => {
                timeInputSeconds.setSelectionRange(timeInputSeconds.value.length, timeInputSeconds.value.length);
            }, 0);
        }
    });
    
    // Prevent invalid keys
    [timeInputSeconds, timeInputMilliseconds].forEach(input => {
        input.addEventListener('keydown', function(e) {
            // Allow backspace, delete, tab, escape, enter, and arrow keys
            if ([8, 9, 13, 27, 37, 38, 39, 40, 46].includes(e.keyCode) ||
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
                (e.ctrlKey && [65, 67, 86, 88, 90].includes(e.keyCode))) {
                return;
            }
            
            // Only allow numbers
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
    
    // Manage scroll restriction on mobile
    if (screenId === 'welcomeScreen') {
        document.body.classList.add('welcome-active');
    } else {
        document.body.classList.remove('welcome-active');
    }
}

function renderQuestionNavigation() {
    const questionNav = document.getElementById('questionNav');
    questionNav.innerHTML = '';
    
    questions.forEach((question, index) => {
        const navItem = document.createElement('div');
        navItem.className = 'question-nav-item';
        
        // Determine label based on question type
        let label = '';
        if (question.id.startsWith('p')) {
            label = `P${question.id.substring(1)}`;
        } else if (question.id === 'pole_driver') {
            label = 'POLE';
        } else if (question.id === 'pole_time') {
            label = 'P.TIME';
        } else if (question.id === 'fastest_lap_driver') {
            label = 'FAST';
        } else if (question.id === 'fastest_lap_time') {
            label = 'F.TIME';
        } else if (question.id === 'most_positions') {
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
    
    navItems.forEach((item, index) => {
        item.classList.remove('active', 'completed');
        
        const question = questions[index];
        
        // Mark as completed if answered
        if (predictions[question.id]) {
            item.classList.add('completed');
        }
        
        // Mark current question as active
        if (index === currentQuestion) {
            item.classList.add('active');
            // Scroll into view
           item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

function navigateToQuestion(index) {
    // Allow navigation to any question without validation
    showQuestion(index);
}

function showQuestion(index) {
    currentQuestion = index;
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
        
        // Handle existing prediction value
        const existingValue = predictions[question.id];
        if (existingValue && existingValue.startsWith('1:')) {
            // Extract just the XX.XXX part
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
    nextBtnText.textContent = index < questions.length - 1 ? 'NEXT →' : 'SUBMIT';
}

function renderDrivers(questionId) {
    const driversGrid = document.getElementById('driversGrid');
    driversGrid.innerHTML = '';
    
    // Filter out already selected drivers ONLY for race position predictions (P1-P20)
    // For special predictions (pole, fastest lap, most positions), show all drivers
    let availableDrivers = drivers;
    if (questionId.startsWith('p') && questionId.match(/^p\d+$/)) {
        // Only filter for P1, P2, ... P20 (not pole_driver, etc.)
        availableDrivers = drivers.filter(driver => 
            !selectedDrivers.has(driver.name) || predictions[questionId] === driver.name
        );
    }
    
    // Keep drivers in team order (as defined in the drivers array)
    const sortedDrivers = [...availableDrivers];
    
    sortedDrivers.forEach(driver => {
        const card = document.createElement('div');
        card.className = 'driver-card';
        
        if (predictions[questionId] === driver.name) {
            card.classList.add('selected');
        }
        
        // Better layout for mobile - horizontal card with driver info grouped
        card.innerHTML = `
            <div class="driver-header">
                <div class="driver-number">${driver.number}</div>
                <img src="driver pics/${driverImages[driver.name]}" alt="${driver.name}" class="driver-image">
            </div>
            <div class="driver-info">
                <div class="driver-name">${driver.name}</div>
                <div class="driver-team">${driver.team}</div>
            </div>
        `;
        
        card.onclick = () => selectDriver(questionId, driver.name);
        card.ondblclick = () => {
            selectDriver(questionId, driver.name);
            setTimeout(() => nextQuestion(), 100); // Small delay to show selection before moving
        };
        driversGrid.appendChild(card);
    });
}

function selectDriver(questionId, driverName) {
    // Remove previous selection for this question from the set (only for position predictions)
    if (predictions[questionId] && questionId.startsWith('p') && questionId.match(/^p\d+$/)) {
        selectedDrivers.delete(predictions[questionId]);
    }
    
    // Add new selection
    predictions[questionId] = driverName;
    if (questionId.startsWith('p') && questionId.match(/^p\d+$/)) {
        selectedDrivers.add(driverName);
    }
    
    // Re-render drivers to show selection
    renderDrivers(questionId);
    
    // Update navigation bar to show completion
    updateQuestionNavigation();
}

function allQuestionsAnswered() {
    return questions.every(question => predictions[question.id]);
}

function nextQuestion() {
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
    
    // Move to next question or submit
    if (currentQuestion < questions.length - 1) {
        showQuestion(currentQuestion + 1);
    } else {
        // Check if all questions are answered before submitting
        if (!allQuestionsAnswered()) {
            alert('Get yo ass back here and submit all questions before leaving nigga or you will have to spectate joppe fuck julius. (Easter Egg)');
            return;
        }
        submitPredictions();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        showQuestion(currentQuestion - 1);
    }
}

function validateTime(time) {
    // Format: SS.mmm (seconds.milliseconds)
    const pattern = /^\d{2}\.\d{3}$/;
    return pattern.test(time);
}

async function submitPredictions() {
    try {
        // Show loading state
        const nextBtn = document.getElementById('nextBtn');
        const originalText = nextBtn.innerHTML;
        nextBtn.innerHTML = '<span>SUBMITTING...</span>';
        nextBtn.disabled = true;
        
        // Prepare data for Google Sheets
        const submissionData = {
            participantName: predictions.participantName,
            timestamp: predictions.timestamp,
            ...predictions
        };
        
        console.log('Submitting data:', submissionData);
        
        // Submit to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });
        
        // Show success screen
        document.getElementById('successName').textContent = predictions.participantName;
        showScreen('successScreen');
        
    } catch (error) {
        console.error('Error submitting predictions:', error);
        alert('Error submitting predictions. Please try again.');
        
        // Restore button
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.innerHTML = originalText;
        nextBtn.disabled = false;
    }
}

function resetForm() {
    // Reset all state
    currentQuestion = 0;
    predictions = {
        participantName: '',
        timestamp: ''
    };
    selectedDrivers.clear();
    
    // Clear inputs
    document.getElementById('participantName').value = '';
    
    // Show welcome screen
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











