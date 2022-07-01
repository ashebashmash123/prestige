let data;

function reset() {
  data = {
    coins: 0,
    prestiges: [0,0,0,0,0,0,0,0,0,0],
    startTime: (new Date()).getTime(),
    lastPrestigeTime: (new Date()).getTime(),
    playTime: {y: 0, d: 0, h: 0, m: 0, s: 0}
  };
}

reset();

var prestigeMult = 1;
var playTimeMult = 1;

function getGain(t) {
	prestigeMult = 1;
	playTimeMult = 1;
  var gain = 1;
  data.prestiges.forEach(function(el, i) {
    gain *= (i+2)**el;
	prestigeMult *= (i+2)**el;
  });
  [60 ** t.m, 60 ** t.h, 24 ** t.d, 365 ** t.y].forEach(function(el) {
    if (el !== 0) {
      gain *= el;
	  playTimeMult *= el;
    }
  });
  return gain;
}

function getRequirement(id) {
  if (id === 0) {
    return Math.floor(Math.pow(1.5,data.prestiges[0])*10);
  } else {
    return Math.pow(id+1,data.prestiges[id]+1);
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
    data.lastPrestigeTime = (new Date()).getTime();
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

  let gain = getGain(data.playTime);

  const timeAtPrestige = curTime - data.lastPrestigeTime; //in milliseconds
  //to reduce rounding error, don't accumulate coins, just calculate it vs 
  //amount of time at this prestige level
  data.coins = timeAtPrestige * gain / 1000;
  
  //try to activate any prestige possible
  //but, save any extra time and generate more coin with it at the new gain level
  let anyActivated;
  do {
    anyActivated = false;
    data.prestiges.forEach( (el, i) => {
      if (canActivatePrestige(i)) {
        anyActivated = true;
        const activationCost = i === 0 ? getRequirement(i) : 0; //only prestige 0 costs coins
        const remainingTime = (data.coins - activationCost) / gain; //in seconds
        activatePrestige(i);
        //once we activate prestige, convert coins collected at previous prestige to coins
        //collected in the new prestige level
        gain = getGain(data.playTime);
        data.coins = remainingTime * gain;
        data.lastPrestigeTime = curTime - remainingTime * 1000;
      }
    });
  } while(anyActivated);

  localStorage.SHITPOST = JSON.stringify(data);
}

function draw() {
  //update total play time
  const curDate = new Date();
  const playTime = curDate.getTime() - data.startTime;
  data.playTime = timeToObj(playTime / 1000);
  document.getElementById('playTimeDiv').innerText = 'Total Play Time: ' + timeObjToLongStr(timeToObj(playTime / 1000));

  //update time until next nano
  const prestigeRequirement = getRequirement(0) - data.coins;
  const gain = getGain(data.playTime);
  const prestigeTime = prestigeRequirement / gain;
  document.getElementById('nextTimeDiv').innerText = 'Next Prestige In: ' + timeObjToLongStr(timeToObj(prestigeTime));
	
  //update date of next nano
  const nextDate = new Date(curDate.getTime() + prestigeTime * 1000);
  document.getElementById('nextDateDiv').innerText = 'Next Prestige At: ' + nextDate.toString();

  //update title bar
  document.title = timeObjToShortStr(timeToObj(prestigeTime));

  document.getElementById("coins").innerHTML = Math.floor(data.coins);
  document.getElementById("gain").innerHTML = getGain(data.playTime);
  document.getElementById("prestigeMult").innerHTML = prestigeMult;
  document.getElementById("playTimeMult").innerHTML = playTimeMult;
  data.prestiges.forEach(function (el, i) {
    document.getElementById("tier"+(i+1)+"cost").innerHTML = getRequirement(i);
    document.getElementById("tier"+(i+1)+"a").innerHTML = el;
    document.getElementById("tier"+(i+1)+"mul").innerHTML = "x"+(el+1);
    if (canActivatePrestige(i)) {
      document.getElementById("tier"+(i+1)+"btn").disabled = false;
    } else {
      document.getElementById("tier"+(i+1)+"btn").disabled = true;
    }
  });
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

function resetGame() {
	window.localStorage.clear();
	window.location.reload();
}

window.addEventListener("load",function () {
  if (localStorage.SHITPOST) {
    data = JSON.parse(localStorage.SHITPOST);
  }
  draw();
  for (var i = 0; i < 10; i++) {
    document.getElementById("tier"+(i+1)+"btn").addEventListener(
      "click", (function(n) {
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
  console.log("interval loaded");
});
