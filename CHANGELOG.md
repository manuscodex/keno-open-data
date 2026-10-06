# Dataset release changelog

## [2026-10-05]

- Dataset schema: `3.0.0`
- Manifest schema: `3.0.0`
- Source Git SHA: `54bd6cd8b5f2620e3435b48ca9b82de861169e34`
- Exported offerings: 30
- Exported regulatory authorities: 30
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Canonical manifest: https://kenowinningnumbers.com/data/dataset-manifest.json

This package reproduces the five verified public artifacts identified by the
canonical manifest. The standalone manifest does not encode a prior-release
diff. The comparison below was performed separately against the public
`v2026-08-11` JSON at repository main
`4e61699b1c46b9a8fe6f7758f92f8847b05c5007`, using stable entity IDs. This
packages the already deployed snapshot; it does not claim a new source review
on the packaging or download date.

### Changes from 2026-08-11

- No offerings, jurisdictions, operators, products or regulatory-authority
  IDs were added or removed. Number-pool, numbers-drawn and pick-range values
  are unchanged for the existing rule IDs. Schema and license bytes are
  unchanged; JSON, CSV and the release manifest differ.
- After excluding assertion `source_ids`, `observed_on` and `locator`,
  factual content differs in 22 offering records, four operators, one product,
  one regulatory authority, seven existing rule versions and five existing
  draw schedules. Evidence metadata also changes in other records; these
  counts do not imply that all underlying game rules changed.
- Offering changes comprise seven official-results links, eight rules links,
  six game-page links and 16 top-prize values. Prize statements are narrowed
  to documented stake, add-on and aggregate-cap conditions. For Denmark,
  Finland, Greece, Italy and Latvia, the old top-prize value is now `null`
  with `unknown_reason: under_review`; their recorded verification status is
  `partly_verified`, while their offerings remain in the indexable export.
- Other concrete corrections include Super ONCE's product name, the
  Lithuanian operator's short name, AGCO's short name and official website,
  Czech published operating hours, removal of unsupported DE/FR time-zone
  wording, and effective/version identifiers for CN/CZ/FI/FR/LV/NZ/NY rules.
- Four historical rule versions and four historical schedules are added for
  CZ, FI, FR and LV, with explicit validity boundaries. None are removed.
- Sources grow from 145 to 164: 19 added, 84 existing entries modified and
  none removed. Verification history adds 47 events across the 30 exported
  offerings; no pre-existing event is removed or modified. Dates, locators,
  exact supporting references and recorded source restrictions belong to this
  snapshot, not a claim that every endpoint is accessible today.
- The five primary files were compared byte-for-byte by SHA-256 and size with
  the live canonical downloads on 2026-10-06, bracketed by the identical
  immutable release marker for source Git SHA `54bd6cd8b5f2620e3435b48ca9b82de861169e34`.
  The existing packager validated schema, normalized JSON/CSV conformity and
  all manifest hashes without rebuilding or hand-editing a primary file.

### Primary artifact integrity

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| `keno-games.csv` | 20819 | `4700140deabf399caf08dc85f527364569134cfb8a3e100f3a65df22a148b8c6` |
| `keno-games.json` | 479287 | `a7f8fbd11761bd81df004bc1b0c2e7b45fce7dc901d308614d6d9135355d7460` |
| `keno-games.schema.json` | 73843 | `e381c963f1baa1453c4d89c2842bf75fb881f8b1e72f9b0c97f998b0166f37fa` |
| `LICENSE.txt` | 683 | `80cf2bfb4c92e9dca2b681867b18230b1fa3043ca6d096799c962a1466a0dd71` |

### Compatibility

Consumers should validate normalized JSON against
`keno-games.schema.json`. The CSV remains the deterministic flattened read
view documented in `DATA_DICTIONARY.md`.

## [2026-08-11]

- Dataset schema: `3.0.0`
- Manifest schema: `3.0.0`
- Source Git SHA: `13d56868c8c738bfb05da66659d5d27164749885`
- Exported offerings: 30
- Exported regulatory authorities: 30
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Canonical manifest: https://kenowinningnumbers.com/data/dataset-manifest.json

This package reproduces the five verified public artifacts identified by the
canonical manifest. The standalone manifest does not encode a prior-release
diff, so this entry makes no unsupported record-level added, changed or
removed claims.

### Primary artifact integrity

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| `keno-games.csv` | 19608 | `393525dc1ccc7df66cb1db3cc4e619b5e9138ce8c377275aedafb095c17b4c5e` |
| `keno-games.json` | 362603 | `db5014dcb132fbcf6c60e0f010792ef2a647314c73bd7f76c6bf61129022ab7a` |
| `keno-games.schema.json` | 73843 | `e381c963f1baa1453c4d89c2842bf75fb881f8b1e72f9b0c97f998b0166f37fa` |
| `LICENSE.txt` | 683 | `80cf2bfb4c92e9dca2b681867b18230b1fa3043ca6d096799c962a1466a0dd71` |

### Compatibility

Consumers should validate normalized JSON against
`keno-games.schema.json`. The CSV remains the deterministic flattened read
view documented in `DATA_DICTIONARY.md`.
