const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt')

const app = express()

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const MongoStore = require('connect-mongo')

app.use(passport.initialize())
app.use(session({
    secret: '암호화에 쓸 비번',
    resave: false,
    saveUninitialized: false,
    cookie : { maxAge : 60 * 60 * 1000},
    store : MongoStore.create({
        mongoUrl : 'DB접속용 URL ~~~',
        dbName : 'forum'
    })
}))
app.use(passport.session())

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

app.listen(8081, () => {
    console.log('http://localhost:8081 에서 서버 실행중')
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

app.get('/time', (요청, 응답) => {
    응답.render('time.ejs', { data: new Date() })
})

app.get('/detail/:id', async (요청, 응답) => {
    try {
        let result = await db.collection('post').findOne({ _id: new ObjectId(요청.params.id) })
        응답.render('detail.ejs', { result: result })
        if (result == null) {
            응답.status(404).send('응답 없음')
        }
    } catch (e) {
        console.log(e)
        응답.status(404).send('URL 잘못 입력하셨어요')
    }
})

app.get('/edit/:id', async (요청, 응답) => {
    try {
        const id = new ObjectId(요청.params.id);
        let result = await db.collection('post').findOne({ _id: id });
        if (result) {
            응답.render('edit.ejs', { result: result });
        } else {
            응답.status(404).send('Post not found');
        }
    } catch (error) {
        console.error("Error in /edit/:id route:", error);
        응답.status(400).send('Invalid ID format');
    }
});

app.put('/edit', async (요청, 응답) => {
    try {
        const id = new ObjectId(요청.body.id);
        const updateResult = await db.collection('post').updateOne(
            { _id: id },
            { $set: { title: 요청.body.title, content: 요청.body.content } }
        );
        if (updateResult.matchedCount > 0) {
            응답.redirect('/list');
        } else {
            응답.status(404).send('Post not found');
        }
    } catch (error) {
        console.error("Error in /edit route:", error);
        응답.status(400).send('Invalid ID format or update failed');
    }
});

app.delete('/delete', async (요청, 응답) => {
    try {
        await db
            .collection('post')
            .deleteOne({ _id: new ObjectId(요청.query._id) }, function () {
                console.log('삭제 성공');
            })
        응답.send('삭제완료');
    } catch (error) {
        console.error("Error in /delete : ", error);
        응답.status(500).send('서버 에러');
    }
})

app.get('/list/:id', async(요청, 응답) => {
    let result = await db.collection('post').find().skip((요청.params.id-1) * 5).limit(5).toArray()
    응답.render('list.ejs', {posts : result})
})

app.get('/list/next/:id', async(요청, 응답) => {
    let result = await db.collection('post')
    .find({_id: {$gt : new ObjectId(요청.params.id)}})
    .limit(5).toArray()
    응답.render('list.ejs', {posts : result})
})

passport.use(new LocalStrategy(async(입력한아이디, 입력한비번, cb) => {
    let result = await db.collection('user').findOne({username : 입력한아이디})
    if(!result) {
        return cb(null, false, {message: '아이디 DB에 없음'})
    }

    if(await bcrypt.compare(입력한비번, result.password)){
        return cb(null, result)
    } else {
        return cb(null,false, {message: '비번불일치'});
    }
}))

passport.serializeUser((user,done) => {
    console.log(user)
    process.nextTick(() => {
        done(null, {id:user._id, username : user.username}) 
    })
})

passport.deserializeUser(async(user,done) => {
    let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
    delete result.password
    process.nextTick(() => {
        done(null, result) 
    })
})

app.get('/login', async(요청, 응답) => {
    console.log(요청.user)
    응답.render('login.ejs')
})

app.post('/login', async(요청, 응답, next) => {
    passport.authenticate('local', (error, user, info)=>{
        if(error) return 응답.status(500).json(error)
        if(!user) return 응답.status(401).json(info.message) ///user 파라미터가 비어 있을 때
        요청.logIn(user, (err)=>{
            if(err) return next(err)
            응답.redirect('/')
        }) ///실행 시 세션 만들어준다
    })(요청, 응답, next)
})

app.get('/register', (요청, 응답) => {
    응답.render('register.ejs')
})

app.post('/register', async(요청, 응답) => {
    let 해시 = await bcrypt.hash(요청.body.password, 10)
    console.log(해시)

    await db.collection('user').insertOne({
        username : 요청.body.username,
        password : 요청.body.password
    })
    응답.redirect('/')
})