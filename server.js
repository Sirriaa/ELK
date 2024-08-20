const express = require('express');
const path = require('path'); // 이 줄을 추가하세요
const { Pool } = require('pg');
const Web3 = require('web3');
const app = express();
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const cron = require('node-cron');


// PostgreSQL 연결 설정
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'member',
  password: 'pass',
  port: 5432,
});

// 데이터베이스 연결 풀을 전역으로 사용할 수 있도록 설정
global.pool = pool;

/*pool.query('SELECT NOW()', (err, res) => {
	if (err) {
	  console.error('연결에 실패하였습니다.', err.stack);
	} else {
	  console.log('연결 확인:', res.rows[0]);
	  pool.end(); // 풀 연결 종료
	}
  });
*/

app.use(cors());
//--------------------------------------------------------
app.use(express.json()); // JSON 파싱을 위한 미들웨어
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 요청 본문 파싱


// 정적 파일 제공
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));



app.use(session({
  secret: 'b0a9769bd8462e47a5d6f906a2f2daa8162be0240db2da1258efb5e8d2657f302ef95778c37d0e5efaaf93bc174917baaa5a605f7e86da0df213587fcad36094',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTP에서 사용할 경우 secure를 false로 설정
}));



// 게시글 수정 API
app.put('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { title, content, price } = req.body;
  const userWalletAddress = req.session.walletAddress;

  try {
      const { rows } = await pool.query('SELECT wallet_address FROM products WHERE id = $1', [productId]);
      if (rows.length === 0) {
          return res.status(404).send('Product not found');
      }

      if (rows[0].wallet_address !== userWalletAddress) {
          return res.status(403).send('Not authorized to modify this product');
      }

      await pool.query('UPDATE products SET title = $1, content = $2, price = $3 WHERE id = $4', [title, content, price, productId]);
      res.send('Product updated successfully');
  } catch (error) {
      console.error('Database Error:', error);
      res.status(500).send('Internal Server Error');
  }
});

// 게시글 삭제 API
app.delete('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const userWalletAddress = req.session.walletAddress;

  try {
      const { rows } = await pool.query('SELECT wallet_address FROM products WHERE id = $1', [productId]);
      if (rows.length === 0) {
          return res.status(404).send('Product not found');
      }

      if (rows[0].wallet_address !== userWalletAddress) {
          return res.status(403).send('Not authorized to delete this product');
      }

      await pool.query('DELETE FROM products WHERE id = $1', [productId]);
      res.send('Product deleted successfully');
  } catch (error) {
      console.error('Database Error:', error);
      res.status(500).send('Internal Server Error');
  }
});





// 업로드 디렉토리 생성 코드
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir);
    console.log(`Directory ${uploadsDir} created successfully.`);
  } catch (error) {
    console.error(`Error creating directory ${uploadsDir}:`, error);
  }
}



// 저장소 엔진 설정
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')  // 'uploads/' 폴더에 파일 저장
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // 파일명 설정
  }
});

// Multer 미들웨어 설정
const upload = multer({ storage: storage }).single('image');

