# Dataset release changelog

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
