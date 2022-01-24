const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
import { elesInterface, IParams } from './types'

/**
 * 当前代码版本: v1.0.2
 * fix:
 * - 版本/单元分页找不到 url 问题；
 * - 性能优化；
 * - .xlsx 后缀获取 unit 问题
 * xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * 分割线以下内容可以修改
 */

/**
 * version 版本
 */
const version = '(初中)北师大版（同北京课改版）'
/**
/**
 * filePath  对应文件的路径
 */
const allFilePath =
  'C:/Users/zhourusheng/Desktop/初中默单词（8个版本）/(初中)北师大版（同北京课改版）/八年级下册'

/**
 * 设置 cookie
 * 如果页面打开之后跳转到登录页面的话，就说明cookie过期了,需要重新设置
 */
const cookies = [
  {
    name: 'admin_mfa_credentials',
    value: '7nWyjoug8bS1LgxUDju5%3A%3A94',
    domain: 'api.xbxxhz.com',
    path: '/'
  },
  {
    name: 'ahoy_visit',
    value: '125a6a95-c8cc-44e3-8aa2-ecd7fedee3e2',
    domain: 'api.xbxxhz.com',
    path: '/'
  },
  {
    name: 'remember_admin_token',
    value:
      'eyJfcmFpbHMiOnsibWVzc2FnZSI6IlcxczVORjBzSWlReVlTUXhNU1J2TUVacFpFb3hVbVpFV0ROUWFDNUZMMHRPWWxvdUlpd2lNVFkwTWpVNU56VXlOaTR3TmpBM09EVXpJbDA9IiwiZXhwIjoiMjAyMi0wMi0wMlQxMzowNToyNi4wNjBaIiwicHVyIjoiY29va2llLnJlbWVtYmVyX2FkbWluX3Rva2VuIn19--cfb5028649c540da9956c65ac4c31523367e0132',
    domain: 'api.xbxxhz.com',
    path: '/'
  },
  {
    name: '_leviathan_session',
    value:
      'bJRmJ3bljQB5MFC3v9U3nBWeREEqkZKVZo8e%2Fz6g%2FtR2Pux%2BEXs%2BvW87DlK%2B4l9uBDI%2B6AClKIBbLNrIOO0MIHraJgLAxxSCTgnegk6a5htfQwLPRPXJByKoZEUUMGueL9l9v2oXPgSHTi32JBTSmG8nUU4V8IvuFFadY2CiRnV1gKx9chJIv3U3%2F0NxeasHgsrvzMNiYO623453QakDCi3jhPvdv6wqmz%2Fou%2B2C%2Bor5Lh7JGKoDaxPF1IIU2CbPAKSQq1uNA1qTYPD%2BFla2dn6dtAuU6Y6VDgO%2FvTP0VAMMMp7B7ysA6rWWyWOL9GorFhHvDch%2FscMVCh2fZjAYp%2FiJwOc2iEAb450cfklyKcFFNq%2BLWG5KXtMD42xLsqjmPcQ6OG1kqc%2BZnRKAXeAz41F3g5vhUWT6I5nPQDkccQt4wTuSaBHVzuHF6YfagMaAjMt4HuUviqVNLudt5J52BUZphaZ8xfXdn9yl9hJ17L%2FkFic5RlUTWsXDRDmoXsdqXUWR8xPShmjiIQSwqgCuMNbL--j7eXGpopgWWHCqCj--yaq0AoE6nZF0DgYziGSRrg%3D%3D',
    domain: 'api.xbxxhz.com',
    path: '/'
  },

  {
    name: 'ahoy_visitor',
    value: '73a3e47b-a1ad-4e56-af32-927126df7efb',
    domain: 'api.xbxxhz.com',
    path: '/'
  }
]

/**
 * 默写管理 url
 */
const pageUrl = 'https://api.xbxxhz.com/dashboard/guess_write_categories'
/**
 * 分割线以上内容可以修改
 * xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */

