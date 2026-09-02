const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, '..', 'src', 'layouts');
const files = fs.readdirSync(layoutsDir);

files.forEach(file => {
  if (file.endsWith('Layout.jsx')) {
    const filePath = path.join(layoutsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Outlet import
    content = content.replace("import { Outlet } from 'react-router-dom';", "import AnimatedOutlet from '../components/motion/AnimatedOutlet';");
    
    // Replace <Outlet /> tag
    content = content.replace(/<Outlet \/>/g, '<AnimatedOutlet />');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
