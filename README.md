# Air Attack Risk Brief — build 2

A pre-flight situational brief for ATGS missions. Pick the staffing airport,
aircraft, search radius and incident, enter the mission and crew details, and
the page builds a rated factor table in the FRAT's 5M order.

**Situational awareness only. Not for navigation or dispatch.** Aircraft
numbers and rating thresholds are placeholders pending ATGS review.

## New in build 2

- **Route weather advisories.** G-AIRMETs, SIGMETs and Center Weather
  Advisories that cross the planned route during the planned flight window
  are listed and rated, and drawn on the map as dashed outlines. Works in
  Live and Replay.
- **Military airspace.** Special use airspace and military training routes
  are drawn on the map with their published altitudes and times of use. The
  brief flags any area the route crosses and any training route within 10 nm
  of the fire. The flag clears when "deconflicted with dispatch" is ticked.
- **TFRs.** Shapes, altitudes and times are copied from tfr.faa.gov by a
  scheduled job and drawn on the map. The brief shows the TFR at the fire and
  rates any other TFR the route crosses. Live mode only.
- **Layer switches** above the map for zones, TFRs, military airspace and
  weather advisories.

### Upgrading from build 1.1

1. Upload the new `index.html`, `README.md` and `tools/pull_tfr.mjs`
   (**Add file → Upload files**; drag the `tools` folder so the script keeps
   its folder name).
2. Add the scheduled job. In the repository choose **Add file → Create new
   file**, type the name `.github/workflows/tfr.yml` (the slashes create the
   folders), paste in the contents of that file from this package, and commit.
   With git you can simply copy the `.github` folder in and push.
3. Open the **Actions** tab. If GitHub asks, enable workflows. Click
   **Copy TFRs → Run workflow → Run workflow**.
4. After about a minute the run should show a green tick and `data/tfr.json`
   should appear in the repository. From then on it runs about every
   20 minutes on its own.
5. Hard-refresh the site (Ctrl+F5). The "TFRs" chip should read something
   like "TFRs: 54 nationwide, 3 min old".

If the run fails:

| What the log says | What to do |
|---|---|
| `Permission denied` or `403` on **git push** | Settings → Actions → General → Workflow permissions → **Read and write permissions** → Save, then run it again. |
| `TFR copy failed: ... HTTP 403` (or a timeout) on the **Fetch TFRs** step | The FAA site is refusing GitHub's servers. This could not be tested ahead of time. The dashboard keeps working with TFRs as a manual check; report the error so another route can be set up. |

The dashboard never trusts an old copy. If the newest copy is more than an
hour old the TFR rows switch to "check manually" and the shapes come off the
map. The "TFRs confirmed with an official source" check box stays either way.

## New in build 1.1

- **Fire weather zones.** Zone outlines load for the search radius. Zones under
  a Red Flag Warning are shaded red and zones under a Fire Weather Watch amber,
  each with its start and end time in the staffing airport's local time.
- **New-start counts.** Every zone shows how many wildfires were discovered in
  it in the last 24 and 48 hours. The count includes fires that are already out.
- **Standby brief.** In step 4, switch to **Fire weather zones** and pick a
  zone (or click one on the map) to run the brief to the zone's center, for a
  fire that hasn't started yet. Click inside the selected zone on the map to
  move the point. Incident-only rows read "N/A."
- **Zone row for real incidents too.** The brief for any incident now shows
  the warning or watch for the zone the fire is in, and that zone's new starts.
- **Climb and descent allowance.** The first 10 minutes after a takeoff and
  the last 10 minutes before a landing are figured at 70% of cruise speed.
  Legs longer than the climb distance gain a flat 3 minutes at each end.

## What is in this package

```
air-attack-brief/
  index.html                 <- the whole dashboard (one file)
  data/airports.json         <- 2,629 US airports with runways (OurAirports, public domain)
  tools/build_airports.py    <- rebuilds airports.json when you want fresh runway data
  tools/pull_tfr.mjs         <- copies TFRs from tfr.faa.gov into data/tfr.json
  .github/workflows/tfr.yml  <- runs that copy about every 20 minutes
  README.md                  <- this guide
```

There is **no API key**. Every feed except TFRs is called live from the
browser when the page opens. TFRs come from one small scheduled job:

