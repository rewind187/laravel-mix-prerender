let mix = require('laravel-mix');
let path = require('path');
let fs = require('fs')

class Prerender {
    dependencies() {
        this.requiresReload = true;
        return [
            'html-webpack-plugin',
            'prerender-spa-plugin',
        ]
    }

    register({routes, template, transform}) {
        if(!routes) routes = ['/']
        if(!template) template = 'resources/views/welcome.blade.php'
        if(!transform) transform = () => {}
        this.routes = routes
        this.template = template
        this.transform = transform
    }

    webpackConfig(webpackConfig) {
        console.log(path.dirname(this.template),
        'rendered')
        let HtmlWebpackPlugin = require('html-webpack-plugin');
        let PrerenderSpaPlugin = require('prerender-spa-plugin');
        webpackConfig.plugins.push(
            new HtmlWebpackPlugin({
                template: this.template,
                inject: false,
            }),

            new PrerenderSpaPlugin({
                staticDir: webpackConfig.output.path,
                routes: this.routes,
                postProcess: (renderedRoute) => {
                    renderedRoute.route = renderedRoute.originalRoute
                    // Basic whitespace removal. (Don't use this in production.)
                    renderedRoute.html = renderedRoute.html.split(/>[\s]+</gmi).join('><')
                    // Remove /index.html from the output path if the dir name ends with a .html file extension.
                    // For example: /dist/dir/special.html/index.html -> /dist/dir/special.html
                    if (renderedRoute.route.endsWith('.html')) {
                        renderedRoute.outputPath = path.join(__dirname, 'dist', renderedRoute.route)
                    }

                    return renderedRoute
                }
            }),
        )

    }
}

mix.extend('prerender', new Prerender());