import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Additional Responsive Tweaks
// Lower 'text-[11px]' to 'text-[10px]' on mobile? No, 11px is already small.

// Let's adjust main grid cols for products if it isn't adaptive:
content = content.replace(/\bgrid-cols-2\b/g, 'grid-cols-1 sm:grid-cols-2');

// Revert it where it breaks things (if any)
content = content.replace(/grid-cols-1 sm:grid-cols-2 gap-2/g, 'grid-cols-2 gap-2'); // fast access
content = content.replace(/grid-cols-1 sm:grid-cols-2 gap-3/g, 'grid-cols-2 gap-3'); // forms typically
content = content.replace(/grid-cols-1 sm:grid-cols-2 gap-4 text-left/g, 'grid-cols-2 gap-4 text-left');

// Find any remaining py-4, py-5, py-6 that were missed or add sm:
content = content.replace(/\bp-8\b/g, 'p-4 md:p-8');
content = content.replace(/\bp-6\b/g, 'p-4 md:p-6');
content = content.replace(/\bp-10\b/g, 'p-6 md:p-10');
content = content.replace(/\bp-5\b/g, 'p-3 md:p-5');

// text sizes
content = content.replace(/\btext-4xl md:text-5xl\b/g, 'text-3xl md:text-5xl');
content = content.replace(/\btext-2xl md:text-4xl\b/g, 'text-2xl md:text-4xl'); // 2xl is 24px, 4xl is 36px.
content = content.replace(/\btext-xl md:text-3xl\b/g, 'text-xl md:text-3xl');

// Check large rounded corners that look weird on mobile
content = content.replace(/\brounded-\[32px\]\b/g, 'rounded-2xl md:rounded-[32px]');
content = content.replace(/\brounded-\[35px\]\b/g, 'rounded-2xl md:rounded-[35px]');
content = content.replace(/\brounded-\[40px\]\b/g, 'rounded-3xl md:rounded-[40px]');
content = content.replace(/\brounded-3xl\b/g, 'rounded-2xl md:rounded-3xl');

fs.writeFileSync('src/App.tsx', content);
console.log('Update completed');
