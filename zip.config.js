const shell = require('shelljs');
const easyzip=require('easyzip');

const config = require('./src/config/index.js')
const bundle_name = config.bundle_name

// 如果不存在bundle文件， 创建
const dir = shell.find('bundle');
if (dir.code === 1) {
  shell.mkdir('bundle')
}

// dist重命名为bundle_name
shell.mv('dist', bundle_name);

easyzip.dirzip(bundle_name, `bundle/${bundle_name}.zip`, (err, res) => {
  if (err) {
    console.log('---> zip err', err);
  } else {
    // 删除原文件
    shell.rm('-rf', bundle_name);
  }
});
