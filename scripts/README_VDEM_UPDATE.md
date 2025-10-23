# V-Dem Data Update Script

Semi-automated script to parse and update V-Dem (Varieties of Democracy) dataset.

**NOTE:** V-Dem requires email registration - manual download required (see below).

## Quick Start (After Manual Download)

```bash
npm run update-vdem
```

This will:
1. Look for V-Dem CSV in `tmp/` directory
2. Parse and extract data for 33 key countries
3. Update `src/data/cache/vdem/vdem_2024_full.json`
4. Update metadata with version and timestamp

## Manual Download Required

V-Dem requires email registration for downloads. Follow these steps:

### Step 1: Download V-Dem CSV

1. Visit: https://v-dem.net/data/the-v-dem-dataset/country-year-v-dem-core-v15/
2. Fill in registration form:
   - Email address (required)
   - Gender
   - Newsletter opt-in
   - Accept privacy policy
3. Select format: **CSV**
4. Download will start automatically
5. Save the CSV file to: `tmp/V-Dem-CY-Core-v15.csv`

### Step 2: Run Update Script

```bash
npm run update-vdem
```

The script will:
- Find the downloaded CSV in `tmp/`
- Parse 600+ columns for year 2024
- Extract 3 indicators for 33 countries
- Update cache files

## When to Run

**Annually**: V-Dem releases new data in **March** each year

**On-demand**: Run anytime to update to latest version

**Cache duration**: 30 days (after that, simulation will use cached data until you update)

## What Gets Updated

**Countries (33):**
USA, CHN, IND, DEU, GBR, FRA, JPN, ITA, BRA, CAN, RUS, KOR, IDN, TUR, MEX, SAU, NLD, CHE, POL, SWE, NOR, SGP, BEL, ESP, EGY, IRN, PHL, VNM, THA, BGD, PAK, NGA, BTN

**Indicators (3):**
- Electoral Democracy Index (v2x_polyarchy)
- Liberal Component Index (v2x_liberal)
- Egalitarian Component Index (v2x_egalitarian)

**Year:** 2024 (latest available)

## Output

Updates these files:
- `src/data/cache/vdem/vdem_2024_full.json` (7KB, 33 countries)
- `src/data/cache/vdem/vdem_metadata.json` (metadata, version, timestamp)

## Cached Download

The script caches the downloaded CSV in `tmp/vdem_v15.csv`:
- **First run:** Downloads ~500MB CSV (1-5 minutes depending on connection)
- **Subsequent runs:** Uses cached CSV (instant)
- **Force re-download:** Delete `tmp/vdem_v15.csv` and run again

## Troubleshooting

**Download fails:**
- Check internet connection
- V-Dem website may be down (try later)
- URL may have changed (update `VDEM_CSV_URL` in script)

**No data extracted:**
- Check year matches (default: 2024)
- Check V-Dem country IDs match (see `VDEM_TO_ISO` mapping)
- Inspect `tmp/vdem_v15.csv` manually

**CSV format changed:**
- V-Dem occasionally changes column names
- Update column name mappings in `parseVDemCSV()` function

## Manual Update

If automated download fails, you can manually:

1. Download from https://v-dem.net/data/the-v-dem-dataset/
2. Save as `tmp/vdem_v15.csv`
3. Run `npm run update-vdem`

## Version History

- **v15 (2025)**: Current version, March 2025 release
- **v14.1 (2024)**: Previous version (currently in cache)

## Research Citations

When using V-Dem data, cite:

> Coppedge, Michael, John Gerring, Carl Henrik Knutsen, Staffan I. Lindberg, Jan Teorell, David Altman, Fabio Angiolillo, Michael Bernhard, Cecilia Borella, Agnes Cornell, M. Steven Fish, Linnea Fox, Lisa Gastaldi, Haakon Gjerløw, Adam Glynn, Ana Good God, Sandra Grahn, Allen Hicken, Katrin Kinzelbach, Joshua Krusell, Kyle L. Marquardt, Kelly McMann, Valeriya Mechkova, Juraj Medzihorsky, Natalia Natsika, Anja Neundorf, Pamela Paxton, Daniel Pemstein, Josefine Pernes, Oskar Rydén, Johannes von Römer, Brigitte Seim, Rachel Sigman, Svend-Erik Skaaning, Jeffrey Staton, Aksel Sundström, Eitan Tzelgov, Yi-ting Wang, Tore Wig, Steven Wilson and Daniel Ziblatt. 2025. "V-Dem [Country–Year/Country–Date] Dataset v15" Varieties of Democracy (V-Dem) Project. https://doi.org/10.23696/VDEM2025

For methodology:

> Pemstein, Daniel, Kyle L. Marquardt, Eitan Tzelgov, Yi-ting Wang, Juraj Medzihorsky, Joshua Krusell, Farhad Miri, and Johannes von Römer. 2025. "The V-Dem Measurement Model: Latent Variable Analysis for Cross-National and Cross-Temporal Expert-Coded Data". V-Dem Working Paper No. 21. 8th edition. University of Gothenburg: Varieties of Democracy Institute.
