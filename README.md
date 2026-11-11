# Air Attack Risk Brief — build 1

A pre-flight situational brief for ATGS missions. Pick the staffing airport,
aircraft, search radius and incident, enter the mission and crew details, and
the page builds a rated factor table in the FRAT's 5M order.

**Situational awareness only. Not for navigation or dispatch.** Aircraft
numbers and rating thresholds are placeholders pending ATGS review.

## What is in this package

```
air-attack-brief/
  index.html                 <- the whole dashboard (one file)
  data/airports.json         <- 2,629 US airports with runways (OurAirports, public domain)
  tools/build_airports.py    <- rebuilds airports.json when you want fresh runway data
  README.md                  <- this guide
```

There is **no scheduled job and no API key**. Every feed is called live from
the browser when the page opens:

| Data | Source |
|---|---|
| Incidents and perimeters | NIFC WFIGS (current services for Live, year-to-date and daily-perimeter services for Replay) |
| Airport weather (METAR, TAF) | Iowa Environmental Mesonet, a mirror of National Weather Service data |
| Terrain elevation at the fire | USGS Elevation Point Query Service |
| Basemaps | USGS Topo, USGS Imagery, OpenStreetMap, Carto |
| Airports and runways | `data/airports.json` in this repo |

## Step 1 — create the repository

1. Sign in at github.com and click **+** (top right) → **New repository**.
2. Repository name: `air-attack-brief`.
3. Visibility: **Public**. GitHub Pages on the free plan needs a public repo.
   Nothing in this package is sensitive: there are no keys or logins in it.
4. Leave "Add a README" unticked (this package brings its own).
5. Click **Create repository**.

## Step 2 — upload the files

Pick one of the two ways.

### Option A: in the browser (simplest)

1. Unzip `air-attack-brief.zip` on your computer.
2. On the new repository's page, click **uploading an existing file**
   (or **Add file → Upload files**).
3. Open the unzipped `air-attack-brief` folder, select **everything inside it**
   (`index.html`, `README.md`, and the `data` and `tools` folders) and drag it
   all onto the upload box. Use Chrome or Edge so the folders keep their
   structure.
4. Check the file list shows `data/airports.json` and
   `tools/build_airports.py` with their folder names in front.
5. Scroll down, type a message such as `build 1`, and click **Commit changes**.

### Option B: with git (same as the fire potential repo)

```powershell
cd C:\
git clone https://github.com/wshendy1-ui/air-attack-brief.git
# copy the contents of the unzipped air-attack-brief folder into C:\air-attack-brief
cd C:\air-attack-brief
git add .
git commit -m "build 1"
git push
```

## Step 3 — turn on GitHub Pages

1. In the repository: **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: **main**, folder **/ (root)**. Click **Save**.
4. Wait one to two minutes. The site address appears at the top of that page:

```
https://wshendy1-ui.github.io/air-attack-brief/
```

## Step 4 — run the test case

Fire season is over, so Live mode will show few or no incidents. Use the
built-in test case:

1. Open the site and click **Test case: Jul 25, 2026**.
   The page switches to Replay for that date (National Preparedness Level 5).
2. Leave the staffing airport on **KLGD · La Grande** and the radius on 100 nm.
3. You should see roughly **55 incidents**, including **Hagen** northwest of
   La Grande with a shaded perimeter of about 19,700 acres.
4. The weather box should show the archived La Grande observation from just
   before the launch time. With launch at 13:00 it is the 1956Z report:
   wind 020° at 5 kt, 8 miles, clear, 31 °C.
5. Click **Hagen** in the list or on the map. The brief, route timing and
   factor table fill in.
6. Change **Planned launch** to move through the day: the weather, incident
   list and perimeters reload for the new time.
7. Try the **Replay** date picker for any other day in 2026.

Things to try: another staffing airport, a wider radius, the incident-type
checkboxes, the runway dropdown, the basemap dropdown, a recovery airport
under "After the mission, land at", and **Copy brief**.

## What Replay can and cannot show

- **Perimeters and acres** are as mapped on or before the replay time, from
  the WFIGS daily perimeter history.
- **Weather** is the archived METAR for that time. TAFs are not shown.
- **Complexity level** comes from the incident's latest record, so a fire
  that was later upgraded or downgraded shows its final level.
- **Containment** for that day is not available and is left blank.

## Updating later

Replace `index.html` (Add file → Upload files, or `git add` / `commit` /
`push`) and Pages republishes in a minute or two. If the page looks unchanged,
hard-refresh the browser (Ctrl+F5).

To refresh runway data, download `airports.csv` and `runways.csv` from
https://github.com/davidmegginson/ourairports-data and run:

```powershell
python tools\build_airports.py airports.csv runways.csv data\airports.json
```

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| "Could not load data/airports.json" | The `data` folder did not upload, or the page was opened as a local file. Check the repo shows `data/airports.json`; open the github.io address. |
| 404 at the github.io address | Pages is not enabled yet, or the first publish has not finished. Recheck Step 3 and wait two minutes. |
| "WFIGS incidents: failed" chip | NIFC's service is slow or down. Click **Retry** in the incident list. |
| "METAR: no observation found" | The airport has no weather station reporting at that time. Pick a nearby airport to see conditions. |
| Map is blank but the brief works | The basemap server is not responding. Choose another basemap from the dropdown. |
| Local preview shows nothing | `file://` cannot fetch data. Run `python -m http.server 8000` in the folder and open http://localhost:8000. |

## Not in build 1

- TFRs, route weather advisories (G-AIRMET, SIGMET, CWA) and SUA/MTR shapes.
  These are planned for build 2. TFRs, NOTAMs and military airspace are
  manual check boxes for now.
- Real aircraft performance numbers. The four profiles use placeholders.
- A verified list of ATGS bases. The grouped list is a starter set; any other
  airport can be typed into the "any other airport" box.

## Where to change things

All in `index.html`, near the top of the script:

- `BASES` — the staffing-airport list by GACC, with time zones.
- `AIRCRAFT` — profiles (cruise, endurance, single-engine ceiling, crosswind
  limit, sea-level takeoff distance).
- `RESERVE_H` — fuel reserve held back, in hours.
- `WORK_AGL` — working altitude above the fire by mission type.
- Rating thresholds are in `renderBrief`, one line per factor.
