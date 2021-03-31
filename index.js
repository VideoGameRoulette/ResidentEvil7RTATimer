const JSON_ADDRESS = "127.0.0.1";
const JSON_PORT = 7190;
const POLLING_RATE = 500;

const JSON_ENDPOINT = `http://${JSON_ADDRESS}:${JSON_PORT}/`;

var json;

var PreviousMap = "";
var CurrentMap = "";
var isStarted = false;
var isEnded = false;
var showTotal = false;
var endGame = false;
var start = 0;
var end = 0;
var time = 0;

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

const timeDiff = (start, end) => {
  const timestamp = Math.floor((end - start) / 1000);

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
		start = Date.now();
		isStarted = true;
		isEnded = false;
		showTotal = false;
		PreviousMap = CurrentMap;
		console.log("New Run Started Resetting Timer...");
	}
}

function IsRunEnded(data) {
	
	if (PreviousMap.includes("c01Outside01") && endGame && data.PlayerInventory[0].ItemName == null && isStarted && !isEnded)
	{
		isStarted = false;
		isEnded = true;
		console.log("Run Finished...", time.formatted);
	}
}

function IsTimerRunning(mainContainer) {
	if (isStarted && !isEnded)
	{
		end = Date.now();
		time = timeDiff(start, end);

		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#FFF">${time.formatted}</font></div>`;
	}
	else if (!isStarted && isEnded && !showTotal)
	{
		end = Date.now();
		time = timeDiff(start, end);
		showTotal = true;
		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#00FF00">${time.formatted}</font></div>`;
	}
	else if (!isStarted && !isEnded)
	{
		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#FFF">00:00:00</font></div>`;
	}
	else if (showTotal)
	{
		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#00FF00">${time.formatted}</font></div>`;
	}
}

function appendData(data) {
	var mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML = "";
	IsMapChaging(data.MapName);
	IsRunStarted();
	if (!endGame) 
	{ 
		endGame = (data.PlayerInventory[0].ItemName != null) ? data.PlayerInventory[0].ItemName.includes("Handgun_Albert") : false;
		if (endGame) { console.log("End Game Detected..."); }
	}
	IsRunEnded(data);
	IsTimerRunning(mainContainer);
}