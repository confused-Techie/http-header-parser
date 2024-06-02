const fs = require("fs");
const path = require("path");

module.exports =
function readLocalFile(filePath) {
  console.log(`Asked to read: ${filePath}`);
  const resolvedFilePath = path.join(__dirname, filePath);
  const file = fs.readFileSync(resolvedFilePath, { encoding: "utf8" });
  return file;
}
