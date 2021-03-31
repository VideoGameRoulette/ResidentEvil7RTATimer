const JSON_ADDRESS = "127.0.0.1";
const JSON_PORT = 7190;
const POLLING_RATE = 500;

const JSON_ENDPOINT = `http://${JSON_ADDRESS}:${JSON_PORT}/`;

var json;

var PreviousMap = "";
var CurrentMap = "";
var isStarted = false;
var isEnded = false;
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

function MapChaged(_MapName) {
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

function appendData(data) {
	var mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML = "";
	MapChaged(data.MapName);

	if (CurrentMap.includes("None") && data.MaxHP == 0) 
	{
		isStarted = false;
	}

	if (CurrentMap.includes("Ship3FInfirmaryPast") && !CurrentMap.includes("뇐") && !isStarted)
	{
		start = Date.now();
		isStarted = true;
		isEnded = false;
		console.log("New Run Started Reseting Boss Values...");
		InitBosses();
		console.log(enemyHP);
	}

	if (PreviousMap.includes("irs01A_Action") && CurrentMap.includes("None") && isStarted && !isEnded)
	{
		isStarted = false;
		isEnded = true;
		console.log("Run Finished Reseting Boss Values...");
		console.log(enemyHP);
	}

	if (isStarted && !isEnded)
	{
		end = Date.now();
		time = timeDiff(start, end);
		//console.log(time);
		
		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#FFF">${time.formatted}</font></div>`;
	}
	else if (!isStarted)
	{
		end = Date.now();
		time = timeDiff(start, end);
		//console.log(time);
		
		mainContainer.innerHTML += `
		<div class="tag">
			<i class="fas fa-clock"></i>
		</div>
		<div id="value"><font size="4" color="#FFF">00:00:00</font></div>`;
	}
}