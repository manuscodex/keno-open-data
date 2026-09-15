"""Read-only, standard-library examples for a checksum-verified snapshot."""
import argparse
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path

PRIMARY_FILES = {
    "/data/keno-games.json",
    "/data/keno-games.csv",
    "/data/keno-games.schema.json",
    "/data/LICENSE.txt",
}


def load_snapshot(directory):
    root = Path(directory).resolve()
    manifest = json.loads((root / "dataset-manifest.json").read_text(encoding="utf-8"))
    entries = manifest["files"]
    if len(entries) != len(PRIMARY_FILES) or {item["path"] for item in entries} != PRIMARY_FILES:
        raise ValueError("Unexpected or duplicate manifest paths")
    for item in entries:
        filename = root / item["path"].rsplit("/", 1)[1]
        if filename.resolve().parent != root:
            raise ValueError("Primary file resolves outside snapshot directory")
        payload = filename.read_bytes()
        if len(payload) != item["bytes"] or hashlib.sha256(payload).hexdigest() != item["sha256"]:
            raise ValueError("Integrity mismatch: " + item["path"])
    dataset = json.loads((root / "keno-games.json").read_text(encoding="utf-8"))
    if dataset["version"] != manifest["version"]:
        raise ValueError("Dataset version differs from manifest")
    if dataset["schemaVersion"] != manifest["datasetSchemaVersion"]:
        raise ValueError("Dataset schema version differs from manifest")
    if len(dataset["catalog"]["offerings"]) != manifest["recordCount"]:
        raise ValueError("Offering count differs from manifest")
    return manifest, dataset


def by_id(items):
    result = {}
    for item in items:
        if item["id"] in result:
            raise ValueError("Duplicate entity ID: " + item["id"])
        result[item["id"]] = item
    return result


def country_counts(dataset):
    catalog = dataset["catalog"]
    jurisdictions = by_id(catalog["jurisdictions"])
    counts = Counter()
    missing = []
    for offering in catalog["offerings"]:
        codes = {
            jurisdictions[identifier]["country_code"]
            for identifier in offering["jurisdiction_ids"]
            if jurisdictions[identifier].get("country_code")
        }
        if not codes:
            missing.append(offering["slug"])
        for code in codes:
            counts[code] += 1
    return {
        "offerings": len(catalog["offerings"]),
        "countries": dict(sorted(counts.items())),
        "offerings_without_country_code": sorted(missing),
        "note": "Each offering counts once per country; country totals can overlap.",
    }


def assertion_source_ids(value):
    found = set()
    if isinstance(value, dict):
        for key, item in value.items():
            if key == "source_ids":
                found.update(item)
            else:
                found.update(assertion_source_ids(item))
    elif isinstance(value, list):
        for item in value:
            found.update(assertion_source_ids(item))
    return found


def offering_profile(dataset, slug):
    catalog = dataset["catalog"]
    matches = [item for item in catalog["offerings"] if item["slug"] == slug]
    if len(matches) != 1:
        raise ValueError("Expected exactly one offering for slug: " + slug)
    offering = matches[0]
    products = by_id(catalog["products"])
    operators = by_id(catalog["operators"])
    jurisdictions = by_id(catalog["jurisdictions"])
    authorities = by_id(catalog["regulatoryAuthorities"])
    profile = {
        "offering": offering,
        "product": products[offering["product_id"]],
        "operators": [operators[key] for key in offering["operator_ids"]],
        "jurisdictions": [jurisdictions[key] for key in offering["jurisdiction_ids"]],
        "regulatory_authorities": [
            authorities[key] for key in offering["regulatoryAuthorityIds"]
        ],
        "recorded_rule_versions": [
            rule for rule in catalog["rule_versions"]
            if rule["offering_id"] == offering["id"]
        ],
        "recorded_schedules": [
            schedule for schedule in catalog["draw_schedules"]
            if schedule["offering_id"] == offering["id"]
        ],
    }
    referenced_ids = assertion_source_ids(profile)
    sources = by_id(dataset["sources"])
    missing = referenced_ids - sources.keys()
    if missing:
        raise ValueError("Unknown assertion source IDs: " + ", ".join(sorted(missing)))
    profile["assertion_sources"] = [sources[key] for key in sorted(referenced_ids)]
    profile["note"] = (
        "All recorded versions are shown, not selected as current. "
        "Check effective dates, source access dates and exact locators."
    )
    return profile


def citation(manifest, accessed_on=None):
    if accessed_on is not None:
        if date.fromisoformat(accessed_on).isoformat() != accessed_on:
            raise ValueError("Access date must be an actual YYYY-MM-DD date")
    json_file = next(item for item in manifest["files"] if item["path"] == "/data/keno-games.json")
    return {
        "author": "Keno Winning Numbers",
        "title": "Keno Winning Numbers Open Dataset",
        "version": manifest["version"],
        "canonical_url": "https://kenowinningnumbers.com/data",
        "license": manifest["license"],
        "snapshot_source_git_sha": manifest["gitSha"],
        "json_sha256": json_file["sha256"],
        "accessed_on": accessed_on,
        "doi": None,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--mode", choices=["countries", "offering", "citation"], required=True)
    parser.add_argument("--slug")
    parser.add_argument("--accessed-on")
    args = parser.parse_args()
    if args.mode == "offering" and not args.slug:
        parser.error("--mode offering requires --slug")
    try:
        manifest, dataset = load_snapshot(args.directory)
        if args.mode == "countries":
            result = country_counts(dataset)
        elif args.mode == "offering":
            result = offering_profile(dataset, args.slug)
        else:
            result = citation(manifest, args.accessed_on)
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, "Snapshot inspection failed: " + str(error) + "\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
