import path from 'path'
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'

// 必须用 __dirname：从 monorepo 根目录执行 taro 时 process.cwd() 不是 frontend
const srcDir = path.resolve(__dirname, '..', 'src')

function applyWebpackAliases(chain: { resolve: { alias: { set: (k: string, v: string) => void } } }) {
  chain.resolve.alias.set('@', srcDir)
}

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
            applyWebpackAliases(chain)
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
            applyWebpackAliases(chain)
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
