let data;

function reset() {
  data = {
    coins: 0,
    prestiges: [0,0,0,0,0,0,0,0,0,0],
    savedTime: 0,
    startTime: (new Date()).getTime()
  };

}

reset();

function getGain() {
	var gain = 1;
	data.prestiges.forEach(function (el) {
		gain *= 1+el;
	})
	return gain;
}

function getRequirement(id) {
	if (id === 0) {
		return Math.floor(Math.pow(1.5,data.prestiges[0])*10);
	} else {
		return Math.pow(id+1,data.prestiges[id]+1)
	}
}

function canActivatePrestige(id) {
	if (id===0) {
		return (data.coins >= getRequirement(0));
	} else {
		return (data.prestiges[id-1] >= getRequirement(id));
	}
}

function activatePrestige(id) {
	if (canActivatePrestige(id)) {
		log(`Prestige ${id + 1}`);		
		data.coins = 0;
		for (var i = 0; i < id; i++) {
			data.prestiges[i] = 0;
		}
		data.prestiges[id]++;
		draw();
		document.dispatchEvent(new CustomEvent('prestige', {detail: id}));
	}	
}

function update() {
	const curTime = (new Date()).getTime();
	let deltaTime;
	if (data.lastTime !== undefined) {
		deltaTime = (curTime - data.lastTime) / 1000;
	} else {
		deltaTime = 1;
	}

  if (deltaTime > 1) {
    data.savedTime += deltaTime - 1;
    deltaTime = 1;
  }

  const gain = getGain();

	data.coins += gain * deltaTime;

  const coinsUntilNextPrestige = Math.max(0, getRequirement(0) - data.coins);
  const timeUntilNextPrestige = coinsUntilNextPrestige / gain;

  if (data.savedTime >= timeUntilNextPrestige) {
    data.coins += coinsUntilNextPrestige;
    data.savedTime -= timeUntilNextPrestige;
  } else {
    data.coins += gain * data.savedTime;
    data.savedTime = 0;
  }

	localStorage.SHITPOST = JSON.stringify(data);
	localStorage.lastUpdate = Date.now().toString(10);
	data.lastTime = curTime;
}

function draw() {
	document.getElementById("coins").innerHTML = Math.floor(data.coins);
	document.getElementById("gain").innerHTML = getGain();
	data.prestiges.forEach(function (el, i) {
		document.getElementById("tier"+(i+1)+"cost").innerHTML = getRequirement(i);
		document.getElementById("tier"+(i+1)+"a").innerHTML = el;
		document.getElementById("tier"+(i+1)+"mul").innerHTML = "x"+(el+1);
		if (canActivatePrestige(i)) {
      activatePrestige(i);
			document.getElementById("tier"+(i+1)+"btn").disabled = false;
		} else {
			document.getElementById("tier"+(i+1)+"btn").disabled = true;
		}
	});

  //update total play time
  const curDate = new Date();
  const playTime = curDate.getTime() - data.startTime;
  document.getElementById('playTimeDiv').innerText = 'Total Play Time: ' + timeObjToLongStr(timeToObj(playTime / 1000));

  //update time until next nano
  const prestigeRequirement = getRequirement(0) - data.coins;
  const gain = getGain();
  const prestigeTime = prestigeRequirement / gain;
  document.getElementById('nextTimeDiv').innerText = 'Next Prestige In: ' + timeObjToLongStr(timeToObj(prestigeTime));
	
  //update date of next nano
  const nextDate = new Date(curDate.getTime() + prestigeTime * 1000);
  document.getElementById('nextDateDiv').innerText = 'Next Prestige At: ' + nextDate.toString();

  //update title bar
  document.title = timeObjToShortStr(timeToObj(prestigeTime));  
}

function log(msg) {
  const log = document.getElementById('log');
  const time = (new Date()).toString();
  log.innerText = `${time}: ${msg}\n${log.innerText}`;
}

//t is a time in seconds
function timeToObj(t) {
  const result = {};

  result.y = Math.floor(t / (365 * 24 * 60 * 60));
  t = t % (365 * 24 * 60 * 60);
  result.d = Math.floor(t / (24 * 60 * 60));
  t = t % (24 * 60 * 60);
  result.h = Math.floor(t / (60 * 60));
  t = t % (60 * 60);
  result.m = Math.floor(t / 60);
  t = t % 60;
  result.s = t;

  return result;
}

function leftPad(value, padChar, minLen) {
  return padChar.repeat(Math.max(0, minLen - value.toString().length)) + value;
}

function timeObjToLongStr(o) {
  return `${o.y} years ${this.leftPad(o.d, '0', 3)} days ${this.leftPad(o.h, '0', 2)} hours ${this.leftPad(o.m, '0', 2)} minutes ${this.leftPad(Math.floor(o.s), '0', 2)} seconds`;
}

function timeObjToShortStr(o) {
  if (o.y > 0) {return `${o.y}y${o.d}d`;}
  if (o.d > 0) {return `${o.d}d${o.h}h`;}
  if (o.h > 0) {return `${o.h}h${o.m}m`;}
  return `${o.m}m:${this.leftPad(Math.floor(o.s), '0', 2)}s`;
}

window.addEventListener("load",function () {
	if (localStorage.SHITPOST) {
		data = JSON.parse(localStorage.SHITPOST)
	}
	if (localStorage.lastUpdate) {
		var delta = Date.now() - parseInt(localStorage.lastUpdate,10)
		data.coins += Math.floor(getGain() * delta / 1000);
	}
	draw();
	for (var i = 0; i < 10; i++) {
		document.getElementById("tier"+(i+1)+"btn").addEventListener(
			"click",
			(function(n) {
				return (function () {
					activatePrestige(n);
				})
			}(i))
		);
	}
	setInterval(function () {
		update();
		draw();
	}, 1000);
	console.log("interval loaded")
})
