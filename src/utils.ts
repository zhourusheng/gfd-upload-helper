const fs = require('fs')
const path = require('path')

async function readFileDir(filePath: string) {
  const fileArr: string[] = []
  fs.readdir(filePath, function (err: any, files: any) {
    if (err) throw err
    files.forEach(async (file: any) => {
      //拼接获取绝对路径，fs.stat(绝对路径,回调函数)
      let _path = path.join(filePath, file)
      await fs.stat(_path, async (err: any, stat: { isFile: () => any }) => {
        if (await stat.isFile()) {
          // stat 状态中有两个函数一个是stat中有isFile, isisDirectory等函数进行判断是文件还是文件夹
          fileArr.push(file)
        } else {
          readFileDir(_path)
        }
      })
    })
  })
  return fileArr
}

async function asyncForEach(
  array: string | any[],
  callback: (arg0: any, arg1: number, arg2: any) => any
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export default {
  asyncForEach,
  readFileDir
}
