# prestige  
Play my game [here](https://ashebashmash123.github.io/prestige/).  
Play asteriskman7's game [here](https://asteriskman7.github.io/prestige/).  
Play the original game [here](https://makiki99.github.io/prestige/).

---
Fork of fork of [makiki99's prestige](https://github.com/makiki99/prestige) by asteriskman7 with the following modifications:

asteriskman7's modifications:
1. Display total play time
1. Display time until next prestige is available
1. Prestiges are purchased automatically
1. Prestige type and time are logged when purchased
1. Offline time is only spent up until the point of the next prestige becoming available so a more optimal play can be simulated. (This is not strictly true but the same effect is present.)
1. Every prestige fires a 'prestige' event on document which includes the prestige level on the detail property. You can add an event listener to detect prestiges.
1. Coins are a continuous function of gain and time since last prestige so all sources of rounding error are removed.

My modifications:
1. 'Reset Game' button
1. Play time multipliers
1. Total prestige and play time multiplier display
