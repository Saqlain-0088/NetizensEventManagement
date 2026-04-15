const fs = require('fs');
let s = fs.readFileSync('src/pages/AddEnquiry.tsx','utf8');

// Add new state after selectedExtras
s = s.replace(
  'const [selectedExtras, setSelectedExtras] = useState<string[]>([]);',
  'const [selectedExtras, setSelectedExtras] = useState<string[]>([]);\n  const [selectedPkgId, setSelectedPkgId] = useState<string|null>(null);\n  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });'
);

fs.writeFileSync('src/pages/AddEnquiry.tsx', s, 'utf8');
console.log('done', s.includes('calMonth'));
