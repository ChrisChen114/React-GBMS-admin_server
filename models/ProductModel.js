/*
* 能操作products集合数据的Model
* */
// 1. 引入mongoose
const mongoose = require('mongoose')

// 2. 字节Schema（描述文档结构）
const productSchema = new mongoose.Schema({
    categoryId: {type: String, required: true}, // 所属分类的id
    pCategoryId: {type: String, required: true}, // 所属分类的父分类id
    name: {type: String,required:true}, // 名称
    price: {type:Number, required:true}, // 价格
    desc: {type: String}, // 商品描述（概要）
    status: {type: Number, default: 1}, // 商品状态： 1：在售，2：下架了
    imgs: {type:Array,default:[]}, // n个图片名的json字符串，默认是空数组 []
    detail: {type: String} //商品详情-详细描述
})


// 3. 定义Model（与集合对应，可以操作集合）
const ProductModel = mongoose.model('products',productSchema)

// 4. 向外暴露Model
module.exports = ProductModel
