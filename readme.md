# NguhRoutes
This is a project for route planning for Cenrail, Leshrail and possibly other rail networks on Nguhcrafts. Currently, it is mostly a **proof-of-concept**. It is now available as [a website](https://nguhroutes.viklo.workers.dev/), which loads precalculated routes from a JSON file and lets you query them.

NguhRoutes now has data for most lines that are on the latest version of SQ's Cenrail map. The data has measurements for the time and distance between stations, as well as the positions of stations. If you want to see the data, it is in `src/json/network.jsonc`.

I am not sure whether it is best to have this become something that you use as a website, as something that is just merged into [Annwan's new map project](https://git.annwan.me/software/nguhmap) or as a mod (integrated into the Nguhcraft mod or standalone). I have made it so that it precalculates the optimal route for every possible pair of stations and outputs that as a JSON file so that the JSON file could potentially be used by other projects.
## How to run
Currently, this is usable as a Typescript command-line application, as well as [a website](https://nguhroutes.viklo.workers.dev/). The command-line application prints a route and outputs the full list of routes to a JSON file. Here is the usage:
```
Usage: ts-node cmd.ts [-- [options]]

Arguments:
        -s, --start <station>   Set start station code (default: N-SVW)
        -e, --end <station>     Set end station code (default: N-XSG)
        -h, --help              Show this help message
```
Here is example output:
```
ROUTE FROM SVW TO SXG:
=============
STV (forest)
NKI (forest)
AKI (forest)
KAY (forest)
CBM (forest)
CBN (cuban)
XSH (cuban)
RPA (southern)
ARF (southern)
ARA (southern)
TQT (western)
TZM (southern)
KCM (southern)
KCC (central)
KCY (central)
STS (slab)
SXG (slab)
Exported routes to "/home/viklo/ts/nguhroutes/gen/routes.json".
```
