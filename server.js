const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const app = express()

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
    let result = await db.collection('post').find().toArray()

    응답.render('list.ejs', { posts: result })
})

app.get('/write', (요청, 응답) => {
    응답.render('write.ejs')
})

app.post('/newPost', async (요청, 응답) => {
    console.log(요청.body)

    try {
        if (요청.body.title == '') {
            응답.send('님 제목 입력 안하심')
        } else {
            await db
                .collection('post')
                .insertOne({ title: 요청.body.title, content: 요청.body.content })
            응답.redirect('/')
        }
    } catch (e) {
        console.log(e) ///에러 메시지 터미널에 출력
        응답.status(500).send('서버에러남')
    }
})

app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑페이지임')
})

app.get('/about', (요청, 응답) => {
    응답.sendFile(__dirname + '/about.html')
})

app.get('/time', (요청,응답) => {
    응답.render('time.ejs', { data: new Date()})
})