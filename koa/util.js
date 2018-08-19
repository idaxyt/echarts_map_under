const path = require('path')
const fs = require('fs')

let mimes = {
    'css': 'text/css',
    'less': 'text/css',
    'gif': 'image/gif',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'swf': 'application/x-shockwave-flash',
    'tiff': 'image/tiff',
    'txt': 'text/plain',
    'wav': 'audio/x-wav',
    'wma': 'audio/x-ms-wma',
    'xml': 'text/xml'
}

/**
 * 遍历读取目录内容（子目录，文件名）
 * @param {string} reqPath 请求资源的绝对路径
 * @return {array} 目录内容列表
 */
function walk(reqPath){
    let file = fs.readdirSync(reqPath)
    let dirList = []
    let fileList = []
    for(let i = 0, len = files.length; i < len ; i++){
        let item = files[i]
        let itemArr = item.split('.')
        let itemMime = (itemArr.length > 1) ? itemArr[ itemArr.length - 1 ] : 'undefined'
        if( typeof mines[ itemMime ] === 'undefined') {
            dirList.push(files[i])
        } else {
            fileList.push(files[i])
        }
    }
    let result = dirList.concat(fileList)
    return result
}

/**
 * 封装目录内容
 * @param { string } url 当前请求的上下文中的url、即ctx.url
 * @param { string } reqPath 请求静态资源的完整本地路径
 * @return { string } 返回目录内容，封装成HTML
 */
function dir (url, reqPath) {
    //遍历读取当前目录下的文件、子目录
    let contentList = walk(reqPath)
    let html = '<ul>'
    for( let [ index, item ] of contentList.entries()) {
        html = `${html}<li data-index= "${index}"><a herf = "${url === '/' ? '' : url }/${item}">${item}</a>`
    }
    html = `${html}</ul>`
    return html
}

/**
 * 读取文件方法
 * @param {string} 文件本地的绝对路径
 * @return {string | binary}
 */
async function content (ctx, fullStaticPath) {
    //封装请求资源的绝对路径
    let reqPath = path.join(fullStaticPath, ctx.url)

    //判断请求路径是否为存在目录或者文件
    let exist = fs.existsSync(reqPath)

    //返回请求内容，默认为空
    let content = ''

    if(!exist) {
        //如果请求路径不存在，返回404
        content = '请求路径不存在！'
    } else {
        //判断访问地址是文件夹还是文件
        let stat = fs.statSync(reqPath)
        if(stat.isDirectory()) {
            //如果为目录，则渲染目录内容
            content = dir(crx.url, reqPath)
        } else {
            //如果请求为文件，则读取文件内容
            content = await file(reqPath)
        }
    }
    return content
}
//解析类型资源
function parseMime (url) {
    let extName = path.extname(url)
    extName =extName ? extName.slice(1) : 'unknown'
    return mimes[ extName ]
}

module.exports = {
    parseMime: parseMime,
    content: content
}


//静态资源服务器
router.get('/static', async (ctx) => {
    //静态资源目录在本地的绝对路径
    let fullStaticPath = path.join(__dirname, '../')
    
    //获取静态资源内容，有可能是文件内容，目录或404
    let _content = await staticUtil.content(ctx, fullStaticPath)

    //解析请求内容的类型
    let _mime = staticUtil.parseMime(ctx, url)

    //如果有对应的文件类型，就配置上下文的类型
    if(_mime) {
        ctx.type = _mime
    }

    //输出静态资源内容
    if(_mime && _mime.indexOf('image/') >= 0) {
        //如果是图片，则用node原生res，输出二进制数据
        ctx.res.writeHead(200)
        ctx.res.write(_content, 'binary')
        ctx.res.end()
    } else {
        //其他则输出文本
        ctx.body = _content
    }
})