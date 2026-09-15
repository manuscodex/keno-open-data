import copy
from pathlib import Path
import tempfile
import unittest

from inspect_dataset import (
    citation, country_counts, load_snapshot, offering_profile, PRIMARY_FILES,
)


class SnapshotExampleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[1]
        cls.manifest, cls.dataset = load_snapshot(cls.root)

    def test_real_snapshot_relations_and_exact_assertion_sources(self):
        for offering in self.dataset["catalog"]["offerings"]:
            profile = offering_profile(self.dataset, offering["slug"])
            self.assertEqual(profile["offering"]["id"], offering["id"])
            self.assertTrue(profile["recorded_rule_versions"])
            self.assertTrue(profile["assertion_sources"])

    def test_country_coverage_does_not_invent_zeroes(self):
        result = country_counts(self.dataset)
        self.assertEqual(result["offerings"], self.manifest["recordCount"])
        self.assertGreater(result["countries"]["PL"], 0)
        self.assertNotIn("ZZ", result["countries"])

    def test_unknown_slug_fails(self):
        with self.assertRaises(ValueError):
            offering_profile(self.dataset, "not-a-real-offering")

    def test_unknown_assertion_source_fails(self):
        dataset = copy.deepcopy(self.dataset)
        offering = dataset["catalog"]["offerings"][0]
        offering["official_rules_source"]["source_ids"] = ["missing-source"]
        with self.assertRaises(ValueError):
            offering_profile(dataset, offering["slug"])

    def test_null_values_remain_null(self):
        dataset = copy.deepcopy(self.dataset)
        offering = dataset["catalog"]["offerings"][0]
        offering["top_prize"] = {"value": None, "unknown_reason": "under_review", "source_ids": []}
        profile = offering_profile(dataset, offering["slug"])
        self.assertIsNone(profile["offering"]["top_prize"]["value"])

    def test_citation_uses_manifest_identity_without_invented_date_or_doi(self):
        result = citation(self.manifest)
        self.assertEqual(result["version"], self.manifest["version"])
        self.assertEqual(result["snapshot_source_git_sha"], self.manifest["gitSha"])
        self.assertIsNone(result["accessed_on"])
        self.assertIsNone(result["doi"])
        self.assertEqual(citation(self.manifest, "2026-09-16")["accessed_on"], "2026-09-16")
        with self.assertRaises(ValueError):
            citation(self.manifest, "2026-02-30")

    def test_changed_bytes_fail_before_analysis(self):
        with tempfile.TemporaryDirectory(prefix="keno-example-test-") as name:
            target = Path(name)
            for filename in ["dataset-manifest.json"] + [path.rsplit("/", 1)[1] for path in PRIMARY_FILES]:
                (target / filename).write_bytes((self.root / filename).read_bytes())
            with (target / "keno-games.json").open("ab") as altered:
                altered.write(b" ")
            with self.assertRaises(ValueError):
                load_snapshot(target)


if __name__ == "__main__":
    unittest.main()
