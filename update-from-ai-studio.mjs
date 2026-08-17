#!/usr/bin/env node
/**
 * update-from-ai-studio.mjs
 * ------------------------------------------------------------
 * Cong cu ho tro cap nhat nhanh: lay code moi export tu Google
 * AI Studio va gop vao du an nay (da chuyen doi de deploy len
 * Vercel), ma KHONG lam mat cau hinh api/index.ts, vercel.json.
 *
 * CACH DUNG:
 *   1. Tai AI Studio, bam Export/Download code, giai nen ra 1
 *      thu muc bat ky (vi du: C:\Downloads\ai-studio-moi\)
 *   2. Mo Terminal/PowerShell tai thu muc GOC cua du an nay
 *      (noi co file package.json, thu muc api/, vercel.json)
 *   3. Chay:
 *        node update-from-ai-studio.mjs "C:\Downloads\ai-studio-moi"
 *   4. Doc ky phan tom tat script in ra (dac biet la canh bao
 *      ve server.ts va package.json neu co)
 *   5. Neu on: git add . && git commit -m "cap nhat" && git push
 *      -> Vercel se tu dong deploy lai.
 * ------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.cwd();
const srcArg = process.argv[2];

function fail(msg) {
  console.error('\n[LOI] ' + msg + '\n');
  process.exit(1);
}

if (!srcArg) {
  fail('Ban chua chi duong dan thu muc code moi export tu AI Studio.\nVi du: node update-from-ai-studio.mjs "C:\\Downloads\\ai-studio-moi"');
}

const sourceDir = path.resolve(srcArg);

if (!fs.existsSync(sourceDir)) {
  fail(`Khong tim thay thu muc: ${sourceDir}`);
}
if (!fs.existsSync(path.join(sourceDir, 'package.json'))) {
  fail(`Thu muc "${sourceDir}" khong giong thu muc code export tu AI Studio (thieu package.json).`);
}
if (!fs.existsSync(path.join(projectRoot, 'api', 'index.ts'))) {
  fail('Ban dang khong dung lenh nay tai thu muc goc cua du an Vercel (thieu api/index.ts).\nHay "cd" vao dung thu muc du an roi chay lai.');
}

console.log('============================================================');
console.log(' DANG CAP NHAT CODE TU AI STUDIO');
console.log('============================================================');
console.log('Nguon (AI Studio moi) :', sourceDir);
console.log('Dich   (du an Vercel) :', projectRoot);
console.log('');

// ------------------------------------------------------------
// 1) Dong bo cac thu muc/file "an toan" - noi dung giao dien,
//    khong dung den cau hinh Vercel (api/, vercel.json...)
// ------------------------------------------------------------
const SAFE_DIRS = ['src', 'assets'];
const SAFE_FILES = ['index.html', 'metadata.json', '.env.example'];

function rimraf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

let updatedDirs = [];
for (const dir of SAFE_DIRS) {
  const s = path.join(sourceDir, dir);
  const d = path.join(projectRoot, dir);
  if (fs.existsSync(s)) {
    rimraf(d); // xoa het ban cu de bat ca truong hop AI Studio xoa file
    copyDir(s, d);
    updatedDirs.push(dir);
  }
}

let updatedFiles = [];
for (const file of SAFE_FILES) {
  const s = path.join(sourceDir, file);
  const d = path.join(projectRoot, file);
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, d);
    updatedFiles.push(file);
  }
}

console.log('[OK] Da dong bo thu muc:', updatedDirs.join(', ') || '(khong co)');
console.log('[OK] Da dong bo file  :', updatedFiles.join(', ') || '(khong co)');
console.log('');

// ------------------------------------------------------------
// 2) Gop package.json: chi cap nhat "dependencies" /
//    "devDependencies", GIU NGUYEN "scripts" cua ban (vi ban
//    da chinh scripts de hop voi Vercel, khong dung server.ts)
// ------------------------------------------------------------
const srcPkgPath = path.join(sourceDir, 'package.json');
const destPkgPath = path.join(projectRoot, 'package.json');
const srcPkg = JSON.parse(fs.readFileSync(srcPkgPath, 'utf8'));
const destPkg = JSON.parse(fs.readFileSync(destPkgPath, 'utf8'));

function diffDeps(label, srcDeps = {}, destDeps = {}) {
  const added = [];
  const changed = [];
  for (const [name, version] of Object.entries(srcDeps)) {
    if (!destDeps[name]) added.push(`${name}@${version}`);
    else if (destDeps[name] !== version) changed.push(`${name}: ${destDeps[name]} -> ${version}`);
  }
  const removed = Object.keys(destDeps).filter(
    (name) => !srcDeps[name] && !['@vercel/node'].includes(name)
  );
  if (added.length || changed.length || removed.length) {
    console.log(`[${label}] Co thay doi:`);
    added.forEach((x) => console.log('   + them moi   :', x));
    changed.forEach((x) => console.log('   ~ doi version:', x));
    removed.forEach((x) => console.log('   - AI Studio da bo:', x, '(script khong tu xoa, ban tu kiem tra neu can)'));
  } else {
    console.log(`[${label}] Khong co thay doi.`);
  }
}

diffDeps('dependencies', srcPkg.dependencies, destPkg.dependencies);
diffDeps('devDependencies', srcPkg.devDependencies, destPkg.devDependencies);

destPkg.dependencies = { ...destPkg.dependencies, ...srcPkg.dependencies };
destPkg.devDependencies = { ...destPkg.devDependencies, ...srcPkg.devDependencies };
// KHONG dong bo destPkg.scripts - giu nguyen ban Vercel (dev/build/preview)

fs.writeFileSync(destPkgPath, JSON.stringify(destPkg, null, 2) + '\n');
console.log('');
console.log('[OK] Da cap nhat dependencies vao package.json (giu nguyen "scripts").');
console.log('     -> Nho chay "npm install" lai sau khi script nay chay xong.');
console.log('');

// ------------------------------------------------------------
// 3) Kiem tra server.ts (phan API) co thay doi so voi lan
//    chuyen doi gan nhat khong. Day la phan DUY NHAT can con
//    nguoi doc va xu ly thu cong (hoac nho Claude chuyen doi
//    lai giup), vi no lien quan cau truc Serverless Function.
// ------------------------------------------------------------
const srcServerPath = path.join(sourceDir, 'server.ts');
const snapshotPath = path.join(projectRoot, 'api', '.snapshot', 'server.ts.snapshot');

console.log('------------------------------------------------------------');
if (fs.existsSync(srcServerPath)) {
  const srcServer = fs.readFileSync(srcServerPath, 'utf8');
  const snapshot = fs.existsSync(snapshotPath) ? fs.readFileSync(snapshotPath, 'utf8') : null;

  if (snapshot === null) {
    console.log('[CANH BAO] Khong tim thay ban snapshot server.ts cu de so sanh.');
    console.log('           Khong the tu dong xac nhan api/index.ts da khop code moi.');
  } else if (srcServer === snapshot) {
    console.log('[OK] server.ts (API) TU AI Studio KHONG doi so voi lan cap nhat truoc.');
    console.log('     -> api/index.ts van dung, KHONG can chinh gi them.');
  } else {
    console.log('[CANH BAO QUAN TRONG] server.ts (API) TU AI Studio DA THAY DOI!');
    console.log('     File moi da duoc luu tam tai:  api/.snapshot/server.ts.new');
    console.log('     api/index.ts (ban dang deploy) CHUA duoc cap nhat theo thay doi nay.');
    console.log('     -> Hay gui file "api/.snapshot/server.ts.new" nay cho Claude de');
    console.log('        chuyen doi lai thanh api/index.ts (giu cau truc Serverless');
    console.log('        Function), roi thay the thu cong. KHONG tu y ghi de api/index.ts.');
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    fs.copyFileSync(srcServerPath, path.join(path.dirname(snapshotPath), 'server.ts.new'));
  }
} else {
  console.log('[OK] Ban export moi tu AI Studio khong co server.ts (khong co thay doi API).');
}
console.log('------------------------------------------------------------');
console.log('');
console.log('============================================================');
console.log(' HOAN TAT. CAC BUOC TIEP THEO:');
console.log('   1) npm install');
console.log('   2) npm run build   (kiem tra build khong loi truoc khi push)');
console.log('   3) git add .');
console.log('   4) git commit -m "Cap nhat code tu AI Studio"');
console.log('   5) git push');
console.log('      -> Vercel se tu dong build & deploy lai.');
console.log('============================================================');
