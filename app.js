const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

// Cấu hình biến môi trường từ tệp .env
dotenv.config();

// Kết nối đến MongoDB
let client;

async function connectToMongo() {
  try {
    const uri = process.env.DB_CONNECTION_STRING;
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Đã kết nối thành công đến MongoDB');
  } catch (error) {
    console.error('Không thể kết nối đến MongoDB:', error);
    throw error;
  }
}

// Middleware để chờ kết nối đến MongoDB trước khi thực hiện các API
app.use(async (req, res, next) => {
    const isConnected = client && client.topology.isConnected();
    if (!isConnected) {
      await connectToMongo();
    }
    next();
  });
  

// Route chào mừng
app.get('/', (req, res) => {
  res.send('Chào mừng đến với ứng dụng Node.js và MongoDB!');
});

// Middleware để xử lý dữ liệu JSON
app.use(express.json());

// Middleware để chờ kết nối đến MongoDB trước khi thực hiện các API
app.use(async (req, res, next) => {
  const isConnected = client && client.topology.isConnected();
  if (!isConnected) {
    await connectToMongo();
  }
  next();
});

// Route thêm nhiều bản ghi vào collection "lucky"
app.post('/lucky/batch', async (req, res) => {
  try {
    const database = client.db('mydatabase');
    const luckyCollection = database.collection('lucky');

    const records = req.body;

    // Thêm nhiều bản ghi vào collection "lucky"
    const result = await luckyCollection.insertMany(records);

    res.json({ message: `${result.insertedCount} bản ghi đã được thêm vào` });
  } catch (error) {
    console.error('Lỗi khi thêm nhiều bản ghi:', error);
    res.status(500).json({ error: "Có lỗi xảy ra khi thêm nhiều bản ghi." });
  }
});

// Route lấy danh sách các bản ghi trong collection "lucky"
app.get('/lucky', async (req, res) => {
  try {
    const database = client.db('mydatabase');
    const luckyCollection = database.collection('lucky');

    const records = await luckyCollection.find().toArray();
    res.json(records);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bản ghi:', error);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy danh sách bản ghi." });
  }
});

// Route lấy thông tin một bản ghi trong collection "lucky" dựa vào id
app.get('/lucky/:id', async (req, res) => {
  try {
    const database = client.db('mydatabase');
    const luckyCollection = database.collection('lucky');

    const record = await luckyCollection.findOne({ _id: ObjectId(req.params.id) });
    if (!record) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi" });
    }

    res.json(record);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin bản ghi:', error);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy thông tin bản ghi." });
  }
});

// Route xóa một bản ghi trong collection "lucky" dựa vào id
app.delete('/lucky/:id', async (req, res) => {
  try {
    const database = client.db('mydatabase');
    const luckyCollection = database.collection('lucky');

    const result = await luckyCollection.deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi để xóa" });
    }

    res.json({ message: "Bản ghi đã được xóa thành công" });
  } catch (error) {
    console.error('Lỗi khi xóa bản ghi:', error);
    res.status(500).json({ error: "Có lỗi xảy ra khi xóa bản ghi." });
  }
});

// Khởi động server và lắng nghe trên cổng đã cấu hình
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Ứng dụng đang lắng nghe trên cổng ${port}`);
});
