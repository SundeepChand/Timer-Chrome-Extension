const defaultTime = {
    hours: 0,
    minutes: 30,
    seconds: 0,
};
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ time: defaultTime });
});

let handle = 0;
class Timer {
    constructor() {
        chrome.storage.sync.get(['time'], ({ time }) => {
            this.currentTime = {
                hours: time.hours,
                minutes: time.minutes,
                seconds: time.seconds,
            };
        });
        this.currentState = {
            paused: false,
            running: false,
            finished: false,

            reset: () => {
                this.paused = false;
                this.running = false;
                this.finished = false;
            },
        };
    }
    reset = () => {
        chrome.storage.sync.get(['time'], ({ time }) => {
            this.currentTime = {
                hours: time.hours,
                minutes: time.minutes,
                seconds: time.seconds,
            };
        });
        this.currentState.reset();
    }
    pause = () => {
        clearInterval(handle);
        handle = 0;
        this.currentState.paused = true;
        this.currentState.running = false;
    }
    setTime = (time) => {
        this.currentTime.hours = time.hours;
        this.currentTime.minutes = time.minutes;
        this.currentTime.seconds = time.seconds;
    }
    decrement = () => {
        console.log(this.currentTime);
        if (this.currentTime.hours >= 0 && this.currentTime.minutes >= 0 && this.currentTime.seconds >= 0) {
            this.currentTime.seconds--;
            if (this.currentTime.seconds < 0) {
                this.currentTime.seconds = 59;
                this.currentTime.minutes--;
            }
            if (this.currentTime.minutes < 0) {
                this.currentTime.minutes = 59;
                this.currentTime.hours--;
            }
        } else {
            // Timer is over.
            this.currentState.reset();
            console.log('Timer over');
            clearInterval(handle);
            handle = 0;
        }
    };
};
let timer = new Timer();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.cmd === 'START_TIMER' && !timer.currentState.running)
    {
        console.log('Timer started');
        timer.currentState.reset();
        timer.currentState.running = true;
        if (!timer.currentState.paused) {
            chrome.storage.sync.get(['time'], ({ time }) => {
                timer.setTime(time);
            });
        }
        handle = setInterval(timer.decrement, 1000);
    }
    else if (request.cmd === 'SET_TIME' && !timer.currentState.running)
    {
        console.log('Time set to ', request.time);
        chrome.storage.sync.set({ time: request.time });
        timer = new Timer();
    }
    else if (request.cmd === 'STOP_TIMER' && timer.currentState.running)
    {
        console.log('Timer stopped');
        timer.pause();
        clearInterval(handle);
        handle = 0;
    }
    else if (request.cmd === 'RESET_TIMER' && !timer.currentState.running)
    {
        timer = new Timer();
    }
    else if (request.cmd === 'GET_TIME')
    {
        sendResponse({ time: timer.currentTime });
    }
});