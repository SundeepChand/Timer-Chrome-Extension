const hours = document.getElementById('hours');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');

const btnStart = document.getElementById('btn-start');
const btnSetTime = document.getElementById('btn-set-time');
const btnStop = document.getElementById('btn-stop');
const btnReset = document.getElementById('btn-reset');

const afterGetMessage = (response) => {
  if (response) {
    if (response.time) {
      showTime(response.time);
      if (response.running) {
        handle = setInterval(() => {
          decrement(response.time);
          showTime(response.time);
        }, 1000);
      }
    }
    if (response.running) {
      disableButtons(true, true, false, true);
    } else if (response.paused) {
      disableButtons(false, true, true, false);
    }
  }
}

let handle = 0;
chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, afterGetMessage);

const toggleInputFieldDisabled = () => {
  hours.disabled = !hours.disabled;
  minutes.disabled = !minutes.disabled;
  seconds.disabled = !seconds.disabled;
}
const disableButtons = (start = false, setTime = false, Stop = false, reset = false) => {
  btnReset.disabled = reset;
  btnStart.disabled = start;
  btnStop.disabled = Stop;
  btnSetTime.disabled = setTime;
}

const showTime = (time) => {
  if (time.hours < 0) {
    time.hours = time.minutes = time.seconds = 0;
  }
  hours.value = time.hours < 10 ? `0${time.hours}` : time.hours;
  minutes.value = time.minutes < 10 ? `0${time.minutes}` : time.minutes;
  seconds.value = time.seconds < 10 ? `0${time.seconds}` : time.seconds;
}

const decrement = (time) => {
  if (time.hours >= 0 && time.minutes >= 0 && time.seconds >= 0) {
    time.seconds--;
    if (time.seconds < 0) {
      time.seconds = 59;
      time.minutes--;
    }
    if (time.minutes < 0) {
      time.minutes = 59;
      time.hours--;
    }
  } else {
    // Timer is over.
    clearInterval(handle);
    handle = 0;
  }
};

btnStart.onclick = () => {
  chrome.runtime.sendMessage({ cmd: 'START_TIMER' }, (response) => {
    if (response && response.time) {
      disableButtons(true, true, false, true);
      showTime(response.time);
      if (response.running) {
        handle = setInterval(() => {
          decrement(response.time);
          showTime(response.time);
        }, 1000);
      }
    }
  });
}

btnSetTime.onclick = () => {
  if (btnSetTime.textContent === 'Set Time')
  {
    disableButtons(true, false, true, true);
    btnSetTime.textContent = 'Done';
    toggleInputFieldDisabled();
  }
  else if (btnSetTime.textContent === 'Done')
  {
    btnSetTime.textContent = 'Set Time';
    disableButtons();
    toggleInputFieldDisabled();
    chrome.runtime.sendMessage({ cmd: 'SET_TIME', time: {
      hours: Number(hours.value),
      minutes: Number(minutes.value),
      seconds: Number(seconds.value),
    } });
  }
}

btnStop.onclick = () => {
  chrome.runtime.sendMessage({ cmd: 'STOP_TIMER' }, (response) => {
    if (response && response.time) {
      disableButtons(false, true, true, false);
      showTime(response.time);
      clearInterval(handle);
      handle = 0;
    }
  });
}

btnReset.onclick = () => {
  chrome.runtime.sendMessage({ cmd: 'RESET_TIMER' }, (response) => {
    if (response && response.time) {
      disableButtons();
      showTime(response.time);
      clearInterval(handle);
      handle = 0;
    }
  });
}