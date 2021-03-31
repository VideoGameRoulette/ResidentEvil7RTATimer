const JSON_ADDRESS = "127.0.0.1";
const JSON_PORT = 7190;
const POLLING_RATE = 500;

const JSON_ENDPOINT = `http://${JSON_ADDRESS}:${JSON_PORT}/`;

var json;

const CurrentTime = () => {
	return Date.now();
}

var PreviousMap = "";
var CurrentMap = "";
var showTotal = false;
var endGame = false;
var timer = { start: null, end: null, completed: false }
var ballast = 0;

var paused = { start: null, end: null };

const timerStarted = () => {
	return Boolean(timer.start);
}

const timerEnded = () => {
	return timer.completed;
}

var time = 0;

const IsLoadingOrPaused = data => {
	return data.GameState == 4 || data.GameState == 8 || data.GameState == 256 || data.GameState == 512 || data.GameState == 262400 || data.GameState == 262144;
}

window.onload = function () {
	getData();
	setInterval(getData, POLLING_RATE);
};

var Asc = function (a, b) {
	if (a > b) return +1;
	if (a < b) return -1;
	return 0;
};

var Desc = function (a, b) {
	if (a > b) return -1;
	if (a < b) return +1;
	return 0;
};

function getData() {
	fetch(JSON_ENDPOINT)
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			appendData(data);
		})
		.catch(function (err) {
			console.log("Error: " + err);
		});
}

function IsMapChaging(_MapName) {
	if (_MapName != CurrentMap)
	{
		PreviousMap = CurrentMap;
		CurrentMap = _MapName;
		console.log(`Map Changed... Prev: ${PreviousMap} Curr: ${CurrentMap}`);
	}
}

const pad = i => i.toString().padStart(2, '0');

const timeDiff = () => {
  const timestamp = Math.floor((timer.end - (timer.start + ballast)) / 1000);

  const hours = Math.floor(timestamp / 60 / 60);
  const minutes = Math.floor(timestamp / 60) - hours * 60;
  const seconds = Math.floor(timestamp % 60);

  return {
    hours,
    minutes,
    seconds,
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    formattedMin: `${pad(minutes)}:${pad(seconds)}`,
  };
};

function IsRunStarted() {
	if (PreviousMap.includes("None") && CurrentMap.includes("Ship3FInfirmaryPast")) 
	{
		timer.start = CurrentTime();
		ballast = 0;
		PreviousMap = CurrentMap;
		console.log("New Run Started Resetting Timer...");
	}
}

function IsRunEnded(data) {
	
	if (PreviousMap.includes("c01Outside01") && endGame && data.PlayerInventory[0].ItemName == null && timerStarted() && !timerEnded())
	{
		timer.completed = true;
		console.log("Run Finished...", time.formatted);
	}
}

function IsTimerRunning(mainContainer) {
	if (timerStarted() && !timerEnded())
	{
		timer.end = CurrentTime();
		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#FFF">${timeDiff().formatted}</font></div>`;
	}
	else if (timerEnded())
	{
		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#00FF00">${timeDiff().formatted}</font></div>`;
	}
	else
	{
		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#FFF">00:00:00</font></div>`;
	}
}

function appendData(data) {
	var mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML = "";
	
	var pauseCheck = IsLoadingOrPaused(data);
	
	//GAME PAUSED OR LOADING
	if (timerStarted() && pauseCheck)
	{
		if (paused.start == null) 
		{ 
			paused.start = CurrentTime(); 
		}
		paused.end = CurrentTime();

		//TODO add real time pause edit
		//ballast = (paused.end - paused.start);
	}
	
	//GAME NOT PAUSED OR LOADING
	else if (timerStarted() && !pauseCheck)
	{
		if (paused.start != null) 
		{
			ballast = (paused.end - paused.start) + ballast;
			paused.start = null;
			paused.end = null;
		}
		console.log(ballast);
	}

	IsMapChaging(data.MapName);
	IsRunStarted();
	if (timerStarted() && !endGame) 
	{
		console.log(timerStarted());
		//endGame = (data.PlayerInventory[0] != null) ? data.PlayerInventory[0].ItemName.includes("Handgun_Albert") : false;
		if (endGame) { console.log("End Game Detected..."); }
	}
	IsRunEnded(data);
	IsTimerRunning(mainContainer);
}