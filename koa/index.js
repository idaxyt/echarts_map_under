const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const koa = new Koa()
const mimes = {
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
koa.use((ctx,next)=>{
    // ctx.body=1
    if(fs.existsSync(path.join('static',ctx.path))){
        ctx.set('Content-Type',mimes[path.extname(ctx.path).substr(1)])
        ctx.body=fs.createReadStream(path.join('static',ctx.path))
    }else{
        ctx.body='NotFound'
    }
})
koa.listen(3000,'0.0.0.0')