| Data | Source |
|---|---|
| Incidents and perimeters | NIFC WFIGS (current services for Live, year-to-date and daily-perimeter services for Replay) |
| Airport weather (METAR, TAF) | Iowa Environmental Mesonet, a mirror of National Weather Service data |
| Terrain elevation at the fire | USGS Elevation Point Query Service |
| Fire weather zone outlines | NOAA/NWS reference map service |
| G-AIRMETs, SIGMETs, Center Weather Advisories | Iowa Environmental Mesonet copy of Aviation Weather Center products (live and archived) |
| Special use airspace, military training routes | FAA aeronautical data service |
| TFRs | tfr.faa.gov, copied into `data/tfr.json` by the scheduled job |
| Red Flag Warnings and Fire Weather Watches | NWS alerts feed (Live), Iowa Environmental Mesonet warning archive (Replay) |
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
3. In step 4 you should see roughly **55 incidents**, including **Hagen** northwest of
   La Grande with a shaded perimeter of about 19,700 acres.
4. The weather box should show the archived La Grande observation from just
   before the launch time. With launch at 13:00 it is the 1956Z report:
   wind 020° at 5 kt, 8 miles, clear, 31 °C.
5. Click **Hagen** in the list or on the map. The brief, route timing and
   factor table fill in.
6. In step 4, switch to **Fire weather zones**. You should see **26 zones**,
   six of them under a Red Flag Warning. **ORZ697 Central Blue Mountains** and
   **ORZ691 Lower Columbia Basin of Oregon** show `RFW 1000–2000`. The busiest
   zone for new starts is **ORZ700 Central Mountains of Oregon** with 5 in
   24 hours and 17 in 48 hours.
7. Pick ORZ697 to see a standby brief. The "Fire weather zone" row should be
   rated High because the warning covers the planned time over the zone.
8. Go back to **Incidents** and pick **Hagen**. In the factor table you
   should see **G-AIRMETs on the route: Mountain obscuration · Low-level
   turbulence** rated High, no SIGMETs or Center Weather Advisories on the
   route, and military airspace flagging **IR-343** about 5 nm from the fire.
   TFRs read "Not available in replay."
9. Change **Planned launch** to move through the day: the weather, incident
   list and perimeters reload for the new time.
10. Try the **Replay** date picker for any other day in 2026.

Things to try: another staffing airport, a wider radius, the incident-type
checkboxes, the runway dropdown, the basemap dropdown, a recovery airport
under "After the mission, land at", and **Copy brief**.

## What Replay can and cannot show

- **Perimeters and acres** are as mapped on or before the replay time, from
  the WFIGS daily perimeter history.
- **Weather** is the archived METAR for that time. TAFs are not shown.
- **Weather advisories** come from the archive of what was issued.
- **TFRs** are not archived, so they are not shown.
- **Military airspace** is the current published geometry, not what was
  charted on the replay date.
- **Warnings and watches** come from the archive of what was issued, with
  their start and end times.
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
| "Fire wx zones: failed" or "RFW / FWW: failed" chip | The NOAA or NWS service is not responding. The incident brief still works; use **Retry** in the zone list or reload the page. |
| "TFRs: no data yet" or "copy is … old" chip | The scheduled job has not run or is failing. Check the Actions tab. |
| Local preview shows nothing | `file://` cannot fetch data. Run `python -m http.server 8000` in the folder and open http://localhost:8000. |

## Not in this build

- NOTAMs. They remain a manual check box.
- Whether a military area or training route is active. Only the published
  times of use are shown; dispatch confirms the rest.
- Real aircraft performance numbers. The four profiles use placeholders.
- A verified list of ATGS bases. The grouped list is a starter set; any other
  airport can be typed into the "any other airport" box.

## Where to change things

All in `index.html`, near the top of the script:

- `BASES` — the staffing-airport list by GACC, with time zones.
- `AIRCRAFT` — profiles (cruise, endurance, single-engine ceiling, crosswind
  limit, sea-level takeoff distance).
- `RESERVE_H` — fuel reserve held back, in hours.
- `CLIMB_MIN`, `DESC_MIN`, `SLOW_FRAC` — the climb and descent allowance.
- `TFR_STALE_MIN`, `TFR_NM`, `MTR_NM` — how old a TFR copy may be, and the
  distances used to tie a TFR or training route to the fire.
- `GAIR` — which G-AIRMET hazards are shown and how each is rated.
- `WORK_AGL` — working altitude above the fire by mission type.
- Rating thresholds are in `renderBrief`, one line per factor.
