import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const list=execFileSync('git',['ls-files','-z']).toString().split('\0').filter(Boolean);
const blockedNames=/(^|\/)(\.env(?:\..*)?|credentials\.json|service-account\.json|id_rsa|\.npmrc)$/i;
const blockedExtensions=/\.(pem|p12|pfx|key)$/i;
const secretPatterns=[
 {name:'Google API key',re:/AIza[0-9A-Za-z_-]{30,}/g},
 {name:'GitHub token',re:/(?:ghp_|github_pat_)[0-9A-Za-z_]{20,}/g},
 {name:'OpenAI key',re:/\bsk-[A-Za-z0-9_-]{30,}/g},
 {name:'Google OAuth token',re:/\bya29\.[A-Za-z0-9_-]{25,}/g},
 {name:'Indonesian customer-like phone',re:/\b(?:\+?62|0)8\d{8,11}\b/g}
];
for(const path of list){
 assert.ok(!blockedNames.test(path)&&!blockedExtensions.test(path),'Disallowed sensitive file path: '+path);
 if(/\.(png|jpe?g|webp|ico|zip|woff2?|ttf|pdf|xlsx?)$/i.test(path))continue;
 const content=readFileSync(path,'utf8');
 for(const pattern of secretPatterns){
  const matches=[...content.matchAll(pattern.re)];
  assert.equal(matches.length,0,pattern.name+' appears in public file '+path+' — inspect before publishing');
 }
}
console.log('PUBLIC_REPO_SCAN_PASS:',list.length,'tracked files, no matching common secrets/phone patterns');
