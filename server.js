const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const app = express()

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')

// mongoose.connect('mongodb://localhost:27017/forum', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then((client) => {
//     console.log('DB연결성공');
// }).catch((err) => {
//     console.log(err)
// })

let db;
const url = 'mongodb://127.0.0.1:27017';
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공')
    db = client.db('forum');
}).catch((err) => {
    console.log(err)
})

app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html')
})

app.get('/news', (요청, 응답) => {
    응답.send('비올듯ㅋㅋ')
})

app.get('/list', async (요청, 응답) => {
    try {
        const Post = mongoose.connection.collection('post');
        let result = await Post.find().toArray();
        console.log(result[6].title);
        응답.send('DB에 있던 게시물')
    } catch (error) {
        console.error(error);
        응답.status(500).send('DB 조회 중 오류 발생');
    }
})

app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑페이지임')
})

app.get('/about', (요청, 응답) => {
    응답.sendFile(__dirname + '/about.html')
})