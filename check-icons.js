import * as lucide from 'lucide-react';
import { readFileSync } from 'fs';

// Leer el archivo CategoriesPage.tsx
const content = readFileSync('./pages/CategoriesPage.tsx', 'utf-8');

// Extraer todos los iconos importados
const importMatch = content.match(/from 'lucide-react';/);
if (!importMatch) {
  console.log('No se encontró la importación');
  process.exit(1);
}

const importSection = content.substring(0, content.indexOf("from 'lucide-react';"));
const lastImportStart = importSection.lastIndexOf('import {');
const importContent = content.substring(lastImportStart, content.indexOf("from 'lucide-react';"));

// Extraer nombres de iconos
const iconMatches = importContent.match(/\b[A-Z][a-zA-Z0-9]*\b/g) || [];
const uniqueIcons = [...new Set(iconMatches)].filter(icon => icon !== 'React');

console.log(`Total de iconos importados: ${uniqueIcons.length}`);
console.log('\nIconos que NO existen en lucide-react:');

const missing = [];
uniqueIcons.forEach(icon => {
  if (!(icon in lucide)) {
    console.log(`  - ${icon}`);
    missing.push(icon);
  }
});

if (missing.length === 0) {
  console.log('  (ninguno)');
} else {
  console.log(`\nTotal de iconos faltantes: ${missing.length}`);
}
