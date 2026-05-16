const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname);
const srcDir = path.join(projectRoot, 'src');

const ensureDir = (targetPath) => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Map of moves
const moves = [
  // 1. Constants
  { from: 'src/constants/apiEndPoints.ts', to: 'src/constants/apiEndpoints.ts' },
  { from: 'src/constants/assignmentEndPoints.ts', to: null, action: 'delete' },

  // 2. Services -> src/api/services/
  { from: 'src/api/client.ts', to: 'src/api/services/client.ts' },
  { from: 'src/api/messages.api.ts', to: 'src/api/services/messages.service.ts' },
  { from: 'src/api/student-messages.api.ts', to: 'src/api/services/student/messages.service.ts' },
  { from: 'src/api/students.ts', to: 'src/api/services/teacher/students.service.ts' },
  { from: 'src/services/assignment.service.ts', to: 'src/api/services/assignment.service.ts' },
  { from: 'src/services/homework.service.ts', to: 'src/api/services/student/homework.service.ts' },
  { from: 'src/services/file.service.ts', to: 'src/api/services/file.service.ts' },

  // 3. Types -> src/api/types/
  { from: 'src/types/assignment.types.ts', to: 'src/api/types/assignment.types.ts' },
  { from: 'src/types/messages.ts', to: 'src/api/types/messages.types.ts' },
  { from: 'src/types/student.ts', to: 'src/api/types/teacher/students.types.ts' },

  // 4. Hooks -> Role based
  { from: 'src/hooks/useAssignments.ts', to: 'src/hooks/student/useAssignments.ts' },
  // useMessages is shared, keep at src/hooks/useMessages.ts

  // 5. Components -> src/components/common/ or src/components/admin/
  { from: 'src/components/Modal.tsx', to: 'src/components/common/Modal.tsx' },
  { from: 'src/components/Toast.tsx', to: 'src/components/common/Toast.tsx' },
  { from: 'src/components/coming-soon.tsx', to: 'src/components/common/coming-soon.tsx' },
  { from: 'src/components/command-menu.tsx', to: 'src/components/common/command-menu.tsx' },
  { from: 'src/components/config-drawer.tsx', to: 'src/components/common/config-drawer.tsx' },
  { from: 'src/components/config-drawer.test.tsx', to: 'src/components/common/config-drawer.test.tsx' },
  { from: 'src/components/confirm-dialog.tsx', to: 'src/components/common/confirm-dialog.tsx' },
  { from: 'src/components/confirm-dialog.test.tsx', to: 'src/components/common/confirm-dialog.test.tsx' },
  { from: 'src/components/dashboard-card.tsx', to: 'src/components/common/dashboard-card.tsx' },
  { from: 'src/components/date-picker.tsx', to: 'src/components/common/date-picker.tsx' },
  { from: 'src/components/delete-confirm-dialog.tsx', to: 'src/components/common/delete-confirm-dialog.tsx' },
  { from: 'src/components/learn-more.tsx', to: 'src/components/common/learn-more.tsx' },
  { from: 'src/components/long-text.tsx', to: 'src/components/common/long-text.tsx' },
  { from: 'src/components/notification-bell.tsx', to: 'src/components/common/notification-bell.tsx' },
  { from: 'src/components/password-input.tsx', to: 'src/components/common/password-input.tsx' },
  { from: 'src/components/password-input.test.tsx', to: 'src/components/common/password-input.test.tsx' },
  { from: 'src/components/profile-dropdown.tsx', to: 'src/components/common/profile-dropdown.tsx' },
  { from: 'src/components/search.tsx', to: 'src/components/common/search.tsx' },
  { from: 'src/components/select-dropdown.tsx', to: 'src/components/common/select-dropdown.tsx' },
  { from: 'src/components/sign-out-dialog.tsx', to: 'src/components/common/sign-out-dialog.tsx' },
  { from: 'src/components/sign-out-dialog.test.tsx', to: 'src/components/common/sign-out-dialog.test.tsx' },
  { from: 'src/components/skip-to-main.tsx', to: 'src/components/common/skip-to-main.tsx' },
  { from: 'src/components/theme-switch.tsx', to: 'src/components/common/theme-switch.tsx' },
  { from: 'src/components/CourseModal.tsx', to: 'src/components/common/CourseModal.tsx' },
  { from: 'src/components/GroupModal.tsx', to: 'src/components/common/GroupModal.tsx' },
  { from: 'src/components/admin-button.tsx', to: 'src/components/admin/admin-button.tsx' },
];

