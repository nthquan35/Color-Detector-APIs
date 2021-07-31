const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
// const knex = require('knex');
const { Pool } = require('pg');

/*
	- Get Heroku CLI
	- Connect with process.env 
	- Commit to Heroku
*/

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

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) =>{
	res.send('it is working')
});


app.post('/signin', (req, res) => {
	const query = {
		text:
			'SELECT email, hash FROM login WHERE email = $1',
		values:
			[req.body.email],
	};
	pool.query(query, (err, results) => {
		if (err) {
			res.status(400).json('Unable to get user!');
		} else if (results.rows.length < 1) {
			res.status(200).json('Wrong credential!');
		} else {
			const isValid = bcrypt.compareSync(req.body.password, results.rows[0].hash);
			if (isValid){
				const secondQuery = {
					text: 'SELECT * FROM users WHERE email = $1',
					values: [req.body.email],
				};
				pool.query(secondQuery, (err, secondResults) => {
					if (err) {
						res.status(400).json('Unable to get user!');
					} else if (secondResults.rows.length < 1){
						res.status(200).json('Wrong credential!');
					} 
					else {
						//console.log(secondResults.rows[0]);
						res.json(secondResults.rows[0]);
					}
				})
			}
		}
	})
})

app.post('/signup', (req, res) => {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);
	const joinedDate = new Date();
	//res.json('This is working without any problem');

	const loginQuery = {
		text:
			'INSERT INTO login(email, hash) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
		values:
			[email, hash],
	};
	pool.query(loginQuery, (error, results) =>{
		if (error) {
			res.status(400).json('unable to register.');
		} else if (results.rows.length < 1) {
			res.status(200).json('Email is already existed! Please use another email.');	
		} else {
			const usersQuery = {
				text: 'INSERT INTO users(name, email, joined) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *',
				values: [name, email, joinedDate],
			};
				pool.query(usersQuery, (err, userResults) => {
				if (err) {
					console.log(err.stack);
					res.status(400).json('Unable to register.');
				} else if (userResults.rows.length < 1) {
					res.status(400).json('Email is already existed! Please use another email.');	
				} else {
					res.status(200).json('Registered Successfully!');
				}	
			});
		}
	});
});


app.get('/profile/:id', (req, res) => {
	const {id} = req.params;
	//console.log(req.params);
	const query = {
		text : 'SELECT * FROM users WHERE id = $1',
		values: [id],
	};
	pool.query(query, (err, results) => {
		if (err){
			res.status(400).json('ID does not exist!');
		} else if (results.rows.length < 1) {
			res.status(400).json('ID does not exist!');	
		} else {
			res.json(results.rows[0]);
		}
	})
});

app.put('/image', (req, res) => {
	const {id} = req.body;
	
	const query = {
		text: 'UPDATE users SET entries = entries + 1 WHERE id = $1 RETURNING entries',
		values: [id]
	};

	pool.query(query, (err, results) => {
		if (err){
			res.status(400).json('Unable to get entries!');
		} else {
			res.json(results.rows[0]);
		}
	});
})


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Sucess!!! on port ${PORT}...`);
});

/* Things to do before starting coding

/ --> root route: res = this is working
/signin --> POST request => response : success/fail
/register --> POST request => response: user object
/profile/:userId --> GET = user
/image --> PUT  --> user object (count in this example)	

*/