const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'shadyd0ta',
		password: '',
		database: 'color-detector'
	}
});


const app = express();
app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
	res.send('it is working')	
})

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
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
			.returning('*')
			.insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			})
			.then(user => {
				res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('email is already existed.'))
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



// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(process.env.PORT, () => {
	console.log(`Sucess!!! on port ${process.env.PORT}`);
});

/* Things to do before starting coding

/ --> root route: res = this is working
/signin --> POST request => response : success/fail
/register --> POST request => response: user object
/profile/:userId --> GET = user
/image --> PUT  --> user object (count in this example)	

*/