let gulp = require('gulp');
let path = require('path');
let browserSync = require('browser-sync');
let url = require('url');

let proxyMiddleware = require('http-proxy-middleware');

var allowedExtensions = ['html', 'js', 'map', 'css', 'png', 'svg', 'jpg', 'jpeg', 'gif', 'webp', 'woff', 'ttf', 'svg', 'otf', 'ico', 'eot', 'swf', 'mp3'];

var extensionsPattern = allowedExtensions.map(function (extension) {
    return '\\.' + extension;
}).join('|');

let proxyUrl = url.parse("http://trondev.mywish.io");

var devServerApi = {
    path: [
        "/api", '/accounts', '/logout', '/endpoint', '/fonts'
    ],
    url: proxyUrl
};
var getBrowserSyncConfig = function () {

    var modRewrite = require('connect-modrewrite');
    var proxy = proxyMiddleware(devServerApi.path, {
        target: devServerApi.url,
        changeOrigin: true,
        cookieDomainRewrite: '*',
        ws: false,
        // auth: devServerApi.auth
    });

    return {
        development: {
            server: {
                //baseDir: [paths.build.root]
            },
            port: 9990,
            https: false,
            files: [
                //path.join(paths.build.root, "**/*")
            ],
            middleware: [
                proxy,
                modRewrite([
                    '^.*/(auth)($|\/)[a-z\-\/0-9A-Z]*$ /auth.html',
                    '^.*/(global-error)($|\/)[a-z\-\/0-9A-Z]*$ /global-error.html',
                    '^.*/(dashboard)($|\/).*$ /dashboard.html',
                    '!' + extensionsPattern + ' /index.html [L]'
                ])
            ],
            ghostMode: false,
            injectChanges: false,
            open: false
        }
    }
};

gulp.task('serve', function () {
    var bsConfig = getBrowserSyncConfig();
    var c = bsConfig.development;
    c.server.baseDir = 'dist';
    c.files = [path.join('dist', "index.html")];
    browserSync(c);
});