const importReplacements = {
  '@/constants/apiEndPoints': '@/constants/apiEndpoints',
  '../constants/apiEndPoints': '@/constants/apiEndpoints',
  '@/constants/assignmentEndPoints': '@/constants/apiEndpoints',
  '../constants/assignmentEndPoints': '@/constants/apiEndpoints',

  '@/api/client': '@/api/services/client',
  '../api/client': '@/api/services/client',
  './client': './client', // relative imports handled carefully

  '@/api/messages.api': '@/api/services/messages.service',
  '@/api/student-messages.api': '@/api/services/student/messages.service',
  '@/api/students': '@/api/services/teacher/students.service',

  '@/services/assignment.service': '@/api/services/assignment.service',
  '@/services/homework.service': '@/api/services/student/homework.service',
  '@/services/file.service': '@/api/services/file.service',

  '@/types/assignment.types': '@/api/types/assignment.types',
  '@/types/messages': '@/api/types/messages.types',
  '@/types/student': '@/api/types/teacher/students.types',

  '@/hooks/useAssignments': '@/hooks/student/useAssignments',

  '@/components/Modal': '@/components/common/Modal',
  '@/components/Toast': '@/components/common/Toast',
  '@/components/coming-soon': '@/components/common/coming-soon',
  '@/components/command-menu': '@/components/common/command-menu',
  '@/components/config-drawer': '@/components/common/config-drawer',
  '@/components/confirm-dialog': '@/components/common/confirm-dialog',
  '@/components/dashboard-card': '@/components/common/dashboard-card',
  '@/components/date-picker': '@/components/common/date-picker',
  '@/components/delete-confirm-dialog': '@/components/common/delete-confirm-dialog',
  '@/components/learn-more': '@/components/common/learn-more',
  '@/components/long-text': '@/components/common/long-text',
  '@/components/notification-bell': '@/components/common/notification-bell',
  '@/components/password-input': '@/components/common/password-input',
  '@/components/profile-dropdown': '@/components/common/profile-dropdown',
  '@/components/search': '@/components/common/search',
  '@/components/select-dropdown': '@/components/common/select-dropdown',
  '@/components/sign-out-dialog': '@/components/common/sign-out-dialog',
  '@/components/skip-to-main': '@/components/common/skip-to-main',
  '@/components/theme-switch': '@/components/common/theme-switch',
  '@/components/CourseModal': '@/components/common/CourseModal',
  '@/components/GroupModal': '@/components/common/GroupModal',
  '@/components/admin-button': '@/components/admin/admin-button',
};

// 1. Move files
console.log('--- MOVING FILES ---');
for (const move of moves) {
  const fromPath = path.join(projectRoot, move.from);
  if (fs.existsSync(fromPath)) {
    if (move.action === 'delete') {
      fs.unlinkSync(fromPath);
      console.log(`Deleted: ${move.from}`);
    } else {
      const toPath = path.join(projectRoot, move.to);
      ensureDir(toPath);
      fs.renameSync(fromPath, toPath);
      console.log(`Moved: ${move.from} -> ${move.to}`);
    }
  } else {
    console.log(`Skipped (not found): ${move.from}`);
  }
}

// Additional fix: Cleanup old empty directories (optional but good)
const cleanDirs = ['src/api', 'src/services', 'src/types'];
for (const dir of cleanDirs) {
  const fullPath = path.join(projectRoot, dir);
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    if (files.length === 0) {
      fs.rmdirSync(fullPath);
    }
  }
}

// 2. Rewrite imports
console.log('\n--- REWRITING IMPORTS ---');
const walkDir = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (f !== 'node_modules' && f !== 'dist' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
};

const regexes = Object.keys(importReplacements).map(oldPath => ({
  pattern: new RegExp(`from\\s+['"]${oldPath.replace(/\./g, '\\.')}['"]`, 'g'),
  dynamicPattern: new RegExp(`import\\(['"]${oldPath.replace(/\./g, '\\.')}['"]\\)`, 'g'),
  replacement: `from '${importReplacements[oldPath]}'`,
  dynamicReplacement: `import('${importReplacements[oldPath]}')`,
  oldPath
}));

// Also handle named import merging for ASSIGNMENT_ENDPOINTS -> ASSIGNMENTS
const assignmentEndpointsPattern = /import\s+\{([^}]+)\}\s+from\s+['"]@\/constants\/assignmentEndPoints['"]/g;

walkDir(srcDir, (filePath) => {
  if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Handle special case for assignment endpoints which we merged
  if (content.includes('assignmentEndPoints')) {
     content = content.replace(assignmentEndpointsPattern, (match, imports) => {
       const newImports = imports.split(',').map(s => s.trim()).filter(Boolean);
       // Instead of renaming individual keys, we just use API_ENDPOINTS.ASSIGNMENTS
       // But to keep it simple and not break logic, we replace ASSIGNMENTS_SUBMIT with ASSIGNMENTS.SUBMIT etc.
       // Actually, we mapped them to ASSIGNMENTS in apiEndpoints.ts
       return `import { ASSIGNMENTS } from '@/constants/apiEndpoints'`;
     });

     // Replace usages in file: ASSIGNMENTS_SUBMIT -> ASSIGNMENTS.SUBMIT
     content = content.replace(/ASSIGNMENT_BY_ID/g, 'ASSIGNMENTS.BY_ID');
     content = content.replace(/ASSIGNMENT_SUBMIT/g, 'ASSIGNMENTS.SUBMIT');
     content = content.replace(/ASSIGNMENT_GRADE/g, 'ASSIGNMENTS.GRADE');
  }

  for (const { pattern, dynamicPattern, replacement, dynamicReplacement } of regexes) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
    }
    if (dynamicPattern.test(content)) {
      content = content.replace(dynamicPattern, dynamicReplacement);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated imports in: ${path.relative(projectRoot, filePath)}`);
  }
});

console.log('\n--- REFACTOR COMPLETE ---');
