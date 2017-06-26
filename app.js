var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');



var app = express();
var business = require('./routes/business');
var detail = require('./routes/detail');
var login = require('./routes/login');
var guide = require('./routes/guide');
var problem = require('./routes/problem');
var handling = require('./routes/handling');
var regulations = require('./routes/regulations');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('Wilson'));
app.use(session({ secret: 'wilson'}));

app.use('/', index);
app.use('/business', business);
app.use('/detail', detail);
app.use('/login', login);
app.use('/guide', guide);
app.use('/problem', problem);
app.use('/handling', handling);
app.use('/regulations', regulations);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(8100);
module.exports = app;
