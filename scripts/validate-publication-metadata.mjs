import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "2026-08-11";
const RELEASE_TAG = `v${VERSION}`;
const TEAM = "Keno Winning Numbers Team";
const CANONICAL = "https://kenowinningnumbers.com/data";
const REPOSITORY = "https://github.com/manuscodex/keno-open-data";
const RELEASE_URL = `${REPOSITORY}/releases/tag/${RELEASE_TAG}`;
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
const ZENODO_LICENSE = "CC-BY-4.0";
const KAGGLE_LICENSE = "CC-BY-4.0";
const KAGGLE_ID = "kenowinningnumbers/keno-winning-numbers-open-dataset";
const MANIFEST_SHA256 =
  "3add03631c8ef9a83f4375ff51ac5cc3f511a1d21fcc68d3ba11b067e65a3895";
const SOURCE_GIT_SHA = "13d56868c8c738bfb05da66659d5d27164749885";

const ARTIFACTS = Object.freeze({
  "LICENSE.txt": {
    bytes: 683,
    mediaType: "text/plain; charset=utf-8",
    sha256:
      "80cf2bfb4c92e9dca2b681867b18230b1fa3043ca6d096799c962a1466a0dd71",
  },
  "keno-games.csv": {
    bytes: 19608,
    mediaType: "text/csv; charset=utf-8",
    sha256:
      "393525dc1ccc7df66cb1db3cc4e619b5e9138ce8c377275aedafb095c17b4c5e",
  },
  "keno-games.json": {
    bytes: 362603,
    mediaType: "application/json",
    sha256:
      "db5014dcb132fbcf6c60e0f010792ef2a647314c73bd7f76c6bf61129022ab7a",
  },
  "keno-games.schema.json": {
    bytes: 73843,
    mediaType: "application/schema+json",
    sha256:
      "e381c963f1baa1453c4d89c2842bf75fb881f8b1e72f9b0c97f998b0166f37fa",
  },
});

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(path) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(join(ROOT, path), "utf8"));
  } catch (error) {
    throw new Error(`${path}: invalid JSON (${error.message})`);
  }
  invariant(
    parsed && typeof parsed === "object" && !Array.isArray(parsed),
    `${path}: root must be an object`,
  );
  return parsed;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function exactKeys(value, expected, label) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  invariant(
    JSON.stringify(actual) === JSON.stringify(wanted),
    `${label}: keys must be exactly ${wanted.join(", ")}; got ${actual.join(", ")}`,
  );
}

function assertArtifactIntegrity(name, expected, content) {
  invariant(
    content.byteLength === expected.bytes,
    `${name}: expected ${expected.bytes} bytes, got ${content.byteLength}`,
  );
  invariant(
    sha256(content) === expected.sha256,
    `${name}: SHA-256 does not match immutable ${RELEASE_TAG}`,
  );
}

function validateManifest(manifest) {
  exactKeys(
    manifest,
    [
      "schemaVersion",
      "datasetSchemaVersion",
      "version",
      "gitSha",
      "recordCount",
      "regulatoryAuthorityCount",
      "license",
      "files",
    ],
    "dataset-manifest.json",
  );
  invariant(manifest.schemaVersion === "3.0.0", "unexpected manifest schema");
  invariant(
    manifest.datasetSchemaVersion === "3.0.0",
    "unexpected dataset schema",
  );
  invariant(manifest.version === VERSION, "unexpected dataset version");
  invariant(manifest.gitSha === SOURCE_GIT_SHA, "unexpected source Git SHA");
  invariant(manifest.recordCount === 30, "unexpected record count");
  invariant(
    manifest.regulatoryAuthorityCount === 30,
    "unexpected regulatory authority count",
  );
  invariant(manifest.license === LICENSE_URL, "unexpected manifest license");
  invariant(Array.isArray(manifest.files), "manifest files must be an array");
  invariant(
    manifest.files.length === Object.keys(ARTIFACTS).length,
    "manifest must contain exactly the immutable release artifacts",
  );

  const seen = new Set();
  for (const entry of manifest.files) {
    exactKeys(entry, ["path", "mediaType", "bytes", "sha256"], "manifest file");
    invariant(
      typeof entry.path === "string" && entry.path.startsWith("/data/"),
      "manifest artifact path must start with /data/",
    );
    const name = entry.path.slice("/data/".length);
    invariant(!name.includes("/"), `nested manifest artifact is not allowed: ${name}`);
    invariant(!seen.has(name), `duplicate manifest artifact: ${name}`);
    seen.add(name);
    const expected = ARTIFACTS[name];
    invariant(expected, `unexpected manifest artifact: ${name}`);
    invariant(entry.bytes === expected.bytes, `${name}: manifest byte mismatch`);
    invariant(
      entry.mediaType === expected.mediaType,
      `${name}: manifest media type mismatch`,
    );
    invariant(entry.sha256 === expected.sha256, `${name}: manifest hash mismatch`);
    assertArtifactIntegrity(name, expected, readFileSync(join(ROOT, name)));
  }

  invariant(
    sha256(readFileSync(join(ROOT, "dataset-manifest.json"))) ===
      MANIFEST_SHA256,
    `dataset-manifest.json must remain byte-identical to ${RELEASE_TAG}`,
  );
}

