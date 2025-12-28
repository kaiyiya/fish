import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import tsconfigPaths from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config
const config: UserConfigExport = {
    projectName: 'fish-app',
    date: '2024-1-1',
    designWidth: 750,
    deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        375: 2,
        828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-framework-react'],
    defineConstants: {
    },
    copy: {
        patterns: [
        ],
        options: {
        }
    },
    framework: 'react',
    compiler: {
        type: 'webpack5',
        prebundle: { enable: false }
    },
    cache: {
        enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
        postcss: {
            pxtransform: {
                enable: true,
                config: {
                    selectorBlackList: ['.nut-']
                }
            },
            url: {
                enable: true,
                config: {
                    limit: 1024 // 设定转换尺寸上限
                }
            },
            cssModules: {
                enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                config: {
                    namingPattern: 'module', // 转换模式，取值为 global/module
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        },
        webpackChain(chain) {
            chain.plugin('tsconfigPaths').use(tsconfigPaths)
        }
    },
    h5: {
        publicPath: '/',
        staticDirectory: 'static',
        postcss: {
            autoprefixer: {
                enable: true,
                config: {
                }
            },
            cssModules: {
                enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                config: {
                    namingPattern: 'module', // 转换模式，取值为 global/module
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        },
        webpackChain(chain) {
            chain.plugin('tsconfigPaths').use(tsconfigPaths)
        }
    },
    rn: {
        appName: 'fishApp',
        postcss: {
            cssModules: {
                enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
            }
        }
    }
}

export default defineConfig(async (merge, { command, mode }) => {
    const baseConfig = config
    const modeConfig = merge({}, baseConfig, mode === 'development' ? devConfig : prodConfig)
    return modeConfig
})
