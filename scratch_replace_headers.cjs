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
  // Regex to match <Header>...</Header> across multiple lines
  const headerRegex = /<Header>[\s\S]*?<\/Header>/g
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, '<Header />')
    fs.writeFileSync(file, content)
    console.log(`Updated ${file}`)
  }
}