function validateZenodo(metadata) {
  exactKeys(
    metadata,
    [
      "access_right",
      "creators",
      "description",
      "keywords",
      "license",
      "publication_date",
      "related_identifiers",
      "title",
      "upload_type",
      "version",
    ],
    ".zenodo.json",
  );
  invariant(metadata.access_right === "open", "Zenodo access must be open");
  invariant(metadata.upload_type === "dataset", "Zenodo upload_type must be dataset");
  invariant(metadata.title === "Keno Winning Numbers Open Dataset", "Zenodo title mismatch");
  invariant(metadata.version === VERSION, "Zenodo version mismatch");
  invariant(metadata.publication_date === VERSION, "Zenodo publication date mismatch");
  invariant(metadata.license === ZENODO_LICENSE, "Zenodo license mismatch");
  invariant(
    Array.isArray(metadata.creators) && metadata.creators.length === 1,
    "Zenodo must have exactly one organizational creator",
  );
  exactKeys(metadata.creators[0], ["name"], "Zenodo creator");
  invariant(metadata.creators[0].name === TEAM, "Zenodo creator must be the team");
  invariant(
    metadata.description.includes(`Version ${VERSION}`) &&
      metadata.description.includes(`canonical dataset source is ${CANONICAL}`),
    "Zenodo description must identify the version and canonical source",
  );
  invariant(
    Array.isArray(metadata.keywords) && metadata.keywords.length > 0,
    "Zenodo keywords required",
  );

  const expectedRelations = [
    [CANONICAL, "isDocumentedBy"],
    [REPOSITORY, "isSupplementTo"],
    [RELEASE_URL, "isSupplementTo"],
  ];
  invariant(
    Array.isArray(metadata.related_identifiers) &&
      metadata.related_identifiers.length === expectedRelations.length,
    "Zenodo related identifiers mismatch",
  );
  metadata.related_identifiers.forEach((identifier, index) => {
    exactKeys(identifier, ["scheme", "identifier", "relation"], "Zenodo related identifier");
    invariant(identifier.scheme === "url", "Zenodo related identifier scheme must be url");
    invariant(
      identifier.identifier === expectedRelations[index][0] &&
        identifier.relation === expectedRelations[index][1],
      `Zenodo related identifier ${index + 1} mismatch`,
    );
  });
}

function validateKaggle(metadata) {
  exactKeys(
    metadata,
    [
      "title",
      "subtitle",
      "description",
      "id",
      "licenses",
      "resources",
      "keywords",
      "userSpecifiedSources",
    ],
    "dataset-metadata.json",
  );
  invariant(metadata.title === "Keno Winning Numbers Open Dataset", "Kaggle title mismatch");
  invariant(
    typeof metadata.subtitle === "string" &&
      metadata.subtitle.length >= 20 &&
      metadata.subtitle.length <= 80 &&
      metadata.subtitle.includes(VERSION),
    "Kaggle subtitle must be 20-80 characters and contain the version",
  );
  invariant(metadata.id === KAGGLE_ID, "Kaggle organizational dataset id mismatch");
  invariant(
    metadata.description.includes(TEAM) &&
      metadata.description.includes(`Version ${VERSION}`) &&
      metadata.description.includes(CANONICAL) &&
      metadata.description.includes(REPOSITORY),
    "Kaggle description must identify team, version, canonical source and repository",
  );
  invariant(
    Array.isArray(metadata.licenses) &&
      metadata.licenses.length === 1 &&
      Object.keys(metadata.licenses[0]).length === 1 &&
      metadata.licenses[0].name === KAGGLE_LICENSE,
    "Kaggle must contain exactly one CC-BY-4.0 license",
  );
  invariant(Array.isArray(metadata.resources), "Kaggle resources must be an array");
  const expectedResources = [
    "keno-games.csv",
    "keno-games.json",
    "keno-games.schema.json",
    "dataset-manifest.json",
    "LICENSE.txt",
  ];
  invariant(
    JSON.stringify(metadata.resources.map(({ path }) => path)) ===
      JSON.stringify(expectedResources),
    "Kaggle resources must list the exact release files in deterministic order",
  );
  for (const resource of metadata.resources) {
    exactKeys(resource, ["path", "description"], "Kaggle resource");
    invariant(
      typeof resource.description === "string" && resource.description.length > 0,
      `Kaggle resource description required for ${resource.path}`,
    );
  }
  invariant(
    metadata.userSpecifiedSources ===
      `Canonical source: ${CANONICAL}\nRepository: ${REPOSITORY}\nRelease: ${RELEASE_URL}`,
    "Kaggle sources must identify canonical, repository and release URLs",
  );
  invariant(
    Array.isArray(metadata.keywords) && metadata.keywords.length > 0,
    "Kaggle keywords required",
  );
}

