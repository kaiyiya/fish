export default {
    logger: {
        // 关闭大部分 webpack 控制台输出（包括第三方包的 warning），保留错误日志
        quiet: true,
        stats: false,
    },
    mini: {},
    h5: {
        // 浏览器端只显示错误，不弹出 warning 遮罩
        devServer: {
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
        },
    },
}
