import { readFileSync } from 'fs';

// Leer el archivo
const content = readFileSync('./pages/CategoriesPage.tsx', 'utf-8');

// Extraer todos los iconos del import
const importSection = content.substring(
  content.indexOf('import {') + 8,
  content.indexOf("} from 'lucide-react'")
);
const imported = importSection
  .split(',')
  .map(s => s.trim())
  .filter(s => s && !s.includes('React') && !s.includes('useState') && !s.includes('useMemo'));

const importedSet = new Set(imported);

// Extraer todos los iconos usados en AVAILABLE_ICONS
const availableIconsStart = content.indexOf('const AVAILABLE_ICONS = [');
const availableIconsEnd = content.indexOf('];', availableIconsStart);
const availableIconsSection = content.substring(availableIconsStart, availableIconsEnd);

const componentMatches = availableIconsSection.matchAll(/component:\s*(\w+)/g);
const usedIcons = [...componentMatches].map(m => m[1]);

console.log(`Iconos importados: ${importedSet.size}`);
console.log(`Iconos usados en AVAILABLE_ICONS: ${usedIcons.length}`);

const notImported = usedIcons.filter(icon => !importedSet.has(icon));
const notUsed = imported.filter(icon => !usedIcons.includes(icon));

console.log('\nIconos usados pero NO importados:');
if (notImported.length === 0) {
  console.log('  (ninguno)');
} else {
  notImported.forEach(icon => console.log(`  - ${icon}`));
}

console.log('\nIconos importados pero NO usados:');
if (notUsed.length === 0) {
  console.log('  (ninguno)');
} else {
  notUsed.forEach(icon => console.log(`  - ${icon}`));
}
