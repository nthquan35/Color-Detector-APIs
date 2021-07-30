const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
// const knex = require('knex');
const { Pool } = require('pg');

// const db = knex({
// 	client: 'pg',
// 	connection: {
// 		connectionString: process.env.DATABASE_URL,
// 		ssl: true
// 	}
// });

const pool = new Pool({
	user: process.env.DB_USER || 'colordetector',
	host: process.env.DB_ADDRESS || 'localhost',
	database: process.env.DB_NAME || 'userinfo',
	password: process.env.DB_PASSWORD || '123456',
});

pool.connect((err, client, release) => {
  if (err) {
	return console.error('Error acquiring client', err.stack)
  }
  else {
	console.log("Connected!");
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

/*
app.get('/', (req, res) =>{res.send('it is working')})

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
	.then(data => {
		if(data.length){
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid){
				return db.select('*').from('users')
				.where('email', '=', req.body.email)
				.then(user => {
					res.json(user[0]);
				})
				.catch(err => res.status(400).json('Unable to get user.'))
			}
		}
		else{
			res.status(200).json('Wrong credential!');
		}
	})
	.catch(err => res.status(400).json('Wrong credential.'))
})

app.post('/signup', (req, res) => {
	const {email, name, password} = req.body;
	const hash = bcrypt.hashSync(password);
	res.json('This is working without any problem');
	// db.transaction(trx => {
	// 	trx.insert({
	// 		hash: hash,
	// 		email: email
	// 	})
	// 	.into('login')
	// 	.returning('email')
	// 	.then(loginEmail => {
	// 		return trx('users')
	// 		.returning('*')
	// 		.insert({
	// 			email: loginEmail[0],
	// 			name: name,
	// 			joined: new Date()
	// 		})
	// 		.then(user => {
	// 			res.json(user[0]);
	// 		})
	// 	})
	// 	.then(trx.commit)
	// 	.catch(trx.rollback)
	// })
	// .catch(err => res.status(400).json('unable to register.'))
})

app.get('/profile/:id', (req, res) => {
	const {id} = req.params;
	db.select('*').from('users').where({
		id: id
	})
	.then(user => {
		if(user.length){
			res.json(user[0])
		}
		else{
			res.status(400).json('NOT FOUND!!!')
		}
	})
	.catch(err => res.status(400).json('not found!!!'))
})

app.put('/image', (req, res) => {
	const {id} = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('unable to get entries'))
})

*/

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(process.env.PORT || 3001, () => {
	console.log(`Sucess!!! on port 3001`);
});

/* Things to do before starting coding

/ --> root route: res = this is working
/signin --> POST request => response : success/fail
/register --> POST request => response: user object
/profile/:userId --> GET = user
/image --> PUT  --> user object (count in this example)	

*/