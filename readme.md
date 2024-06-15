# Express • [TodoMVC](http://todomvc.com), adapted for [fly.io](https://fly.io/)

This is a fork of [jaredhanson/todos-express-sqlite](https://github.com/jaredhanson/todos-express-sqlite), with the following modifications:

* `db.js` is modified to place the sqlite3 db on a [volume](https://fly.io/docs/volumes/overview/) for persistence.
* `routes/index.js` is modified to add a prefix of a user id to all routes, and to [replay](https://fly.io/docs/networking/dynamic-request-routing/) all requests on the correct machine if the machine receiving the request is not the one servicing this user.
* `views/index.ejs` is modified to add the userid to routes.

For purposes of this demo, the user id is the fly.io assigned machine id.  In a real application, it would be something an administrator would define, complete with passwords and authentication.

# Deployment

```
git clone https://github.com/rubys/todos-express-sqlite.git
cd todos-express-sqlite
fly launch
```

If you visit this application, you will see a standard todo list.

To create a second todo list, run:

```
fly machine clone
```

This will prompt you for a machine to clone, pick any one.

Notes: 

* [fly machine clone](https://fly.io/docs/flyctl/machine-clone/) accepts a `--region` option.  Feel free to create todo lists [around the world](https://fly.io/docs/reference/regions/#fly-io-regions).
* By default, all machines will be configured to
  [automatically stop and start](https://fly.io/docs/apps/autostart-stop/).
