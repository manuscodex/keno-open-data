# Keno Winning Numbers Open Dataset

This README accompanies the public, versioned catalog of official draw-lottery
Keno offerings published by Keno Winning Numbers. The generated release
package is suitable for the root of a dedicated public data repository or for
a versioned dataset attachment: it contains the verified data payloads,
integrity metadata, documentation and citation metadata. Generating the
package does not itself create or publish an external repository or listing.

The canonical human-readable dataset page is:

**https://kenowinningnumbers.com/data**

## Canonical downloads

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

The export contains only offerings that pass the site's current index gate.
It includes normalized jurisdictions, operators, regulatory authorities,
products, offerings, effective rule versions, draw schedules, source evidence
and verification history.

It excludes:

- live or archived winning-number draws;
- quarantine, archive and withheld records;
- unsupported payout, RTP, house-edge or expected-value claims;
- third-party source documents themselves.

Record counts are intentionally read from the current manifest instead of
being fixed in documentation.

## Integrity and versioning

- `version` is the latest real review date represented by the exported
  indexable records; it is not a build timestamp.
- `datasetSchemaVersion` identifies the public machine contract.
- `gitSha` binds the release to the exact source revision.
- Each primary artifact has a byte count, media type and SHA-256 in
  `dataset-manifest.json`.
- Deterministic inputs at the same Git SHA produce deterministic bytes.

Always download the manifest first and verify hashes before analysis or
redistribution. The manifest covers JSON, CSV, JSON Schema and license; it does
not claim a self-hash.

## Documentation

- [DATA_DICTIONARY.md](DATA_DICTIONARY.md) — non-normative field guide;
- [SAMPLE_QUERIES.md](SAMPLE_QUERIES.md) — integrity checks and practical
  `jq`/CSV examples;
- [CHANGELOG.md](CHANGELOG.md) — release identity and integrity notes;
- `CITATION.cff` — release-ready citation metadata generated from the verified manifest.

The live JSON Schema is normative when this prose and the machine contract
differ.

## License and attribution

The original compilation, normalization and metadata are licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
Referenced lottery, operator, regulator and other source materials retain
their own rights and licenses.

Suggested attribution:

> Keno Winning Numbers Open Dataset, version `2026-08-11`,
> https://kenowinningnumbers.com/data, CC BY 4.0.

Include the dataset version and access date in reproducible research. Do not
describe Keno Winning Numbers as an operator, regulator or official lottery
source.

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
