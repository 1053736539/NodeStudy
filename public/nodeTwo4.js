var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')

// 配置静态资源服务器
var serve = serveStatic('public/ftp', {'index': ['index.html', 'index.htm']})

// Create server
var server = http.createServer(function onRequest (req, res) {
    serve(req, res, finalhandler(req, res))
})

// Listen
server.listen(3000);