;(async () => {
  const browser = await puppeteer
    .launch({
      // 是否运行浏览器无头模式(boolean)
      headless: false,
      args: [
        '--start-maximized',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process'
      ],
      defaultViewport: null,
      // 是否自动打开调试工具(boolean)，若此值为true，headless自动置为fasle
      devtools: false,
      // 设置超时时间(number)，若此值为0，则禁用超时
      timeout: 20000,
      exitOnPageError: false
    })
    .catch(() => browser.close)

  async function uploldFileItem(params: IParams, isFinish: boolean) {
    return new Promise<void>(async (resolve, reject) => {
      const { version, grade, unit, filePath } = params
      const page = await browser.newPage()

      await page.setCookie(...cookies)

      await page.goto(pageUrl, { waitUntil: 'load' })

      async function checkIsFinish() {
        if (isFinish) {
          console.log(
            '\x1B[36m%s\x1B[0m',
            `${allFilePath} 文件已全部上传，请检查！`
          )
          await page.waitFor(1000)
          await browser.close()
          resolve()
          process.exit()
        } else {
          resolve()
        }
      }

      await page.waitFor(1000)

      let gradeUrl: string = ''

      /**
       * 获取对应版本和 url
       */
      const versionEles = await page.$$eval(
        '.dashboard-datatable tbody tr',
        (elements: any) => {
          return elements.map((item: any) => {
            return {
              version: item.children[0].innerText,
              url: item.children[3].children[0].href
            }
          })
        }
      )
      // console.log('对应的版本和页面url:', versionEles)

      gradeUrl =
        versionEles.find((item: elesInterface) => item.version === version)
          ?.url ?? ''

      // 判断是否存在分页
      const hasPagination = await page.$$(
        '.dataTables_wrapper .pagination_wrap .pagination'
      )

      // 第一页没找到 fileUrl, 并且存在分页时, 则遍历 pagination 继续查找
      if (!gradeUrl && hasPagination) {
        const paginationEles = await page.$$eval(
          '.dataTables_wrapper .pagination_wrap .pagination .page-item',
          (elements: any) => {
            return elements.map((item: any) => {
              return item.children[0]?.href
            })
          }
        )
        const _paginationEles = [
          ...new Set(paginationEles.filter((item: any) => !!item))
        ]

        for (let index = 0; index < _paginationEles.length; index++) {
          const url = _paginationEles[index]
          await page.goto(url, { waitUntil: 'load' })
          await page.waitFor(1000)

          const _versionEles = await page.$$eval(
            '.dashboard-datatable tbody tr',
            (elements: any) => {
              return elements.map((item: any) => {
                return {
                  version: item.children[0].innerText,
                  url: item.children[3].children[0].href
                }
              })
            }
          )

          const _url =
            _versionEles.find((item: elesInterface) => item.version === version)
              ?.url ?? ''

          if (_url) {
            gradeUrl = _url
            break
          }
        }
      }

      if (gradeUrl) {
        // 进入年级页面
        await page.goto(gradeUrl, { waitUntil: 'load' })

        await page.waitFor(1000)

        const gradeEles = await page.$$eval(
          '.dashboard-datatable tbody tr',
          (elements: any) => {
            return elements.map((item: any) => {
              return {
                version: item.children[0].innerText
                  .replace('(', '')
                  .replace(')', '')
                  .replace('（', '')
                  .replace('）', ''),
                url: item.children[2].children[0].href
              }
            })
          }
        )
        // console.log(`${version} 对应的年级和页面url`, gradeEles)

        const unitUrl =
          gradeEles.find((item: elesInterface) => item.version.includes(grade))
            ?.url ?? ''

        if (unitUrl) {
          // 进入单元页面
          await page.goto(unitUrl, { waitUntil: 'load' })

          await page.waitFor(1000)

          let fileUrl: string = ''

          const unitEles = await page.$$eval(
            '.dashboard-datatable tbody tr',
            (elements: any) => {
              return elements.map((item: any) => {
                return {
                  version: item.children[0].innerText
                    .toLowerCase()
                    .replace(/\s*/g, ''),
                  url: item.children[1].children[0].href
                }
              })
            }
          )

          fileUrl =
            unitEles.find(
              (item: elesInterface) =>
                item.version === unit.toLowerCase().replace(/\s*/g, '')
            )?.url ?? ''

          // 判断是否存在分页
          const hasPagination = await page.$$(
            '.dataTables_wrapper .pagination_wrap .pagination'
          )
          // 第一页没找到 fileUrl, 并且存在分页时, 则遍历 pagination 继续查找
          if (!fileUrl && hasPagination) {
            const paginationEles = await page.$$eval(
              '.dataTables_wrapper .pagination_wrap .pagination .page-item',
              (elements: any) => {
                return elements.map((item: any) => {
                  return item.children[0]?.href
                })
              }
            )
            const _paginationEles = [
              ...new Set(paginationEles.filter((item: any) => !!item))
            ]

            for (let index = 0; index < _paginationEles.length; index++) {
              const url = _paginationEles[index]
              await page.goto(url, { waitUntil: 'load' })
              await page.waitFor(1000)

              const _unitEles = await page.$$eval(
                '.dashboard-datatable tbody tr',
                (elements: any) => {
                  return elements.map((item: any) => {
                    return {
                      version: item.children[0].innerText
                        .toLowerCase()
                        .replace(/\s*/g, ''),
                      url: item.children[1].children[0].href
                    }
                  })
                }
              )

              const _url =
                _unitEles.find(
                  (item: elesInterface) =>
                    item.version === unit.toLowerCase().replace(/\s*/g, '')
                )?.url ?? ''

              if (_url) {
                fileUrl = _url
                break
              }
            }
          }
          // console.log(`${unit} 对应的url`, unitEles)

          if (fileUrl) {
            // 进入文件页面
            await page.goto(fileUrl, { waitUntil: 'load' })

            await page.waitFor(1000)

            const fileLists = await page.$$('.dashboard-datatable tbody tr')
            /**
             * 判断当前页面是否已经存在解析数据
             * 存在数据则不上传，防止数据重复
             */
            if (fileLists && fileLists.length) {
              console.error(
                '\x1B[31m%s\x1B[0m',
                `${filePath} - ${version}-${grade}-${unit} 已存在解析数据，防止数据重复故跳过`
              )
              await page.close()
              await checkIsFinish()
            } else {
              const btnEles = await page.$$eval(
                '.m-portlet__body .btn-primary',
                (elements: any) => {
                  return elements.map((item: any) => {
                    return item.href
                  })
                }
              )
              const uploadUrl = btnEles[1]
              if (uploadUrl) {
                // 进入上传页面
                await page.goto(uploadUrl, { waitUntil: 'load' })

                await page.waitFor(1000)

                // 点击上传文件
                const uploadInput = await page.waitForSelector(
                  '.uploader .uploader__input'
                )
                await uploadInput.uploadFile(filePath)

                // 监听上传请求成功
                await page.waitForSelector('.uploader img[src^="blob"]')

                await page.waitFor(1000)
                // 点击确定
                await page.click('.m-form__actions .btn-primary')

                await page.waitFor(1000)

                await page.close()
                console.log(
                  '\x1B[36m%s\x1B[0m',
                  `${filePath} -${version}-${grade}-${unit} 单元上传成功！！！！`
                )
                await checkIsFinish()
              } else {
                console.error(
                  '\x1B[31m%s\x1B[0m',
                  `${filePath} -未找到对应 ${version} 版本 ${grade} 年级 ${unit} 单元上传 url, 请检查`
                )
                await page.close()
                await checkIsFinish()
              }
            }
          } else {
            console.error(
              '\x1B[31m%s\x1B[0m',
              `${filePath} -未找到对应 ${version} 版本 ${grade} 年级 ${unit} 单元的url，请检查代码中 unit = ${unit} 的值是否正确`
            )
            await page.close()
            await checkIsFinish()
          }
        } else {
          console.error(
            '\x1B[31m%s\x1B[0m',
            `${filePath} -未找到对应 ${version} 版本 ${grade} 年级的url，请检查代码中 grade = ${grade} 的值是否正确`
          )
          await page.close()
          await checkIsFinish()
        }
      } else {
        console.error(
          '\x1B[31m%s\x1B[0m',
          `${filePath} -未找到对应 ${version} 版本的url，请检查代码中 version = ${version} 的值是否正确`
        )
        await page.close()
        await checkIsFinish()
      }
    })
  }

  async function readFileDir(filePath: string) {
    fs.readdir(filePath, async function (err: any, files: any) {
      if (err) throw err

      for (const [index, file] of files.entries()) {
        //拼接获取绝对路径，fs.stat(绝对路径,回调函数)
        let _path = path.join(filePath, file)
        await fs.stat(_path, async (err: any, stat: { isFile: () => any }) => {
          if (await stat.isFile()) {
            // stat 状态中有两个函数一个是stat中有isFile, isisDirectory等函数进行判断是文件还是文件夹
            const arr = _path.split(version)[1]
            const grade = arr.split('\\')[1].replace('册', '')
            const unit = arr
              .split('\\')[2]
              .replace('.xlsx', '')
              .replace('.xls', '')
            const params = {
              version,
              grade,
              unit,
              filePath: _path
            }
            const isFinish = index === files.length - 1
            setTimeout(async () => {
              await uploldFileItem(params, isFinish)
            }, index * 15000)
          } else {
            readFileDir(_path)
          }
        })
      }
    })
  }

  readFileDir(allFilePath)
})()
