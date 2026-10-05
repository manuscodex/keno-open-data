# Sample integrity checks and queries

The examples read public catalog artifacts, not winning-number draw results.
Use one complete package with its matching manifest, schema and checksums; do
not mix a historical file with a newer live download. A review date or stored
source state is not a new verification that an operator is unchanged today.

The paths below assume an artifact directory named `keno-open-data`. This can
be a checked-out repository or an extracted, checksum-verified release package.
The download section obtains live files; for historical analysis use a
[versioned release](https://github.com/manuscodex/keno-open-data/releases) instead.
The existing `v2026-08-11` package remains historical when downloaded today.

## Download the manifest and primary files

```bash
mkdir -p keno-open-data
curl -fsS https://kenowinningnumbers.com/data/dataset-manifest.json \
  -o keno-open-data/dataset-manifest.json

jq -r '.files[].path' keno-open-data/dataset-manifest.json |
while IFS= read -r public_path; do
  filename="${public_path##*/}"
  curl -fsS "https://kenowinningnumbers.com${public_path}" \
    -o "keno-open-data/${filename}"
done
```

## Verify SHA-256 and byte size

On Linux/coreutils:

```bash
jq -r '.files[] | "\(.sha256)  \(.path | split("/")[-1])"' \
  keno-open-data/dataset-manifest.json > keno-open-data/SHA256SUMS
(cd keno-open-data && sha256sum --check SHA256SUMS)

jq -r '.files[] | [.path, .bytes] | @tsv' \
  keno-open-data/dataset-manifest.json
```

On macOS, replace the checksum line with:

```bash
(cd keno-open-data && shasum -a 256 -c SHA256SUMS)
```

## Read release identity without fixed counts

```bash
jq '{
  version,
  datasetSchemaVersion,
  gitSha,
  recordCount,
  regulatoryAuthorityCount,
  license
}' keno-open-data/dataset-manifest.json
```

## List public offering slugs and availability

```bash
jq -r '
  .catalog.offerings[] |
  [.slug, .availability_status.value, .product_id] |
  @tsv
' keno-open-data/keno-games.json
```

## Join offerings to product and operator names

```bash
jq -r '
  .catalog as $catalog |
  $catalog.offerings[] as $offering |
  ($catalog.products[] | select(.id == $offering.product_id)) as $product |
  ($catalog.operators[] |
    select(.id == ($offering.operator_ids[0] // ""))) as $operator |
  [
    $offering.slug,
    $product.name.value,
    $operator.legal_name.value,
    $operator.short_name.value
  ] |
  @tsv
' keno-open-data/keno-games.json
```

## Select offerings related to one country code

```bash
jq --arg country_code "PL" '
  .catalog as $catalog |
  $catalog.offerings[] |
  select(
    [
      .jurisdiction_ids[] as $jurisdiction_id |
      $catalog.jurisdictions[] |
      select(
        .id == $jurisdiction_id and .country_code == $country_code
      )
    ] | length > 0
  )
' keno-open-data/keno-games.json
```

## Resolve the sources used by one offering's verification history

This summarizes review-event sources, not the exact evidence for every field.
Use the next example when citing one assertion.

```bash
jq --arg slug "be-keno" '
  . as $dataset |
  ($dataset.verification[] | select(.game_slug == $slug)) as $verification |
  ($verification.events | map(.source_ids[]) | unique) as $source_ids |
  {
    offering_id: $verification.offering_id,
    status: $verification.status,
    last_reviewed_on: $verification.last_reviewed_on,
    sources: [
      $dataset.sources[] |
      select(.id as $id | $source_ids | index($id)) |
      {id, title, publisher, url, accessed_on, state}
    ]
  }
' keno-open-data/keno-games.json
```

## Trace an exact rule field to its sources

For a game slug, show every exported rule record's `number_pool` assertion and
only the sources referenced by that assertion. Preserve the full assertion,
including observation date, optional locator and typed unknowns.

```bash
jq --arg slug "de-keno" '
  . as $dataset |
  ($dataset.catalog.offerings[] | select(.slug == $slug)) as $offering |
  $dataset.catalog.rule_versions[] |
  select(.offering_id == $offering.id) |
  . as $rule |
  $rule.number_pool as $assertion |
  {
    dataset_version: $dataset.version,
    game_slug: $offering.slug,
    rule_id: $rule.id,
    version_label: $rule.version_label,
    effective_period: $rule.effective_period,
    number_pool: $assertion,
    supporting_sources: [
      $dataset.sources[] as $source |
      select(($assertion.source_ids | index($source.id)) != null) |
      $source | {id, title, publisher, url, accessed_on, state}
    ]
  }
' keno-open-data/keno-games.json
```

This does not choose the first rule in an array as current.
`effective_period.valid_from` and `valid_through` may be `null`; that does not
establish current validity. A source's stored `state` is part of the snapshot,
not a new HTTP check. Its broad support categories or an offering's entire
verification history do not replace an assertion's exact `source_ids`.

## Inspect the flattened CSV

With Miller:

```bash
mlr --csv filter '$availability_status == "active"' then \
  cut -f game_slug,game_name,country_code,operator_name,last_reviewed_on \
  keno-open-data/keno-games.csv
```

With Python's standard library, build a country directory. Change the ISO-2
argument to select another country; do not assume a fixed offering count:

```bash
python3 - DE <<'PY'
import csv
import sys

country = sys.argv[1].upper()
fields = [
    "game_slug", "game_name", "country_code", "region", "operator_name",
    "official_results_source", "last_reviewed_on", "dataset_version",
]
writer = csv.writer(sys.stdout, delimiter="\t", lineterminator="\n")
writer.writerow(fields)
with open("keno-open-data/keno-games.csv", encoding="utf-8", newline="") as source:
    for row in csv.DictReader(source):
        if row["country_code"] == country and row["availability_status"] == "active":
            writer.writerow([row[field] for field in fields])
PY
```

“Active” is the value recorded in this snapshot, not a new availability check.
An empty link is unavailable information, not proof that no official source
exists. CSV's `operator_id` represents the primary flattened relation; use JSON
`operator_ids` for all operator relationships. Use a CSV parser, not splitting
on commas: quoted names and other cells can contain commas.

## Summarize pool and draw formats

Count recorded active-offering rows by `(number_pool, numbers_drawn)`, keeping
missing mechanics visible instead of treating empty cells as zero. This is a
catalog summary, not a winning-probability or payout calculation.

```bash
python3 - <<'PY'
import csv
from collections import Counter

formats = Counter()
missing = 0
with open("keno-open-data/keno-games.csv", encoding="utf-8", newline="") as source:
    for row in csv.DictReader(source):
        if row["availability_status"] != "active":
            continue
        if not row["number_pool"] or not row["numbers_drawn"]:
            missing += 1
            continue
        formats[(int(row["number_pool"]), int(row["numbers_drawn"]))] += 1

print("number_pool\tnumbers_drawn\toffering_rows")
for (pool, drawn), count in sorted(formats.items()):
    print(pool, drawn, count, sep="\t")
print(f"Active rows with missing mechanics: {missing}")
PY
```

Equal pool/draw counts do not imply equal pick allowances, schedules or prize
rules. Read `picks_allowed` and official rules separately; the human-readable
CSV pick allowance is not a universal calculation input. These counts describe
offering rows, not players, traffic or draw results.

Do not infer live results, payout/RTP values or current legal status from fields
that the schema does not publish.
