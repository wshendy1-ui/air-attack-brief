"""Rebuild data/airports.json from the public-domain OurAirports files.

Usage:  python tools/build_airports.py airports.csv runways.csv data/airports.json
Source: https://github.com/davidmegginson/ourairports-data (airports.csv, runways.csv)

Keeps US airports with a 4-character identifier and at least one open,
hard-surfaced runway of 4,000 ft or more. Each airport becomes:
  [id, name, city, state, lat, lon, elev_ft, [runways]]
and each runway:
  [le_id, he_id, length_ft, width_ft, surface, le_lat, le_lon, he_lat, he_lon, le_hdg, he_hdg]
"""
import csv, json, re, sys

apt_csv, rwy_csv, out = sys.argv[1:4]
HARD = re.compile(r"ASP|CON|PEM|BIT|PAV|TAR", re.I)

def num(v, nd=None):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return round(f, nd) if nd is not None else int(round(f))

rwys = {}
with open(rwy_csv, newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        if r["closed"] == "1":
            continue
        length = num(r["length_ft"])
        if not length or not HARD.search(r["surface"] or ""):
            continue
        rwys.setdefault(r["airport_ident"], []).append([
            r["le_ident"], r["he_ident"], length, num(r["width_ft"]), (r["surface"] or "")[:12],
            num(r["le_latitude_deg"], 5), num(r["le_longitude_deg"], 5),
            num(r["he_latitude_deg"], 5), num(r["he_longitude_deg"], 5),
            num(r["le_heading_degT"], 1), num(r["he_heading_degT"], 1),
        ])

rows = []
with open(apt_csv, newline="", encoding="utf-8") as f:
    for a in csv.DictReader(f):
        key = a["ident"]
        pat = r"K[A-Z0-9]{3}|P[AH][A-Z0-9]{2}"
        ident = a["gps_code"] if re.fullmatch(pat, a["gps_code"] or "") else key
        if a["iso_country"] != "US" or a["type"] in ("closed", "heliport", "seaplane_base") or not re.fullmatch(pat, ident):
            continue
        rs = sorted(rwys.get(key, []), key=lambda r: -r[2])
        if not rs or rs[0][2] < 4000:
            continue
        rows.append([ident, a["name"], a["municipality"], a["iso_region"][3:],
                     num(a["latitude_deg"], 5), num(a["longitude_deg"], 5), num(a["elevation_ft"]) or 0, rs])

rows.sort(key=lambda r: r[0])
with open(out, "w", encoding="utf-8") as f:
    json.dump({"source": "OurAirports (public domain)", "airports": rows}, f, separators=(",", ":"))
print(len(rows), "airports written to", out)
