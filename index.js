const express = require('express'),  
      app = express(),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      morgan = require('morgan'),
      User = require('./models/user'),
      passport = require('passport'),
      jwt = require('jsonwebtoken'),
      cors = require('cors'),
      config = require('./config/main');

const router = require('./router'); 

// Database Connection
mongoose.Promise = global.Promise;
mongoose.connect(config.database);  

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());


app.use(cors());

// Log requests to console
app.use(morgan('dev'));  
//We will add a quick home page route so I can give a quick demonstration of what morgan does. Add this next.

app.use(passport.initialize());  
//And now we can import our JWT passport strategy. Enter this below our mongoose connection:

// Bring in defined Passport Strategy
require('./config/passport')(passport);  
//Now we can start on our routes. We will start by creating the route group called apiRoutes. We will now be working down without jumping all over the place in the code. That said, this goes beneath the passport strategy import we just did:

// Create API group routes
var apiRoutes = express.Router();  
//Next, we can create our registration route:

// Register new users
apiRoutes.post('/register', function(req, res) {  
  console.log(req);
  if(!req.body.email || !req.body.password) {
    res.json({ success: false, message: 'Please enter email and password.' });
  } else {
    var newUser = new User({
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'Client'
    });

    // Attempt to save the user
    newUser.save(function(err) {
      if (err) {
        return res.json(500, { success: false, message: 'That email address already exists.'});
      }
    
      var token = jwt.sign(newUser, config.secret, {
        expiresIn: 10080 //180 minutes in seconds
      });
      res.json({ success: true, email: req.body.email, token: token });
    });
  };
});

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
apiRoutes.post('/authenticate', function(req, res) {  
    console.log(req.body);
  User.findOne({
    
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign(user, config.secret, {
            expiresIn: 10080 //180 minutes in seconds
          });
          res.json({ success: true, email: req.body.email, token: token });
        } else {
          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

// Protect dashboard route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {  
    console.log(req);
    if (req.user.role === 'Admin'){
        res.json({message: 'It worked! User id is: ' + req.user._id + '. roles are: ' + req.user.role});
    } else {
        res.json(401, {message: 'User not authorized to view ' + req.user.email + ' role: ' + req.user.role});
    }
  
});

// Set url for API group routes
app.use('/api', apiRoutes);  

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {  
  res.send('Relax. We will put the home page here later.');
});

const server = app.listen(config.port);
console.log('Your server is running on port ' + config.port + '.');

