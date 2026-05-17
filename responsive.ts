import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Typography adjustments
content = content.replace(/\btext-5xl\b/g, 'text-4xl md:text-5xl');
content = content.replace(/\btext-4xl\b/g, 'text-2xl md:text-4xl');
content = content.replace(/\btext-3xl\b/g, 'text-xl md:text-3xl');
content = content.replace(/\btext-2xl\b/g, 'text-lg md:text-2xl');

// Button & Input Paddings
content = content.replace(/\bpy-6\b/g, 'py-4 md:py-6');
content = content.replace(/\bpy-5\b/g, 'py-3 md:py-5');
content = content.replace(/\bpy-4\b/g, 'py-3 md:py-4');
content = content.replace(/\bpx-8\b/g, 'px-4 md:px-8');
content = content.replace(/\bpx-6\b/g, 'px-4 md:px-6');

fs.writeFileSync('src/App.tsx', content);
console.log('Update completed');
