# Sample integrity checks and queries

The examples read the canonical public artifacts. Pin a manifest/version for
reproducible work rather than assuming that the latest file will never change.

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

## Inspect the flattened CSV

With Miller:

```bash
mlr --csv filter '$availability_status == "active"' then \
  cut -f game_slug,game_name,country_code,operator_name,last_reviewed_on \
  keno-open-data/keno-games.csv
```

With Python's standard library:

```bash
python3 - <<'PY'
import csv

with open("keno-open-data/keno-games.csv", encoding="utf-8", newline="") as source:
    for row in csv.DictReader(source):
        if row["availability_status"] == "active":
            print(row["game_slug"], row["country_code"], row["last_reviewed_on"])
PY
```

Do not infer live results, payout/RTP values or current legal status from fields
that the schema does not publish.
