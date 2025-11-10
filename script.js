// Configuration - Update this with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// F1 2025 Drivers Data
const drivers = [
    { number: 1, name: 'MAX VERSTAPPEN', team: 'Red Bull Racing' },
    { number: 22, name: 'YUKI TSUNODA', team: 'Red Bull Racing' },
    { number: 44, name: 'LEWIS HAMILTON', team: 'Ferrari' },
    { number: 16, name: 'CHARLES LECLERC', team: 'Ferrari' },
    { number: 4, name: 'LANDO NORRIS', team: 'McLaren' },
    { number: 81, name: 'OSCAR PIASTRI', team: 'McLaren' },
    { number: 63, name: 'GEORGE RUSSELL', team: 'Mercedes' },
    { number: 12, name: 'KIMI ANTONELLI', team: 'Mercedes' },
    { number: 14, name: 'FERNANDO ALONSO', team: 'Aston Martin' },
    { number: 18, name: 'LANCE STROLL', team: 'Aston Martin' },
    { number: 10, name: 'PIERRE GASLY', team: 'Alpine' },
    { number: 43, name: 'FRANCO COLAPINTO', team: 'Alpine' },
    { number: 87, name: 'OLIVER BEARMAN', team: 'Haas' },
    { number: 31, name: 'ESTEBAN OCON', team: 'Haas' },
    { number: 27, name: 'NICO HULKENBERG', team: 'Sauber' },
    { number: 5, name: 'GABRIEL BORTOLETO', team: 'Sauber' },
    { number: 55, name: 'CARLOS SAINZ', team: 'Williams' },
    { number: 23, name: 'ALEX ALBON', team: 'Williams' },
    { number: 21, name: 'ISACK HADJAR', team: 'Racing Bulls' },
    { number: 40, name: 'LIAM LAWSON', team: 'Racing Bulls' }
];

// Questions structure
const questions = [
    // Position predictions (P1 to P20)
    ...Array.from({ length: 20 }, (_, i) => ({
        id: `p${i + 1}`,
        title: `YOUR P${i + 1}`,
        type: 'driver',
        questionNumber: `QUESTION ${i + 1} / 24`
    })),
    // Special predictions
    { id: 'pole_driver', title: 'POLE POSITION DRIVER', type: 'driver', questionNumber: 'QUESTION 21 / 24' },
    { id: 'pole_time', title: 'POLE LAP TIME', type: 'time', questionNumber: 'QUESTION 22 / 24', placeholder: '1:23.456' },
    { id: 'fastest_lap_driver', title: 'FASTEST LAP DRIVER', type: 'driver', questionNumber: 'QUESTION 23 / 24' },
    { id: 'fastest_lap_time', title: 'FASTEST LAP TIME', type: 'time', questionNumber: 'QUESTION 24 / 24', placeholder: '1:23.456' },
    { id: 'most_positions', title: 'DRIVER GAINING MOST POSITIONS', type: 'driver', questionNumber: 'QUESTION 25 / 24' }
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
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
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
        const timeInput = document.getElementById('timeInput');
        timeInput.placeholder = question.placeholder;
        timeInput.value = predictions[question.id] || '';
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
    
    // Sort drivers by number for easier selection
    const sortedDrivers = [...availableDrivers].sort((a, b) => a.number - b.number);
    
    sortedDrivers.forEach(driver => {
        const card = document.createElement('div');
        card.className = 'driver-card';
        
        if (predictions[questionId] === driver.name) {
            card.classList.add('selected');
        }
        
        // Better layout for mobile - horizontal card with driver info grouped
        card.innerHTML = `
            <div class="driver-number">${driver.number}</div>
            <div class="driver-info">
                <div class="driver-name">${driver.name}</div>
                <div class="driver-team">${driver.team}</div>
            </div>
        `;
        
        card.onclick = () => selectDriver(questionId, driver.name);
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

function nextQuestion() {
    const question = questions[currentQuestion];
    
    // Validate current question
    if (question.type === 'driver') {
        if (!predictions[question.id]) {
            alert('Please select a driver');
            return;
        }
    } else {
        const timeInput = document.getElementById('timeInput').value.trim();
        if (!timeInput) {
            alert('Please enter a time');
            return;
        }
        if (!validateTime(timeInput)) {
            alert('Please enter time in format MM:SS.mmm (e.g., 1:23.456)');
            return;
        }
        predictions[question.id] = timeInput;
        updateQuestionNavigation();
    }
    
    // Move to next question or submit
    if (currentQuestion < questions.length - 1) {
        showQuestion(currentQuestion + 1);
    } else {
        submitPredictions();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        showQuestion(currentQuestion - 1);
    }
}

function validateTime(time) {
    // Format: M:SS.mmm or MM:SS.mmm
    const pattern = /^\d{1,2}:\d{2}\.\d{3}$/;
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
