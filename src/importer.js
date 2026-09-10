import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Racine du repository
const rootDir = path.resolve(__dirname, "..");

// Charger sources.json
const sourcesPath = path.join(rootDir, "sources.json");

const config = JSON.parse(
  await fs.readFile(sourcesPath, "utf8")
);

// Dossier de destination
const outputDir = path.join(
  rootDir,
  "data",
  "wh40k",
  "11e"
);

// Créer le dossier s'il n'existe pas
await fs.mkdir(outputDir, {
  recursive: true
});

console.log("🚀 Début de l'import Wahapedia...\n");

const sources = config.sources;

for (const [name, source] of Object.entries(sources)) {

  console.log(`📥 Téléchargement : ${name}`);

  try {

    const response = await fetch(source.url);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} - ${response.statusText}`
      );
    }

    const csvText = await response.text();

    const csvPath = path.join(
      outputDir,
      `${name}.csv`
    );

    await fs.writeFile(
      csvPath,
      csvText,
      "utf8"
    );

    console.log(`   ✅ Sauvegardé : ${csvPath}`);

    // Vérification du CSV
    const records = parse(csvText, {
  columns: true,
  delimiter: source.delimiter,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true
});

    console.log(`   📊 ${records.length} lignes importées`);

  } catch (error) {

    console.error(
      `   ❌ Erreur avec ${name}:`,
      error.message
    );

    process.exitCode = 1;
  }

  console.log("");
}

console.log("🎉 Import terminé !");
