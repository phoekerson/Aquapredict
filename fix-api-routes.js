const fs = require('fs');
const path = require('path');

function addDynamicExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('export const dynamic')) {
    console.log(`✓ ${filePath} déjà configuré`);
    return;
  }
  
  // Trouver la première ligne d'import
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  // Ajouter après les imports
  lines.splice(lastImportIndex + 1, 0, '', "export const dynamic = 'force-dynamic'");
  
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`✓ ${filePath} mis à jour`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file === 'route.ts' || file === 'route.tsx') {
      addDynamicExport(fullPath);
    }
  });
}

// Exécuter sur le dossier app/api
const apiDir = path.join(__dirname, 'app', 'api');
if (fs.existsSync(apiDir)) {
  processDirectory(apiDir);
  console.log('\n✅ Toutes les routes API ont été mises à jour!');
} else {
  console.log('❌ Dossier app/api introuvable');
}