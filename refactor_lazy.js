const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetDir = 'C:\\Users\\user\\OneDrive\\Desktop\\Lingua\\src\\routes\\_authenticated';
walkDir(targetDir, (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const importRegex = /import\s+(?:{\s*([A-Za-z0-9_]+)\s*}|([A-Za-z0-9_]+))\s+from\s+['"](@\/features\/[^'"]+)['"]/g;
  let matches = [...content.matchAll(importRegex)];
  
  if (matches.length > 0) {
    let newContent = content;
    let hasChanges = false;
    
    matches.forEach(match => {
      const isNamed = !!match[1];
      const componentName = match[1] || match[2];
      const importPath = match[3];
      
      const componentRegex = new RegExp(`component:\\s*${componentName}([,\\s}])`);
      if (componentRegex.test(newContent)) {
        if (isNamed) {
          newContent = newContent.replace(
            new RegExp(`component:\\s*${componentName}([,\\s}])`),
            `component: lazyRouteComponent(() => import('${importPath}'), '${componentName}')$1`
          );
        } else {
          newContent = newContent.replace(
            new RegExp(`component:\\s*${componentName}([,\\s}])`),
            `component: lazyRouteComponent(() => import('${importPath}'))$1`
          );
        }
        
        newContent = newContent.replace(match[0] + '\n', '');
        if (newContent.includes(match[0])) {
           newContent = newContent.replace(match[0], '');
        }
        
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      if (!newContent.includes('lazyRouteComponent')) {
        let replaced = false;
        newContent = newContent.replace(
          /import\s+{([^}]+)}\s+from\s+['"]@tanstack\/react-router['"]/,
          (full, p1) => {
            replaced = true;
            return `import { ${p1}, lazyRouteComponent } from '@tanstack/react-router'`;
          }
        );
        if (!replaced) {
          newContent = "import { lazyRouteComponent } from '@tanstack/react-router'\n" + newContent;
        }
      }
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});
