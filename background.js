let defaultTime = {
  hours: 0,
  minutes: 30,
  seconds: 0,
};
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ time: defaultTime }, () => {
    timer = new Timer();
    chrome.storage.sync.get(['time'], ({ time }) => {
      defaultTime = {
        hours: time.hours,
        minutes: time.minutes,
        seconds: time.seconds,
      };
    })
  });
});

let handle = 0;
class Timer {
  constructor() {
    this.currentTime = {
      hours: defaultTime.hours,
      minutes: defaultTime.minutes,
      seconds: defaultTime.seconds,
    };
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
    };
  }
  resetState = () => {
    this.currentState.paused = false;
    this.currentState.running = false;
    this.currentState.finished = false;
  }
  reset = () => {
    chrome.storage.sync.get(['time'], ({ time }) => {
      this.currentTime = {
        hours: time.hours,
        minutes: time.minutes,
        seconds: time.seconds,
      };
    });
    this.resetState();
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
      let badgeMinutes = this.currentTime.hours * 60 + this.currentTime.minutes;
      let badgeSeconds = this.currentTime.seconds;
      if (badgeMinutes < 0) {
        badgeMinutes = badgeSeconds = 0;
      }
      chrome.browserAction.setBadgeText({ text: `${badgeMinutes}:${badgeSeconds}`});
    } else {
      // Timer is over.
      this.reset();
      chrome.browserAction.setBadgeText({ text: '' });
      clearInterval(handle);
      handle = 0;
      chrome.tts.speak(`Time's up!`, {
        'lang': 'en-US',
        'rate': 1.5,
        'pitch': 1.5,
      });
    }
  };
};

let timer = new Timer();
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'START_TIMER' && !timer.currentState.running)
  {
    if (!timer.currentState.paused) {
      timer.reset();
    }
    timer.currentState.running = true;
    handle = setInterval(timer.decrement, 1000);
    sendResponse({ time: timer.currentTime, running: timer.currentState.running });
  }
  else if (request.cmd === 'SET_TIME' && !timer.currentState.running)
  {
    chrome.storage.sync.set({ time: request.time });
    defaultTime = {
      hours: request.time.hours,
      minutes: request.time.minutes,
      seconds: request.time.seconds,
    };
    timer = new Timer();
  }
  else if (request.cmd === 'STOP_TIMER' && timer.currentState.running)
  {
    timer.pause();
    clearInterval(handle);
    handle = 0;
    sendResponse({ time: timer.currentTime, running: timer.currentState.running });
  }
  else if (request.cmd === 'RESET_TIMER' && !timer.currentState.running)
  {
    timer = new Timer();
    sendResponse({ time: timer.currentTime, running: timer.currentState.running });
    chrome.browserAction.setBadgeText({ text: '' });
  }
  else if (request.cmd === 'GET_TIME')
  {
    sendResponse({
      time: timer.currentTime,
      running: timer.currentState.running,
      paused: timer.currentState.paused
    });
  }
  else
  {
    sendResponse(null);
  }
});