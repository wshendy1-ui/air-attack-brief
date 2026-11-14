// Copies the current TFRs from tfr.faa.gov into data/tfr.json so the dashboard can read them.
// Run by .github/workflows/tfr.yml. Needs Node 18 or newer; no packages to install.
//   node tools/pull_tfr.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = 'https://tfr.faa.gov';
const WFS = BASE + '/geoserver/TFR/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=TFR:V_TFR_LOC&maxFeatures=1000&outputFormat=application/json&srsname=EPSG:4326';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (air-attack-brief TFR copy; GitHub Actions)', 'Accept': 'application/json, application/xml, */*' };

async function get(url, as) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return as === 'json' ? await r.json() : await r.text();
    } catch (e) {
      if (attempt >= 3) throw new Error(`${url} -> ${e.message}`);
      await new Promise(res => setTimeout(res, 2000 * attempt));
    }
  }
}

// Pull the handful of values the dashboard shows out of the FAA's detail XML.
export function parseDetail(xml) {
  const tag = (name, src = xml) => { const m = src.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`)); return m ? m[1].trim() : null; };
  const utc = (v, tz) => (v && (!tz || tz === 'UTC') ? v.replace(/(\.\d+)?$/, '') + 'Z' : v);
  const areas = [...xml.matchAll(/<aseTFRArea>([\s\S]*?)<\/aseTFRArea>/g)].map(m => m[1]);
  const lim = (which) => {
    const all = areas.map(a => ({ v: Number(tag(`valDistVer${which}`, a)), uom: tag(`uomDistVer${which}`, a), code: tag(`codeDistVer${which}`, a) })).filter(x => Number.isFinite(x.v) && x.uom);
    if (!all.length) return null;
    const ft = x => (x.uom === 'FL' ? x.v * 100 : x.v);
    return all.reduce((a, b) => (which === 'Upper' ? (ft(b) > ft(a) ? b : a) : (ft(b) < ft(a) ? b : a)));
  };
  return {
    eff: utc(tag('dateEffective'), tag('codeTimeZone')),
    exp: utc(tag('dateExpire'), tag('codeExpirationTimeZone') || tag('codeTimeZone')),
    code: tag('codeType', tag('TfrNot') || ''),
    purpose: (tag('txtDescrPurpose') || '').slice(0, 240),
    upper: lim('Upper'), lower: lim('Lower'),
  };
}

const round = c => (typeof c[0] === 'number' ? [Math.round(c[0] * 1e4) / 1e4, Math.round(c[1] * 1e4) / 1e4] : c.map(round));

async function main() {
  const wfs = await get(WFS, 'json');
  if (!wfs || !Array.isArray(wfs.features)) throw new Error('Unexpected response from the TFR map service');
  const feats = wfs.features.filter(f => f.geometry);
  const details = {};
  const ids = [...new Set(feats.map(f => String(f.properties.NOTAM_KEY || '').split('-')[0]).filter(Boolean))];
  let failed = 0;
  for (let i = 0; i < ids.length; i += 6) {
    await Promise.all(ids.slice(i, i + 6).map(async id => {
      try { details[id] = parseDetail(await get(`${BASE}/download/detail_${id.replace('/', '_')}.xml`, 'text')); }
      catch (e) { failed++; details[id] = {}; console.warn('detail failed:', id, e.message); }
    }));
  }
  const out = {
    generated: new Date().toISOString(),
    source: 'tfr.faa.gov',
    features: feats.map(f => {
      const p = f.properties, notam = String(p.NOTAM_KEY || '').split('-')[0];
      return { type: 'Feature', geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
        properties: { notam, type: p.LEGAL || null, title: p.TITLE || null, state: p.STATE || null, facility: p.CNS_LOCATION_ID || null, ...details[notam] } };
    }),
  };
  mkdirSync('data', { recursive: true });
  writeFileSync('data/tfr.json', JSON.stringify(out));
  console.log(`Wrote data/tfr.json: ${out.features.length} TFR shapes, ${ids.length - failed}/${ids.length} with details`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error('TFR copy failed:', e.message); process.exit(1); });
