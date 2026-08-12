# Data dictionary

This is a human-readable, non-normative guide. The current machine contract at
`https://kenowinningnumbers.com/data/keno-games.schema.json` is authoritative.
Fields may gain new schema-documented values in future versions.

## JSON top level

| Field           | Type      | Meaning                                                |
| --------------- | --------- | ------------------------------------------------------ |
| `schemaVersion` | string    | Public dataset/schema contract version                 |
| `version`       | ISO date  | Latest real review date among exported records         |
| `license`       | HTTPS URL | License for the original compilation and normalization |
| `recordCount`   | integer   | Number of indexable offerings in this export           |
| `catalog`       | object    | Normalized entity graph                                |
| `sources`       | array     | Deduplicated evidence-source registry                  |
| `verification`  | array     | Per-offering review status and event history           |

## Catalog collections

| Collection              | Stable identity     | Purpose                                                                           |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------- |
| `jurisdictions`         | `id`                | Country, subnational or documented multi-region entities                          |
| `regulatoryAuthorities` | `id`                | Named authorities, authority categories or documented government oversight        |
| `operators`             | `id`                | Legal/short operator names, official website and jurisdiction relations           |
| `products`              | `id`                | The underlying Keno product and documented game type                              |
| `offerings`             | `id`, `slug`        | Public jurisdiction-specific offering and its relations/source assertions         |
| `rule_versions`         | `id`, `offering_id` | Effective-dated pool, draw and pick mechanics                                     |
| `draw_schedules`        | `id`, `offering_id` | Effective-dated fixed, interval, daily, weekly, on-demand or descriptive schedule |

An offering references related entities by stable IDs. Resolve those IDs
inside the same `catalog` rather than inferring relationships from display
names.

## Assertions and unknown values

Documented fields use assertion objects instead of bare values:

| Field            | Meaning                                                     |
| ---------------- | ----------------------------------------------------------- |
| `value`          | Documented value, or `null` when not safely publishable     |
| `source_ids`     | Evidence IDs supporting the exact assertion                 |
| `observed_on`    | Date the asserted value was observed                        |
| `locator`        | Optional exact heading, page, table or other source locator |
| `unknown_reason` | Typed reason paired with a `null` value, when applicable    |

Typed unknown reasons are `not_published`, `not_applicable`, `not_found` and
`under_review`. Do not replace them with an invented value or the string
`"Unknown"`.

## Evidence sources

Each `sources` item contains a stable `id`, direct HTTPS `url`, publisher,
title, authority class, roles, language, access date/state, supported field
categories and an optional exact locator. A source registry entry supports
discovery and audit, but an individual fact is supported only when its
assertion explicitly references that source ID.

## Verification

Each `verification` item binds one `offering_id` to its public `game_slug`,
current verification `status`, `last_reviewed_on` and ordered review `events`.
Events contain their own source IDs and changed fields. Use these values to
assess freshness; do not substitute the file download time.

## Manifest

| Field                      | Meaning                                     |
| -------------------------- | ------------------------------------------- |
| `schemaVersion`            | Manifest contract version                   |
| `datasetSchemaVersion`     | Schema version expected by the JSON dataset |
| `version`                  | Dataset review-date version                 |
| `gitSha`                   | Exact 40-character source revision          |
| `recordCount`              | Exported offering count                     |
| `regulatoryAuthorityCount` | Exported regulatory-authority count         |
| `license`                  | CC BY 4.0 URL                               |
| `files[].path`             | Canonical `/data/...` artifact path         |
| `files[].mediaType`        | Declared artifact media type                |
| `files[].bytes`            | Exact UTF-8 byte size                       |
| `files[].sha256`           | Lowercase SHA-256 digest                    |

## CSV columns

The CSV is a flattened convenience view. Multi-value fields are pipe-delimited;
empty optional cells mean unavailable/not applicable in the read model. Use
the normalized JSON when entity relationships or assertion provenance matter.

| Column                    | Meaning                                                   |
| ------------------------- | --------------------------------------------------------- |
| `schema_version`          | Public catalog/schema contract version                    |
| `dataset_version`         | Latest real review date for the export                    |
| `offering_id`             | Stable offering entity ID                                 |
| `game_slug`               | Stable public game route slug                             |
| `product_id`              | Related product entity ID                                 |
| `game_name`               | Public game/product display name                          |
| `country_code`            | ISO-2 country code in the flattened view                  |
| `country_name`            | Public country name                                       |
| `region`                  | Subnational or market label when documented               |
| `operator_id`             | Primary related operator ID in the flattened view         |
| `operator_name`           | Documented operator legal/display name                    |
| `operator_short`          | Documented short operator name                            |
| `availability_status`     | `active`, `discontinued` or `unknown`                     |
| `game_type`               | Documented lottery Keno product type                      |
| `number_pool`             | Highest number in the documented pool                     |
| `numbers_drawn`           | Count of numbers drawn per documented draw                |
| `picks_allowed`           | Human-readable fixed/range/set pick allowance             |
| `draw_frequency`          | Human-readable documented schedule summary                |
| `official_website`        | Direct official product/operator URL when documented      |
| `official_results_source` | Direct official results-source URL when documented        |
| `official_rules_source`   | Direct official rules URL when documented                 |
| `top_prize`               | Documented public top-prize text when safely publishable  |
| `verification_status`     | Derived current review status                             |
| `last_reviewed_on`        | Latest real review date for the offering                  |
| `source_ids`              | Pipe-delimited evidence IDs relevant to the flattened row |
| `regulator_name`          | Pipe-delimited documented authority names, when present   |
