# prestige
[Game link](https://asteriskman7.github.io/prestige/)

Fork of [Makiki's prestige](https://github.com/makiki99/prestige) with the following modifications:

1. Display total play time
1. Display time until next prestige is available
1. Prestiges are purchased automatically
1. Prestige type and time are logged when purchased
1. Offline time is only spent up until the point of the next prestige becoming available so a more optimal play can be simulated. (This is not strictly true but the same effect is present.)
1. Every prestige fires a 'prestige' event on document which includes the prestige level on the detail property. You can add an event listener to detect prestiges.
1. Coins are a continuous function of gain and time since last prestige so all sources of rounding error are removed.
