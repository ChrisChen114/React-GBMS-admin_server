/*
用来定义路由的路由器模块
 */
const express = require('express')
const md5 = require('blueimp-md5')

const UserModel = require('../models/UserModel')
const CategoryModel = require('../models/CategoryModel')
const ProductModel = require('../models/ProductModel')
const RoleModel = require('../models/RoleModel')


// 得到路由器对象
const router = express.Router()
// console.log('router',router)

// 指定需要过滤的属性
const filter = {password: 0, __v: 0}


// 1. 登陆
router.post('/login', (req, res) => {
    const {username, password} = req.body   // 前端传过来是对象 {username，password}
    // 根据username和password查询数据库users，如果没有，返回提示错误的信息，如果有，返回登陆成功信息(包含user)
    UserModel.findOne({username, password: md5(password)})
        .then(user => {
            if (user) { // 登录成功
                // 生成一个cookie(userid: user._id),并交给浏览器保存
                res.cookie('userid', user._id, {maxAge: 1000 * 60 * 60 * 24})
                if (user.role_id) {
                    RoleModel.findOne({_id: user.role_id})
                        .then(role => {
                            user._doc.role = role
                            console.log('role user', user)
                            res.send({status: 0, data: user})
                        })
                } else {
                    user._doc.role = {menus: []}
                    // 返回登陆成功信息（包含user）
                    res.send({status: 0, data: user})
                }

            } else { // 登陆失败
                res.send({status: 1, msg: '用户名或密码不正确!'})
            }
        })
        .catch(error => {
            console.log('登陆异常', error)
            res.send({status: 1, msg: '登陆异常，请重新尝试!'})
        })
})

// 2. 添加用户
router.post('/manage/user/add', (req, res) => {
    // 读取请求参数数据
    const {username, password} = req.body  // 必选-username,password,可选-phone，email，role_id
    // 处理：判断用户是否已经存在，如果存在，返回提示错误的信息，如果不存在，保存
    // 查询（根据username）
    UserModel.findOne({username})
        .then(user => {
            // 如果user有值（已存在）
            if (user) {
                //    返回提示错误的信息
                res.send({status: 1, msg: '此用户已存在'})
                return new Promise(() => {
                })
            } else { // 没值（不存在）
                // 保存
                return UserModel.create({...req.body, password: md5(password || 'atguigu')})
            }
        })
        .then(user => {
            // 返回包含user的json数据
            res.send({status: 0, data: user})
        })
        .catch(error => {
            console.error('注册异常', error)
            res.send({status: 1, msg: '添加用户异常，请重新尝试'})
        })
})


// 3. 更新用户
router.post('/manage/user/update', (req, res) => {
    const user = req.body // 必传-_id，可选-username, phone, email, role_id
    UserModel.findByIdAndUpdate({_id: user._id}, user)// 此处已更新。 findByIdAndUpdate()函数用于查找匹配的文档，根据更新arg对其进行更新，传递任何选项，然后将找到的文档(如果有)返回给回调。
        .then(oldUser => {
            const data = Object.assign(oldUser, user) // 此处的合并更新，将返回给前端，不用从数据库查询了。 Object.assign(target,source)=>主要用于对象合并，将源对象中的属性复制到目标对象中，他将返回目标对象; 如果有同名属性的话，后面的属性值会覆盖前面的属性值
            // 返回
            res.send({status: 0, data})
        })
        .catch(error => {
            console.error('更新用户异常', error)
            res.send({status: 1, mesg: '更新用户异常，请重新尝试'})
        })
})

// 5. 删除用户
router.post('/manage/user/delete', (req, res) => {
    const {userId} = req.body // 传入userId,就是_id值
    UserModel.deleteOne({_id: userId})
        .then((doc) => {
            res.send({status: 0})
        })
})

// 4. 获取用户信息的路由
router.get('/user', (req, res) => {
    // 从请求的cookie得到userId
    const userid = req.cookies.userid
    // 如果不存在，直接返回一个提示信息
    if (!userid) {
        return res.send({status: 1, meg: '请先登陆'})
    }
    // 根据userid查询对应的user
    UserModel.findOne({_id: userid}, filter)  // 指定需要过滤的属性,filter = {password: 0, __v: 0}
        .then(user => {
            if (user) {
                res.send({status: 0, data: user})
            } else {
                // 通知浏览器删除userid cookie
                res.clearCookie('userid')
                res.send({status: 1, msg: '请先登陆'})
            }
        })
        .catch(error => {
            console.error('获取用户异常', error)
            res.send({status: 1, msg: '获取用户异常，请重新尝试'})
        })
})

// 4. 获取所有用户列表
router.get('/manage/user/list', (req, res) => {
    UserModel.find({username: {'$ne': 'admin'}}) // 过滤掉admin用户
        .then(users => {
            RoleModel.find().then(roles => {
                res.send({status: 0, data: {users, roles}})
            })
        })
        .catch(error => {
            console.error('获取用户列表异常', error)
            res.send({status: 1, msg: '获取用户列表异常，请重新尝试'})
        })
})


// 7. 添加分类

// 6. 获取分类列表 (获取一级或某个二级分类列表)

module.exports = router


