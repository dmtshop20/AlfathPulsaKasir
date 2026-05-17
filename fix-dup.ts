import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/md:py-4 md:py-6/g, 'md:py-6');
content = content.replace(/md:rounded-3xl md:rounded-\[40px\]/g, 'md:rounded-[40px]');
// Find other duplicates
content = content.replace(/md:py-3 md:py-4/g, 'md:py-4');
content = content.replace(/md:p-4 md:p-8/g, 'md:p-8');
content = content.replace(/rounded-2xl md:rounded-3xl md:rounded-\[40px\]/g, 'rounded-2xl md:rounded-[40px]');
fs.writeFileSync('src/App.tsx', content);
