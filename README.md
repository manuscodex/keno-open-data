# Keno Winning Numbers Open Dataset

This is a public, versioned catalog of official draw-lottery Keno offerings
published by Keno Winning Numbers. Each package contains directory data,
assertion evidence, integrity metadata, documentation and citation metadata.

The canonical human-readable dataset page is:

**https://kenowinningnumbers.com/data**

## What you can do with the catalog

- Build a country or operator directory from the flattened CSV.
- Summarize documented number-pool and draw-size formats.
- Trace an exact JSON field assertion to its supporting sources.

See [SAMPLE_QUERIES.md](SAMPLE_QUERIES.md) for these practical examples. JSON
preserves entity relationships and assertion evidence; CSV is a convenient
flattened table. Use JSON when all related operators, jurisdictions or
authorities matter, rather than only the CSV's primary flattened relation.

This is **not winning-number draw data**, a live results API or a ticket
validator. `official_results_source` contains a link, not a draw payload.
Recorded availability and review dates describe the chosen snapshot; they do
not establish that every game or operator page is unchanged today.

## Canonical downloads

These are live links. For reproducible historical work, use the matching files
and checksums from a [versioned release](https://github.com/manuscodex/keno-open-data/releases).

| Artifact        | Stable URL                                                 | Purpose                                                                    |
| --------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| Normalized JSON | https://kenowinningnumbers.com/data/keno-games.json        | Full entity graph, assertions, sources and verification events             |
| Flattened CSV   | https://kenowinningnumbers.com/data/keno-games.csv         | One deterministic read-model row per exported offering                     |
| JSON Schema     | https://kenowinningnumbers.com/data/keno-games.schema.json | Machine-readable schema contract for the JSON file                         |
| Manifest        | https://kenowinningnumbers.com/data/dataset-manifest.json  | Dataset version, exact Git SHA, file sizes, media types and SHA-256 hashes |
| License         | https://kenowinningnumbers.com/data/LICENSE.txt            | CC BY 4.0 terms and third-party-rights notice                              |

The primary data files are generated during the production Cloudflare build
from the validated normalized catalog. They must never be hand-edited. Publish
only the complete release directory produced by the release packager after it
has verified the deployed Git SHA, manifest and artifact checksums.

## Scope

Each snapshot contains only offerings that passed the site's publication gate
when that package was generated.
It includes normalized jurisdictions, operators, regulatory authorities,
products, offerings, effective rule versions, draw schedules, source evidence
and verification history.

It excludes:

- live or archived winning-number draws;
- quarantine, archive and withheld records;
- unsupported payout, RTP, house-edge or expected-value claims;
- third-party source documents themselves.

Record counts are intentionally read from the chosen package's manifest instead of
being fixed in documentation.

## Integrity and versioning

- `version` is the latest real review date represented by the exported
  indexable records; it is not a build timestamp.
- `datasetSchemaVersion` identifies the public machine contract.
- `gitSha` binds the data to its exact source revision; it is not the public
  dataset repository's documentation commit.
- Each primary artifact has a byte count, media type and SHA-256 in
  `dataset-manifest.json`.
- Deterministic inputs at the same Git SHA produce deterministic bytes.

Always download the manifest first and verify hashes before analysis or
redistribution. The manifest covers JSON, CSV, JSON Schema and license; it does
not claim a self-hash.

The existing [v2026-08-11 release](https://github.com/manuscodex/keno-open-data/releases/tag/v2026-08-11)
is a historical snapshot. Its version is the represented review date, not its
GitHub publication date or your download date. Downloading it now, or updating
repository documentation, does not re-verify its underlying facts.

Live canonical downloads may advance independently of this repository's latest
published release. Read the version from the copy you actually use and keep
its manifest with your analysis. Do not mix a pinned release JSON/CSV with a
later live manifest or schema. If files do not match the manifest, stop rather
than analyzing a mixed or unverified package.

## Documentation

- [DATA_DICTIONARY.md](DATA_DICTIONARY.md) — non-normative field guide;
- [SAMPLE_QUERIES.md](SAMPLE_QUERIES.md) — integrity checks and practical
  `jq`/CSV examples;
- [CHANGELOG.md](CHANGELOG.md) — release identity and integrity notes;
- `CITATION.cff` — release-ready citation metadata generated from the verified manifest.

The JSON Schema from the same dataset package is normative when this prose and
the machine contract differ. The live schema URL belongs to the live downloads;
it must not silently replace the schema of a historical package.

## License and attribution

The original compilation, normalization and metadata are licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
Referenced lottery, operator, regulator and other source materials retain
their own rights and licenses.

Suggested attribution for the existing historical package:

> Keno Winning Numbers Open Dataset, version `2026-08-11`,
> https://kenowinningnumbers.com/data, CC BY 4.0.

For another downloaded copy, use its actual version instead of copying that
historical example. JSON records the dataset version as `version` and CSV as
`dataset_version`; schema identity is `schemaVersion` in JSON and
`schema_version` in CSV. The matching manifest adds `datasetSchemaVersion`,
the source `gitSha` and artifact hashes.

Include your actual access/download date and a pinned release URL or saved
manifest identity in reproducible research. Do not substitute a review,
publication or documentation-update date for your download date. `CITATION.cff`
remains the citation metadata for its stated version; it does not supply the
version of a newer live download.

The license applies to our original compilation, normalized relationships,
assertions and metadata, not the linked source documents. Cite an original
source separately when relying on its claim. Do not describe Keno Winning
Numbers as an operator, regulator or official lottery source.

## Release and update procedure

1. Build or obtain the exact deployed `dist/public/data` artifacts, then run
   `pnpm data:release:prepare -- --expect-git-sha <full-deployed-git-sha>`.
2. Verify all entries in the generated `SHA256SUMS` before publication.
3. Use the generated release directory—not the source documentation templates—
   as the content of the public repository or a versioned release attachment.
4. Prefer canonical download links or checksum-verified release attachments;
   never commit an unverified local build as authoritative data.
5. Record the manifest version, schema version, Git SHA and artifact hashes in
   the release notes.
6. Keep `https://kenowinningnumbers.com/data` as the canonical landing page;
   the repository must not become a competing HTML canonical.

The packager performs none of the GitHub, Zenodo, Kaggle or directory
publication actions by itself.

Documentation-only revisions do not create a new dataset version or refresh
source dates. Update only the changed documentation entries in the repository's
`SHA256SUMS`; leave the data, schema, manifest, license and historical release
assets unchanged. Never overwrite a historical release package or its checksums
to publish a prose correction. A new dataset release requires an actual data
change through the verified release procedure above.
