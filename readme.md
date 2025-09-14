# NguhRoutes
This is a project for route planning for Cenrail, Leshrail and possibly other rail networks on Nguhcrafts. Currently, it is very basic and mostly a **proof-of-concept**, and **only supports some of Cenrail**. In the future, it could take actual rail line segment length into account, and maybe even the time it takes to switch between tracks at a station.

I am not sure whether it is best to have this become something that you use as a website, as something that is just merged into [Annwan's new map project](https://git.annwan.me/software/nguhmap) or as a mod (integrated into the Nguhcraft mod or standalone). I have made it so that it precalculates the optimal route for every possible pair of stations and outputs that as a JSON file so that the JSON file could potentially be used by other projects.

The Cenrail data is from Total Pleb. Currently, the application always calculates all routes, so that's why it seems a bit slow.
## How to run
Currently, this is only usable as a Typescript command-line application. It prints a route and outputs the full list of routes to a JSON file. Here is the usage:
```
Usage: ts-node index.ts [-- [options]]

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
