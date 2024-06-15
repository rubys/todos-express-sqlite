var express = require('express');

const USERID = process.env.FLY_MACHINE_ID || 'development';

var userRouter = express.Router();
var router = express.Router({ mergeParams: true});
userRouter.use('/:userid', (req, res, next) => {
  if (req.params.userid === USERID) {
    return router(req, res, next);
  } else {
    res.set('Fly-Replay', `instance=${req.params.userid}`)
    res.status(307)
    res.send()
  }
});
var db = require('../db');

function fetchTodos(req, res, next) {
  db.all('SELECT * FROM todos', [], function(err, rows) {
    if (err) { return next(err); }
    
    var todos = rows.map(function(row) {
      return {
        id: row.id,
        title: row.title,
        completed: row.completed == 1 ? true : false,
	url: '/' + req.params.userid + '/' + row.id
      }
    });
    res.locals.todos = todos;
    res.locals.activeCount = todos.filter(function(todo) { return !todo.completed; }).length;
    res.locals.completedCount = todos.length - res.locals.activeCount;
    next();
  });
}

/* GET home page. */
router.get('/', fetchTodos, function(req, res, next) {
  res.locals.filter = null;
  res.locals.home = '/' + req.params.userid + '/';
  res.render('index');
});

router.get('/active', fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return !todo.completed; });
  res.locals.filter = 'active';
  res.locals.home = '/' + req.params.userid + '/';
  res.render('index');
});

router.get('/completed', fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return todo.completed; });
  res.locals.filter = 'completed';
  res.locals.home = '/' + req.params.userid + '/';
  res.render('index');
});

router.post('/', function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  return res.redirect('/' + req.params.userid + '/' + (req.body.filter || ''));
}, function(req, res, next) {
  db.run('INSERT INTO todos (title, completed) VALUES (?, ?)', [
    req.body.title,
    req.body.completed == true ? 1 : null
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + req.params.userid + '/' + (req.body.filter || ''));
  });
});

router.post('/:id(\\d+)', function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  db.run('DELETE FROM todos WHERE id = ?', [
    req.params.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + req.params.userid + '/' + (req.body.filter || ''));
  });
}, function(req, res, next) {
  db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ?', [
    req.body.title,
    req.body.completed !== undefined ? 1 : null,
    req.params.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + req.params.userid + '/' + (req.body.filter || ''));
  });
});

router.post('/:id(\\d+)/delete', function(req, res, next) {
  db.run('DELETE FROM todos WHERE id = ?', [
    req.params.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + req.params.userid + '/' + (req.body.filter || ''));
  });
});

router.post('/toggle-all', function(req, res, next) {
  db.run('UPDATE todos SET completed = ?', [
    req.body.completed !== undefined ? 1 : null
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + req.params.userid + '/' + (req.body.filter || ''));
  });
});

router.post('/clear-completed', function(req, res, next) {
  db.run('DELETE FROM todos WHERE completed = ?', [
    1
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + req.params.userid + '/' + (req.body.filter || ''));
  });
});

userRouter.get('/', function(req, res, next) {
  return res.redirect('/' + USERID);
});

module.exports = userRouter;
