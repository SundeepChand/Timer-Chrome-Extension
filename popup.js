const hours = document.getElementById('hours');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');

const btnStart = document.getElementById('btn-start');
const btnSetTime = document.getElementById('btn-set-time');
const btnStop = document.getElementById('btn-stop');
const btnReset = document.getElementById('btn-reset');

// const timeInterval = setInterval(() => {
//     if (hours.value > 0) {
//         hours.value -= 1;
//     } else {
//         clearInterval(timeInterval);
//     }
// }, 1000);
chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, ({ time }) => {
    if (time) {
        showTime(time);
    }
})

const toggleInputFieldDisabled = () => {
    hours.disabled = !hours.disabled;
    minutes.disabled = !minutes.disabled;
    seconds.disabled = !seconds.disabled;
}

const showTime = (time) => {
    hours.value = time.hours;
    minutes.value = time.minutes;
    seconds.value = time.seconds;
}

btnStart.onclick = () => {
    chrome.runtime.sendMessage({ cmd: 'START_TIMER' });
}

btnSetTime.onclick = () => {
    console.log(btnSetTime);
    if (btnSetTime.textContent === 'SET TIME')
    {
        btnSetTime.textContent = 'SET';
        toggleInputFieldDisabled();
    }
    else if (btnSetTime.textContent === 'SET')
    {
        btnSetTime.textContent = 'SET TIME';
        toggleInputFieldDisabled();
        chrome.runtime.sendMessage({ cmd: 'SET_TIME', time: {
            hours: Number(hours.value),
            minutes: Number(minutes.value),
            seconds: Number(seconds.value),
        } });
    }
}

btnStop.onclick = () => {
    chrome.runtime.sendMessage({ cmd: 'STOP_TIMER' });
}

btnReset.onclick = () => {
    chrome.runtime.sendMessage({ cmd: 'RESET_TIMER' });
}