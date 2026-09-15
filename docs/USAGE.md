# Using and citing this dataset

These examples describe the repository snapshot, not a live-results service.
The canonical human-readable source remains
[kenowinningnumbers.com/data](https://kenowinningnumbers.com/data).

The root files and SHA256SUMS are an immutable historical release. This
separate usage guide does not change that release, its version or its checksums.
A recent documentation commit is **not** a recent data verification date.

## Three useful tasks

1. **Research coverage:** count offerings by documented jurisdiction, without
   treating a multi-region offering as several games.
2. **Inspect a record's evidence:** resolve the exact source IDs on an
   assertion, including the source's access date and locator.
3. **Cite a reproducible snapshot:** include the dataset version, manifest
   source SHA, JSON checksum and your actual access date.

There are no winning-number draws, payout/EV models or predictive signals in
this catalog. Unknown values remain unknown. A listed source does not prove
every assertion about a game, and verification status is not legal advice.

## Run the read-only example

Use Python3's standard library; no packages, network access, installation or
service account are needed. Run from a checkout or extracted snapshot:

```sh
python3 examples/inspect_dataset.py --mode countries
python3 examples/inspect_dataset.py --mode offering --slug pl-multi-multi
python3 examples/inspect_dataset.py --mode citation --accessed-on YYYY-MM-DD
```

Replace YYYY-MM-DD with the date you actually accessed the snapshot. The
example checks the manifest's file hashes and byte lengths before producing
output. Missing files, changed bytes, missing relations and unknown slugs fail
rather than silently supplying fabricated values.

The offering view includes **all** recorded rule versions; it does not select
the newest array element as current. For current-state analysis, apply the
documented effective dates and review source freshness first. A null
effective date is not evidence that a rule is valid forever.

## Citation

For this historical snapshot, the generated citation output reports version
2026-08-11 and source commit
13d56868c8c738bfb05da66659d5d27164749885. These values are read from the
manifest, not inferred from the documentation's modification date.

Suggested prose:

> Keno Winning Numbers. Keno Winning Numbers Open Dataset, version2026-08-11.
> https://kenowinningnumbers.com/data. CC BY4.0. Accessed [actual access date].
> Snapshot source revision and JSON SHA-256: [values from the manifest].

Use the existing [CITATION.cff](../CITATION.cff) for citation software.
Do not invent a DOI: no Zenodo DOI is assigned by this documentation change.
If you transform the dataset, state what changed and retain attribution.
Third-party documents linked as evidence retain their own rights.

## Interpretation checklist

- Compare like-for-like dates and the same offering IDs.
- Do not treat missing countries/fields as zero availability.
- Use exact assertion source IDs rather than every historical event source.
- Distinguish source access date, rule effective date, dataset version and
  your download date.
- Keep a verified copy of the manifest with your analysis.
- Refresh stale evidence before making a present-day claim about an offering.

## Quality checks

The separate documentation workflow runs `sha256sum --check SHA256SUMS`,
then the read-only example and its standard-library tests in GitHub Actions.
It neither rebuilds data nor creates a release or publication.
