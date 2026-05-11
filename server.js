const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = 3000

// Middleware
app.use(express.json())
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

// uploads klasörü yoksa oluştur
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}

// Multer ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

// RAM veritabanı
let users = []
let products = []

// REGISTER
app.post("/register", (req, res) => {
    const { username, password } = req.body

    const exists = users.find(u => u.username === username)

    if (exists) {
        return res.json({ success: false, message: "Kullanıcı zaten var" })
    }

    users.push({
        username,
        password,
        admin: username === "admin"
    })

    res.json({ success: true })
})

// LOGIN
app.post("/login", (req, res) => {
    const { username, password } = req.body

    const user = users.find(
        u => u.username === username && u.password === password
    )

    if (!user) {
        return res.json({ success: false })
    }

    res.json({
        success: true,
        admin: user.admin
    })
})

// UPLOAD PRODUCT
app.post("/upload", upload.single("file"), (req, res) => {

    const productName = req.body.productName

    if (!req.file) {
        return res.json({ success: false, message: "Dosya yok" })
    }

    const product = {
        name: productName,
        file: req.file.filename
    }

    products.push(product)

    res.json({
        success: true,
        product
    })
})

// PRODUCTS LIST
app.get("/products", (req, res) => {
    res.json(products)
})

// SERVER START
app.listen(PORT, () => {
    console.log(`Server çalışıyor: http://localhost:${PORT}`)
})