// 제품 추가 및 이미지 업로드 처리를 위한 POST 엔드포인트
app.post('/products', function(req, res) {
  upload(req, res, function(err) {
      if (err instanceof multer.MulterError) {
          console.error('Multer Error:', err);
          return res.status(500).json({ error: err.message });
      } else if (err) {
          console.error('Unknown Error:', err);
          return res.status(500).json({ error: 'Unknown error occurred' });
      }

      // 업로드된 파일 정보 로깅
      console.log('Uploaded File:', req.file);
      console.log('Form Data:', req.body);

      const { title, content, price, nickname } = req.body;
      // 파일 경로를 클라이언트에서 접근 가능한 URL로 변환
      const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename.replace(/\\/g, '/')}` : '';

      // 데이터베이스에 제품 데이터 포함 이미지 URL을 삽입
      pool.query(
          'INSERT INTO products (title, content, price, nickname, image_url, wallet_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [title, content, price, nickname, imageUrl, req.session.walletAddress || 'Unknown'],
          (dbError, result) => {
              if (dbError) {
                  console.error('Database Error:', dbError);
                  return res.status(500).json({ error: dbError.message });
              }
              res.status(201).json(result.rows[0]);
          }
      );
  });
});


app.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id DESC');
    const products = rows.map(product => {
      return {
        ...product,
        imageUrl: product.imageUrl ? `http://localhost:3000/${product.imageUrl.replace(/\\/g, '/')}` : null
      };
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/products/search', async (req, res) => {
  const searchQuery = req.query.title ? `%${req.query.title.toLowerCase()}%` : '%';

  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE LOWER(title) LIKE $1 ORDER BY id DESC', [searchQuery]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/products/:id', async (req, res) => {
  const productId = req.params.id;
  if (!productId || productId === 'null') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



//-------------------------------------------------------------------------------
// 지갑 주소를 세션에서 가져오는 엔드포인트 추가
app.get('/get-wallet-address', (req, res) => {
  if (req.session.walletAddress) {
      res.json({ walletAddress: req.session.walletAddress });
  } else {
      res.status(401).json({ walletAddress: null });
  }
});

app.post('/api/request-transaction', async (req, res) => {
  const { productId, buyerWalletAddress } = req.body;
  if (!buyerWalletAddress || !productId) {
      return res.status(400).json({ error: 'Product ID and Buyer wallet address are required' });
  }

  try {
      const result = await pool.query(
          'INSERT INTO transactions (product_id, buyer_address, status) VALUES ($1, $2, $3) RETURNING *',
          [productId, buyerWalletAddress, 'pending']
      );
      res.status(201).json({ message: 'Transaction request submitted successfully', transaction: result.rows[0] });
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to submit transaction request', details: error.message });
  }
});

app.post('/api/accept-transaction/:id', async (req, res) => {
  const transactionId = req.params.id;
  try {
      await pool.query('UPDATE transactions SET status = $1 WHERE id = $2', ['accepted', transactionId]);
      res.send('Transaction accepted successfully');
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Failed to accept transaction');
  }
});

app.post('/api/reject-transaction/:id', async (req, res) => {
  const transactionId = req.params.id;
  try {
      const result = await pool.query('UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *', ['rejected', transactionId]);
      if (result.rows.length > 0) {
          res.json({ message: 'Transaction successfully rejected', transaction: result.rows[0] });
      } else {
          res.status(404).send('Transaction not found');
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Failed to reject transaction');
  }
});

app.post('/api/delete-transaction/:id', async (req, res) => {
  const transactionId = req.params.id;
  try {
      // 데이터베이스에서 해당 거래 요청 삭제
      const result = await pool.query('DELETE FROM transactions WHERE id = $1', [transactionId]);
      if (result.rowCount > 0) {
          res.send('Transaction successfully deleted');
      } else {
          res.status(404).send('Transaction not found');
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Failed to delete transaction');
  }
});



app.get('/api/get-transaction-requests', async (req, res) => {
  try {
      const userWalletAddress = req.session.walletAddress;
      const result = await pool.query(
          'SELECT t.*, p.wallet_address as seller_address FROM transactions t JOIN products p ON t.product_id = p.id WHERE p.wallet_address = $1',
          [userWalletAddress]
      );
      res.json(result.rows);
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Failed to fetch transaction requests');
  }
});





//----------------------------------------------------------------------------------
// 이미지 정보를 제공하는 API
app.get('/get-image', async (req, res) => {
  if (!req.session.walletAddress) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const { rows } = await pool.query('SELECT image_url FROM images WHERE wallet_address = $1', [req.session.walletAddress]);
      if (rows.length > 0) {
          res.json({ image_Url: rows[0].image_Url });
      } else {
          res.status(404).json({ message: 'Image not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// 상품 목록 가져오기-------------------------------------------------------------
app.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/get-product-details', async (req, res) => {
  const productId = req.query.productId;

  if (!productId) {
    return res.status(400).send('Invalid product ID provided');
  }

  try {
    // 데이터베이스에서 productId에 해당하는 데이터 조회
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (result.rows.length === 0) {
      return res.status(404).send('Product not found');
    }
    res.json(result.rows[0]); // 조회된 제품 정보를 JSON 형태로 반환

  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/products/:id', async (req, res) => {
  const productId = req.params.id;
  if (!productId || productId === 'null') {
      return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
      const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
      if (rows.length > 0) {
          res.status(200).json(rows[0]);
      } else {
          res.status(404).json({ error: 'Product not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});




const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));


app.post('/connect-wallet', async (req, res) => {
	const clientIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;
	const walletAddress = req.body.walletAddress;
  
	try {
	  const queryText = 'INSERT INTO client_data (ip_address, wallet_address) VALUES ($1, $2)';
	  const values = [clientIp, walletAddress];
	  await pool.query(queryText, values);
  
	  // 세션에 지갑 주소 저장
	  req.session.walletAddress = walletAddress;
  
	  console.log('세션 저장된 지갑 주소:', req.session.walletAddress); // 세션 정보 로그 출력
  
	  res.json({
		success: true,
		message: '지갑 연결 버튼이 클릭되었습니다.',
		ip: clientIp,
		walletAddress: walletAddress,
		sessionInfo: req.session.walletAddress // 세션 정보를 응답에 포함
	  });
	} catch (error) {
	  console.error('Error inserting client data into database:', error);
	  res.status(500).json({
		success: false,
		message: '클라이언트 데이터를 데이터베이스에 저장하는 중 오류가 발생했습니다.'
	  });
	}
  });
  
// 파일 경로 조합하기
const filePath = path.join(__dirname, 'public', 'mypage.html');

// 파일 확장자 추출하기
const ext = path.extname(filePath);  // '.html'

console.log(filePath);  // 예: /Users/username/project/public/index.html
console.log(ext);       // .html


// mypage에 접근할 때 세션 검증 미들웨어
function verifyWalletSession(req, res, next) {
	if (req.session.walletAddress) {
	  next();
	} else {
	  res.status(403).json({ message: "Access denied. No wallet connected." });
	}
  }
  
  // mypage.html에 대한 엔드포인트, 세션 검증 포함
  app.get('/mypage', verifyWalletSession, (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'mypage.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});




// FRC 토큰 스마트 컨트랙트 주소와 ABI를 정의합니다. (예시 값으로 대체해 주세요.)
const tokenContractAddress = '0x8d7c643623b88445b114e72e6a4778d80585c92b';
const tokenABI = [];
// 스마트 컨트랙트 인스턴스 생성
const tokenContract = new web3.eth.Contract(tokenABI, tokenContractAddress);
// 스마트 컨트랙트의 totalSupply를 조회하는 엔드포인트
app.get('/totalSupply', async (req, res) => {
  try {
      const totalSupply = await tokenContract.methods.totalSupply().call();
      res.json({
          totalSupply: totalSupply
      });
  } catch (error) {
      res.status(500).send('totalSupply를 조회하는 중 오류가 발생했습니다: ' + error.message);
  }
});

app.get('/info', async (req, res) => {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    const chainId = await web3.eth.getChainId();

    res.json({
      blockNumber: blockNumber,
      chainId: chainId
    });
  } catch (error) {
    res.status(500).send('정보를 가져오는 중 오류가 발생했습니다: ' + error.message);
  }
});

// FRC 토큰 잔액을 조회하는 엔드포인트 추가
app.get('/balance/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const balance = await tokenContract.methods.balanceOf(address).call();
        res.json({
            address: address,
            balance: balance
        });
    } catch (error) {
        res.status(500).send('잔액을 조회하는 중 오류가 발생했습니다: ' + error.message);
    }
});
// 블록체인 연결 상태 확인하는 엔드포인트
app.get('/test', (req, res) => {
  if (web3 && web3.eth.net.isListening()) {
    res.send({ connected: true, message: '블록체인에 연결되어 있습니다.' });
  } else {
    res.send({ connected: false, message: '블록체인에 연결되어 있지 않습니다.' });
  }
});

app.post('/register', async (req, res) => {
  const { walletAddress, name, address, detailAddress, phone } = req.body;
  try {
      await pool.query('INSERT INTO users (wallet_Address, name, address, detailaddress, phone) VALUES ($1, $2, $3, $4, $5)', [walletAddress, name, address, detailAddress, phone]);
      req.session.walletAddress = walletAddress;
      req.session.name = name;
      req.session.address = address;
      req.session.detailAddress = detailAddress;
      req.session.phone = phone;
      res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

app.post('/register', async (req, res) => {
  const { walletAddress, name, address, detailAddress, phone } = req.body;

  if (!walletAddress || !name || !address || !detailAddress || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
      // 먼저 지갑 주소가 이미 등록되어 있는지 확인
      const checkRes = await pool.query('SELECT 1 FROM users WHERE wallet_address = $1', [walletAddress]);
      if (checkRes.rowCount > 0) {
          // 지갑 주소가 이미 존재하는 경우, 에러 메시지 반환
          return res.status(409).json({ success: false, message: 'Wallet address already registered.' });
      }

      // 지갑 주소가 존재하지 않는 경우, 새로운 사용자 정보를 등록
      await pool.query('INSERT INTO users (wallet_address, name, address, detailaddress, phone) VALUES ($1, $2, $3, $4, $5)', [walletAddress, name, address, detailAddress, phone]);
      req.session.walletAddress = walletAddress;
      req.session.name = name;
      req.session.address = address;
      req.session.detailAddress = detailAddress; // 세션에 상세 주소 추가
      req.session.phone = phone;
      res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, message: 'Registration failed' });
  }
});



app.post('/login', async (req, res) => {
  const { walletAddress } = req.body;
  try {
      const user = await pool.query('SELECT * FROM users WHERE wallet_address = $1', [walletAddress]);
      if (user.rows.length > 0) {
          req.session.walletAddress = walletAddress; // 세션에 지갑 주소 저장
          res.json({ success: true, message: 'Logged in successfully' });
      } else {
          res.status(401).json({ success: false, message: 'Wallet address not registered' });
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/user-profile', async (req, res) => {
  if (!req.session.walletAddress) {
      return res.status(401).send('Unauthorized');
  }

  try {
      const { rows } = await pool.query('SELECT name, address, detailaddress, phone FROM users WHERE wallet_address = $1', [req.session.walletAddress]);
      if (rows.length > 0) {
          res.json(rows[0]);
      } else {
          res.status(404).send('User not found');
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Server error');
  }
});






app.get('/user-profile/:walletAddress', async (req, res) => {
  console.log('Fetching user data for wallet:', req.params.walletAddress);
  // 데이터베이스 쿼리 실행
});


app.get('/api/get-buyer-info', async (req, res) => {
  const buyerAddress = req.query.address;
  if (!buyerAddress) {
      return res.status(400).json({ error: 'Buyer address is required' });
  }

  try {
      const { rows } = await pool.query('SELECT name, address, detailaddress, phone FROM users WHERE wallet_address = $1', [buyerAddress]);
      if (rows.length > 0) {
          res.json(rows[0]);
      } else {
          res.status(404).json({ error: 'Buyer not found' });
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch buyer info' });
  }
});



let transactions = {}; // 임시 저장소 예시, 실제로는 데이터베이스 사용

// 주문 수락 상태 저장
app.post('/api/accept-transaction/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const { productId, buyerAddress } = req.body;
    transactions[transactionId] = { accepted: true, productId, buyerAddress };
    res.send({ success: true });
});


// 주문 상태 확인 API
app.get('/api/check-order/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
      // 데이터베이스에서 productId에 해당하는 주문 정보 조회
      const result = await pool.query('SELECT status FROM orders WHERE product_id = $1', [productId]);
      if (result.rows.length > 0 && result.rows[0].status === 'confirmed') {
          res.json({ orderAccepted: true });
      } else {
          res.json({ orderAccepted: false });
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch order status' });
  }
});


// 주문 생성 API
app.post('/api/create-order', async (req, res) => {
  const { buyerAddress, productId, message } = req.body;
  if (!buyerAddress || !productId) {
      return res.status(400).json({ success: false, message: 'Buyer address and product ID are required' });
  }

  try {
      const result = await pool.query(
          'INSERT INTO orders (product_id, buyer_address, message, status) VALUES ($1, $2, $3, $4) RETURNING *',
          [productId, buyerAddress, message, 'pending'] // 주문 생성 시 기본 상태를 'pending'으로 설정
      );
      res.status(201).json({ success: true, message: 'Order created successfully', order: result.rows[0] });
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});


// 주문 확정 API
app.post('/api/confirm-order', async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
  }

  try {
      const updateResult = await pool.query(
          'UPDATE orders SET status = $1 WHERE product_id = $2 RETURNING *',
          ['confirmed', orderId]
      );

      if (updateResult.rowCount > 0) {
          res.json({ success: true, message: 'Order confirmed successfully', order: updateResult.rows[0] });
      } else {
          res.status(404).json({ success: false, message: 'Order not found' });
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, message: 'Failed to confirm order' });
  }
});




// 주문 상태 확인 API
app.get('/api/check-order-status', async (req, res) => {
  const { productId } = req.query;
  try {
      const result = await pool.query('SELECT status FROM orders WHERE product_id = $1', [productId]);
      if (result.rows.length > 0) {
          const orderStatus = result.rows[0].status;
          res.json({ orderPlaced: orderStatus === 'confirmed' });
      } else {
          res.json({ orderPlaced: false });
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch order status' });
  }
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
