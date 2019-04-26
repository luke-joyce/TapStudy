module.exports = function(app, passport) {
  var pg = require('pg');

  //***Connection to Heroku Database
  //var conString = process.env.DATABASE_URL;
  //var client = new pg.Client(conString);

  //***Connection to local database***
  var client = new pg.Client({
    user: 'harrisonayan',
    host: 'localhost',
    database: 'tap-study',
    password: 'harrison',
    port: 5432,
  });
  //Home register/login page
  app.get('/', function(req, res) {
    res.render('pages/register.ejs', {
      //message: req.flash('loginMessage'),
      title: "Register/Login"
    });
  });

  //login
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  }));
  //register
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  }));

  app.get('/home', isLoggedIn, function(req, res) {
    res.render('pages/homePage.ejs' ,{
      user: req.user,
      title: "Home"
    });
    //console.log(req.user);
  });

  app.get('/profile', isLoggedIn, function(req, res) {
    client.connect();
    var name = req.user.first_name + ' ' + req.user.last_name;
    client.query('SELECT * FROM users WHERE user_id=$1', [req.user.user_id], function(err, result) {
      if(err) {
        return err;
      } else {
          var study_status = result.rows[0]['study_status']
          var major = result.rows[0]['major'];
          var grade = result.rows[0]['grade'];
          var hometown = result.rows[0]['hometown'];
          if (study_status == false)
            study_status = 'Not Currently Studying';
          if (study_status == true)
            study_status = 'Studying Now';
          if (major == null)
            major = 'N.A.';
          if( grade == null)
            grade = 'N.A.';
          if(hometown == null)
            hometown = 'N.A.';

          res.render('pages/profile.ejs' , {
            user: req.user,
            title: "Profile",
            name: name,
            username: req.user.username,
            study_status: study_status,
            major: major,
            grade: grade,
            hometown: hometown
        });
        client.end();
      }
    });
    //console.log(req.user);
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('is logged in');
    return next();
  }
  console.log('is not logged in');
  res.redirect('/');
}
