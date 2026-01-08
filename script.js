class PomodoroTimer {
    constructor() {
        this.workDuration = 25 * 60; // 25 minutes in seconds
        this.shortBreakDuration = 5 * 60; // 5 minutes in seconds
        this.longBreakDuration = 15 * 60; // 15 minutes in seconds
        this.sessionsBeforeLongBreak = 4;
        
        this.currentMode = 'work';
        this.timeRemaining = this.workDuration;
        this.isRunning = false;
        this.intervalId = null;
        this.sessionCount = 0;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadSettings();
        this.updateDisplay();
    }

    initializeElements() {
        // Mode buttons
        this.modeButtons = document.querySelectorAll('.mode-btn');
        
        // Timer display
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        
        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Settings inputs
        this.workDurationInput = document.getElementById('workDuration');
        this.shortBreakDurationInput = document.getElementById('shortBreakDuration');
        this.longBreakDurationInput = document.getElementById('longBreakDuration');
        this.sessionsBeforeLongBreakInput = document.getElementById('sessionsBeforeLongBreak');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        
        // Session info
        this.sessionCountDisplay = document.getElementById('sessionCount');
        this.totalSessionsDisplay = document.getElementById('totalSessions');
        
        // Calculate circumference for progress circle
        const radius = 140;
        this.circumference = 2 * Math.PI * radius;
        this.progressCircle.style.strokeDasharray = this.circumference;
        this.progressCircle.style.strokeDashoffset = this.circumference;
    }

    attachEventListeners() {
        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isRunning) {
                    this.switchMode(e.target.dataset.mode);
                }
            });
        });

        // Control buttons
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Settings
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    }

    switchMode(mode) {
        if (this.isRunning) return;
        
        this.currentMode = mode;
        this.updateModeButtons();
        
        switch(mode) {
            case 'work':
                this.timeRemaining = this.workDuration;
                break;
            case 'shortBreak':
                this.timeRemaining = this.shortBreakDuration;
                break;
            case 'longBreak':
                this.timeRemaining = this.longBreakDuration;
                break;
        }
        
        this.updateDisplay();
    }

    updateModeButtons() {
        this.modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.currentMode) {
                btn.classList.add('active');
            }
        });
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.progressCircle.classList.add('active');
        
        this.intervalId = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.progressCircle.classList.remove('active');
        
        clearInterval(this.intervalId);
    }

    reset() {
        this.pause();
        
        switch(this.currentMode) {
            case 'work':
                this.timeRemaining = this.workDuration;
                break;
            case 'shortBreak':
                this.timeRemaining = this.shortBreakDuration;
                break;
            case 'longBreak':
                this.timeRemaining = this.longBreakDuration;
                break;
        }
        
        this.updateDisplay();
    }

    completeSession() {
        this.pause();
        this.playAlertSound();
        
        if (this.currentMode === 'work') {
            this.sessionCount++;
            this.sessionCountDisplay.textContent = this.sessionCount;
            
            // Determine next break type
            if (this.sessionCount % this.sessionsBeforeLongBreak === 0) {
                this.switchMode('longBreak');
            } else {
                this.switchMode('shortBreak');
            }
        } else {
            // Break completed, switch back to work
            this.switchMode('work');
        }
        
        // Show notification
        this.showNotification();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        
        this.minutesDisplay.textContent = String(minutes).padStart(2, '0');
        this.secondsDisplay.textContent = String(seconds).padStart(2, '0');
        
        // Update progress circle
        const totalTime = this.getTotalTimeForCurrentMode();
        const progress = (totalTime - this.timeRemaining) / totalTime;
        const offset = this.circumference - (progress * this.circumference);
        this.progressCircle.style.strokeDashoffset = offset;
    }

    getTotalTimeForCurrentMode() {
        switch(this.currentMode) {
            case 'work':
                return this.workDuration;
            case 'shortBreak':
                return this.shortBreakDuration;
            case 'longBreak':
                return this.longBreakDuration;
            default:
                return this.workDuration;
        }
    }

    playAlertSound() {
        // Create a pleasant alert sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create a pleasant two-tone chime
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Play a second chime after a short delay
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
            
            gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.5);
        }, 200);
    }

    showNotification() {
        // Request notification permission if not already granted
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = this.currentMode === 'work' 
                ? 'Break time! Take a well-deserved rest.' 
                : 'Break over! Time to get back to work.';
            
            new Notification('Pomodoro Timer', {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23667eea"/></svg>'
            });
        } else if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    saveSettings() {
        const workMinutes = parseInt(this.workDurationInput.value);
        const shortBreakMinutes = parseInt(this.shortBreakDurationInput.value);
        const longBreakMinutes = parseInt(this.longBreakDurationInput.value);
        const sessions = parseInt(this.sessionsBeforeLongBreakInput.value);
        
        // Validate inputs
        if (workMinutes < 1 || workMinutes > 60) {
            alert('Work duration must be between 1 and 60 minutes');
            return;
        }
        if (shortBreakMinutes < 1 || shortBreakMinutes > 30) {
            alert('Short break must be between 1 and 30 minutes');
            return;
        }
        if (longBreakMinutes < 1 || longBreakMinutes > 60) {
            alert('Long break must be between 1 and 60 minutes');
            return;
        }
        if (sessions < 1 || sessions > 10) {
            alert('Sessions before long break must be between 1 and 10');
            return;
        }
        
        // Save to localStorage
        const settings = {
            workDuration: workMinutes * 60,
            shortBreakDuration: shortBreakMinutes * 60,
            longBreakDuration: longBreakMinutes * 60,
            sessionsBeforeLongBreak: sessions
        };
        
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        
        // Update current settings
        this.workDuration = settings.workDuration;
        this.shortBreakDuration = settings.shortBreakDuration;
        this.longBreakDuration = settings.longBreakDuration;
        this.sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak;
        this.totalSessionsDisplay.textContent = settings.sessionsBeforeLongBreak;
        
        // Reset timer with new settings if not running
        if (!this.isRunning) {
            this.reset();
        }
        
        // Show confirmation
        const btn = this.saveSettingsBtn;
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.style.background = '#4caf50';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.workDuration = settings.workDuration;
            this.shortBreakDuration = settings.shortBreakDuration;
            this.longBreakDuration = settings.longBreakDuration;
            this.sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak;
            
            // Update input fields
            this.workDurationInput.value = this.workDuration / 60;
            this.shortBreakDurationInput.value = this.shortBreakDuration / 60;
            this.longBreakDurationInput.value = this.longBreakDuration / 60;
            this.sessionsBeforeLongBreakInput.value = this.sessionsBeforeLongBreak;
        }
        
        this.totalSessionsDisplay.textContent = this.sessionsBeforeLongBreak;
        this.timeRemaining = this.workDuration;
    }
}

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

