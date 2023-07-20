const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();


// app.use(express.static('public'));
const cors = require('cors');

// Cấu hình biến môi trường từ tệp .env
dotenv.config();

// Kết nối đến MongoDB
let client;
// Sử dụng middleware cors để xử lý CORS
const corsOptions = {
    origin: 'http://localhost:5173', // Allow requests only from this specific origin
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
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
  
      const id = req.params.id;
      const objectId = new ObjectId(id);
  
      const result = await luckyCollection.deleteOne({ _id: objectId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi để xóa" });
      }
  
      res.json({ message: "Bản ghi đã được xóa thành công" });
    } catch (error) {
      console.error('Lỗi khi xóa bản ghi:', error);
      res.status(500).json({ error: "Có lỗi xảy ra khi xóa bản ghi." });
    }
  });
  
// Route thêm một phần quà mới vào collection "gifts"
app.post('/gifts', async (req, res) => {
    try {
      const database = client.db('mydatabase');
      const giftsCollection = database.collection('gifts');
  
      const { name, description, price } = req.body;
      const newGift = { name, description, price };
  
      const result = await giftsCollection.insertOne(newGift);
      res.json({ message: "Phần quà mới đã được thêm vào" });
    } catch (error) {
      console.error('Lỗi khi thêm phần quà mới:', error);
      res.status(500).json({ error: "Có lỗi xảy ra khi thêm phần quà mới." });
    }
  });
  
  // Route lấy danh sách các phần quà từ collection "gifts"
  app.get('/gifts', async (req, res) => {
    try {
      const database = client.db('mydatabase');
      const giftsCollection = database.collection('gifts');
  
      const gifts = await giftsCollection.find().toArray();
      res.json(gifts);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phần quà:', error);
      res.status(500).json({ error: "Có lỗi xảy ra khi lấy danh sách phần quà." });
    }
  });
  // Route thêm một thông tin quà mới vào collection "user_gifts"
app.post('/user_gifts', async (req, res) => {
    try {
      const database = client.db('mydatabase');
      const userGiftsCollection = database.collection('user_gifts');
  
      const { userId, giftId } = req.body;
      const newUserGift = { userId, giftId };
  
      const result = await userGiftsCollection.insertOne(newUserGift);
      res.json({ message: "Thông tin quà mới đã được thêm vào" });
    } catch (error) {
      console.error('Lỗi khi thêm thông tin quà mới:', error);
      res.status(500).json({ error: "Có lỗi xảy ra khi thêm thông tin quà mới." });
    }
  });
  
  // Route lấy danh sách thông tin quà từ collection "user_gifts" và kết hợp thông tin từ các collection "gifts" và "info"
  
  
  // Route lấy danh sách thông tin quà từ collection "user_gifts" và kết hợp thông tin từ các collection "gifts" và "info"
  app.get('/user_gifts', async (req, res) => {
    try {
      const database = client.db('mydatabase');
      const userGiftsCollection = database.collection('user_gifts');
      const giftsCollection = database.collection('gifts');
      const infoCollection = database.collection('info');
  
      const userGifts = await userGiftsCollection.find().toArray();
      const gifts = await giftsCollection.find().toArray();
      const info = await infoCollection.find().toArray();
  
      // Kết hợp thông tin từ bảng "user_gifts", "gifts" và "info"
      const combinedData = userGifts.map((userGift) => {
        const giftId = userGift.giftId.toString(); // Convert ObjectId to string
        const userId = userGift.userId.toString(); // Convert ObjectId to string
  
        const gift = gifts.find((g) => g._id.toString() === giftId);
        const userInfo = info.find((u) => u._id.toString() === userId);
  
        // Kiểm tra xem có thông tin người dùng và phần quà hay không
        const userName = userInfo ? userInfo.name : 'Unknown User';
        const userEmail = userInfo ? userInfo.email : 'Unknown Email';
        const giftName = gift ? gift.name : 'Unknown Gift'; // Sửa trường này thành gift.name
        const giftDescription = gift ? gift.description : 'Unknown Description';
  
        return {
          userId: userId,
          userName: userName,
          userEmail: userEmail,
          giftName: giftName,
          giftDescription: giftDescription,
        };
      });
  
      res.json(combinedData);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông tin quà:', error);
      res.status(500).json({ error: "Có lỗi xảy ra khi lấy danh sách thông tin quà." });
    }
  });
  
  
  
  
  // Route thêm thông tin mới vào collection "info"
  app.post('/info', async (req, res) => {
    try {
      const database = client.db('mydatabase');
      const infoCollection = database.collection('info');
  
      const { name, age, email } = req.body;
      const newInfo = { name, age, email };
  
      const result = await infoCollection.insertOne(newInfo);
      res.json({ message: "Thông tin mới đã được thêm vào" });
    } catch (error) {
      console.error('Lỗi khi thêm thông tin mới:', error);
      res.status(500).json({ error: "Có lỗi xảy ra khi thêm thông tin mới." });
    }
  });
  
  // Route lấy danh sách các thông tin từ collection "info"
  app.get('/info', async (req, res) => {
    try {
      const database = client.db('mydatabase');
      const infoCollection = database.collection('info');
  
      const info = await infoCollection.find().toArray();
      res.json(info);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông tin:', error);
      res.status(500).json({ error: "Có lỗi xảy ra khi lấy danh sách thông tin." });
    }
  });
  // ...

// Đối tượng lưu trữ số lượng quà còn lại
let remainingGifts = 100; // Đặt số lượng quà ban đầu là 100 (hoặc giá trị tùy chọn)

// Middleware để kiểm tra số lượng quà còn lại trước khi thêm phần quà mới
function checkRemainingGifts(req, res, next) {
  if (remainingGifts > 0) {
    next();
  } else {
    res.status(400).json({ error: "Đã phát hết số lượng quà" });
  }
}

// Route thêm một phần quà mới vào collection "gifts" và giảm số lượng quà còn lại
app.post('/gifts', checkRemainingGifts, async (req, res) => {
  try {
    const database = client.db('mydatabase');
    const giftsCollection = database.collection('gifts');

    const { name, description, price } = req.body;
    const newGift = { name, description, price };

    const result = await giftsCollection.insertOne(newGift);
    remainingGifts--; // Giảm số lượng quà còn lại sau khi thêm thành công
    res.json({ message: "Phần quà mới đã được thêm vào" });
  } catch (error) {
    console.error('Lỗi khi thêm phần quà mới:', error);
    res.status(500).json({ error: "Có lỗi xảy ra khi thêm phần quà mới." });
  }
});

// Route lấy danh sách các phần quà từ collection "gifts" và giới hạn số lượng phần quà trả về
app.get('/gifts', async (req, res) => {
  try {
    const database = client.db('mydatabase');
    const giftsCollection = database.collection('gifts');

    const limit = parseInt(req.query.limit) || 10; // Giới hạn số lượng phần quà trả về (mặc định là 10)

    const gifts = await giftsCollection.find().limit(limit).toArray();
    res.json(gifts);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phần quà:', error);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy danh sách phần quà." });
  }
});

// ...

  

// Khởi động server và lắng nghe trên cổng đã cấu hình
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Ứng dụng đang lắng nghe trên cổng ${port}`);
});
