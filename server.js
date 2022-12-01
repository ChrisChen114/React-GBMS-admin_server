/*
* 应用的启动模块
*   1. 通过express启动服务器
*   2. 通过mongoose连接服务器
*       说明：只有当连接上数据库后才去启动服务器
*   3. 使用中间件
* */
const mongoose = require('mongoose')
const express = require('express')
const app = express() // 产生应用对象

// 声明使用静态中间件
app.use(express.static('public'))
// 声明使用解析post请求的中间件
app.use(express.urlencoded({extended: true})) //请求体参数是name=tom&pwd=123
app.use(express.json()) // 请求体参数是json结构：{name: tom,pwd:123}
// 声明使用解析cookie数据的中间件
const cookieParser = require('cookie-parser')
app.use(cookieParser())
// 声明使用路由器中间件
const indexRouter = require('./routers')
app.use('/api', indexRouter) //此处是加了前缀api，也可以不加

const fs = require('fs')

// 必须在路由器中间之后声明使用
// 问题：使用BrowserRouter，刷新某个路由路径时，会出现 404 的错误
// 原因: 项目根路径（后台里放了前台打包生成的文件）后的path 路径会被当作后台路由路径, 去请求对应的后台路由，但没有相应的路由
// 解决: 使用自定义中间件去读取返回index 页面展现
app.use((req, res) => {
    fs.readFile(__dirname + '/public/index.html', (err, data) => {
        if (err) {
            console.log(err)
            res.send('后台错误')
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
            });
            res.end(data)
        }
    })
})

// 通过mongoose连接数据库
mongoose.connect('mongodb://localhost/server_db2', {useNewUrlParser: true})
    .then(() => {
        console.log('连接数据库成功!!!')
        // 只有当连接上数据库后才去启动服务器
        app.listen('5000', () => {
            console.log('服务器启动成功，请访问：http://localhost:5000')
        })
    })
    .catch(error => {
        console.error('连接数据库失败', error)
    })

