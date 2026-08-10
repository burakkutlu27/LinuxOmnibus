const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const util = fs.readFileSync(path.join(root, 'styles.utilities.css'), 'utf8');
const custom = fs.readFileSync(path.join(root, 'css', 'custom.css'), 'utf8');
fs.writeFileSync(path.join(root, 'styles.css'), util + '\n' + custom);
fs.unlinkSync(path.join(root, 'styles.utilities.css'));
console.log('styles.css written', (util.length + custom.length), 'bytes');
