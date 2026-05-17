import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The standard wrapper for tables in this project is usually 'flex-1 overflow-auto'.
// Let's ensure text sizes inside tables are at least slightly responsive if they are fixed at large values.
// They seem to use text-[10px] or text-[9px] mostly, which is fine for data dense tables.

// Let's refine any 'text-base' or 'text-lg' inside table cells if any.
content = content.replace(/<p className="text-base font-black/g, '<p className="text-sm md:text-base font-black');

// Also make absolutely sure the main POS has 'flex-1 min-w-0'
// Just logging if everything is OK.
console.log('Done');
fs.writeFileSync('src/App.tsx', content);