function parseChecksums() {
  const entries = new Map();
  const lines = readFileSync(join(ROOT, "SHA256SUMS"), "utf8")
    .trimEnd()
    .split("\n");
  const paths = [];
  for (const line of lines) {
    const match = line.match(/^([0-9a-f]{64})  (.+)$/);
    invariant(match, `SHA256SUMS: malformed line: ${line}`);
    const [, checksum, path] = match;
    invariant(path !== "SHA256SUMS", "SHA256SUMS cannot hash itself");
    invariant(!path.startsWith("/") && !path.includes(".."), `unsafe checksum path: ${path}`);
    invariant(!entries.has(path), `duplicate checksum path: ${path}`);
    entries.set(path, checksum);
    paths.push(path);
  }
  const sorted = [...paths].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  invariant(
    JSON.stringify(paths) === JSON.stringify(sorted),
    "SHA256SUMS entries must be sorted by path",
  );
  return entries;
}

function listRepositoryFiles(directory = ROOT) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listRepositoryFiles(absolute));
    } else if (entry.isFile()) {
      files.push(relative(ROOT, absolute).replaceAll("\\", "/"));
    }
  }
  return files.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function assertNoCompetingHtmlCanonical(path, content) {
  invariant(
    !/\.html?$/i.test(path),
    `HTML landing page is forbidden in the dataset repository: ${path}`,
  );
  invariant(
    !/<link\b[^>]*\brel=["']canonical["'][^>]*>/i.test(content),
    `competing HTML canonical tag is forbidden: ${path}`,
  );
}

function validateRepositoryIntegrity(checksums) {
  const files = listRepositoryFiles();
  const expectedChecksumFiles = files.filter((path) => path !== "SHA256SUMS");
  invariant(
    JSON.stringify([...checksums.keys()]) === JSON.stringify(expectedChecksumFiles),
    "SHA256SUMS must cover every repository file except itself",
  );

  for (const path of expectedChecksumFiles) {
    const content = readFileSync(join(ROOT, path));
    invariant(sha256(content) === checksums.get(path), `${path}: SHA256SUMS mismatch`);
    if (/\.(?:json|md|txt|cff|mjs)$/i.test(path)) {
      assertNoCompetingHtmlCanonical(path, content.toString("utf8"));
    }
  }

  for (const [name, expected] of Object.entries(ARTIFACTS)) {
    invariant(
      checksums.get(name) === expected.sha256,
      `${name}: checksum is not bound to the manifest`,
    );
  }
  invariant(
    checksums.get("dataset-manifest.json") === MANIFEST_SHA256,
    "dataset-manifest.json checksum mismatch",
  );
  invariant(
    readFileSync(join(ROOT, "README.md"), "utf8").includes(
      `The canonical human-readable dataset page is:\n\n**${CANONICAL}**`,
    ),
    "README must preserve the sole canonical human-readable dataset page",
  );
}

function expectFailure(action, label) {
  let failed = false;
  try {
    action();
  } catch {
    failed = true;
  }
  invariant(failed, `self-test did not fail closed: ${label}`);
}

function runSelfTests(manifest, zenodo, kaggle) {
  expectFailure(
    () => validateManifest({ ...manifest, version: "2026-08-12" }),
    "changed release version",
  );
  expectFailure(
    () => validateZenodo({ ...zenodo, license: "MIT" }),
    "changed Zenodo license",
  );
  expectFailure(
    () =>
      validateKaggle({
        ...kaggle,
        userSpecifiedSources: kaggle.userSpecifiedSources.replace(CANONICAL, REPOSITORY),
      }),
    "competing Kaggle source",
  );
  expectFailure(
    () =>
      assertArtifactIntegrity(
        "keno-games.csv",
        ARTIFACTS["keno-games.csv"],
        Buffer.from("tampered"),
      ),
    "tampered artifact",
  );
  expectFailure(
    () =>
      assertNoCompetingHtmlCanonical(
        "index.html",
        `<link rel="${["canon", "ical"].join("")}" href="https://example.invalid">`,
      ),
    "competing HTML canonical",
  );
}

const manifest = readJson("dataset-manifest.json");
const zenodo = readJson(".zenodo.json");
const kaggle = readJson("dataset-metadata.json");

validateManifest(manifest);
validateZenodo(zenodo);
validateKaggle(kaggle);
const checksums = parseChecksums();
validateRepositoryIntegrity(checksums);

if (process.argv.includes("--self-test")) {
  runSelfTests(manifest, zenodo, kaggle);
}

const selfTestStatus = process.argv.includes("--self-test")
  ? ", fail-closed self-tests passed"
  : "";
console.log(
  `Publication metadata validation passed for ${RELEASE_TAG}: ` +
    `${manifest.files.length} immutable artifacts, ` +
    `${checksums.size} checksummed repository files${selfTestStatus}.`,
);
