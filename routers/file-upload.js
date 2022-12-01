/*
* 处理文件上传的路由
* */
const multer = require('multer') // Multer 是一个 node.js 中间件,用于处理 multipart/form-data 类型的表单数据,它主要用于上传文件。
const path = require('path')
const fs = require('fs')

const dirPath = path.join(__dirname, '..', 'public/upload')

const storage = multer.diskStorage({
    // destination: 'upload', // string时，服务启动将回自动创建文件
    destination: function (req, file, cb) { // 函数需手动创建文件夹
        // console.log('destination()',file)
        if (!fs.existsSync(dirPath)) {
            fs.mkdir(dirPath, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    cb(null, dirPath)
                }
            })
        } else {
            cb(null, dirPath)
        }
    },
    filename: function (req, file, cb) {
        // console.log('filename()',file)
        var ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + Date.now() + ext) // 不是file.filename，而是file.fieldname
    }
})
const upload = multer({storage})
const uploadSingle = upload.single('image')

module.exports = function fileUpload(router) {

    // 15. 上传图片
    router.post('/manage/img/upload', (req, res) => {
        uploadSingle(req, res, function (err) {// 错误处理
            if (err) {
                return res.send({
                    status: 1,
                    msg: '上传文件失败'
                })
            }
            var file = req.file
            res.send({
                status: 0,
                data: {
                    name: file.filename,
                    url: 'http://localhost:5000/upload/' + file.filename
                }
            })
        })
    })

    // 16. 删除图片
    router.post('/manage/img/delete', (req, res) => {
        const {name} = req.body
        fs.unlink(path.join(dirPath, name), (err) => {
            if (err) {
                console.log(err)
                res.send({
                    status: 1,
                    msg: '删除文件失败'
                })
            } else {
                res.send({
                    status: 0
                })
            }
        })
    })
}


