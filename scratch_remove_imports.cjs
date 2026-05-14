const fs = require('fs')
const path = require('path')

function findFiles(dir, files = []) {
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      findFiles(filePath, files)
    } else if (filePath.endsWith('.tsx')) {
      files.push(filePath)
    }
  }
  return files
}

const allTsxFiles = findFiles(path.join('C:\\Users\\Maxsadbek\\Desktop\\Lingua\\src\\features'))

for (const file of allTsxFiles) {
  let content = fs.readFileSync(file, 'utf-8')
  
  // Remove full import lines for these specific components
  content = content.replace(/import\s*{\s*ConfigDrawer\s*}\s*from\s*['"]@\/components\/config-drawer['"];?\r?\n/g, '')
  content = content.replace(/import\s*{\s*Search\s*}\s*from\s*['"]@\/components\/search['"];?\r?\n/g, '')
  content = content.replace(/import\s*{\s*ThemeSwitch\s*}\s*from\s*['"]@\/components\/theme-switch['"];?\r?\n/g, '')
  
  // Also remove Search from lucide-react if it's there? The user's earlier error was because Search wasn't in lucide-react, but maybe some files try to import it from there. Let's just remove the exact ones from @/components first.

  fs.writeFileSync(file, content)
}
console.log('Done removing unused imports')
