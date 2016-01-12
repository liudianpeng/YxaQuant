var Task = require('../models/task.js');

module.exports = function(router) {
    // Task CURD
    router.route('/task')

        // create a task
        .post(function(req, res) {
            
            var task = new Task(req.body);      // create a new instance of the Task model

            // save the task and check for errors
            task.save(function(err) {
                if (err)
                    res.send(err);

                res.json(task);
            });
            
        })

        // get all the tasks
        .get(function(req, res) {
            if(!Task.totalCount){
                Task.count().exec().then(value => Task.totalCount = value);
            }

            var limit = +req.query.limit || 20;
            var skip = +req.query.skip || 0;

            var query = {};

            if(req.query.keyword) {
                query = {
                    $or: [
                        {name: new RegExp(req.query.keyword)},
                        {code: new RegExp(req.query.keyword)}
                    ]
                };
            }

            Task.find(query)
            .limit(limit)
            .skip(skip)
            .exec()
            .then(result => {

                if(skip + result.length > Task.totalCount) {
                    Task.totalCount = skip + result.length;
                }

                res.set('Items-Total', Task.totalCount)
                .set('Items-Start', skip + 1)
                .set('Items-End', Math.min(skip + limit, Task.totalCount))
                .json(result);
            });
        });

    // on routes that end in /task/:task_id
    // ----------------------------------------------------
    router.route('/task/:task_id')

        // get the task with that id
        .get(function(req, res) {
            Task.findById(req.params.task_id, function(err, task) {
                if (err)
                    res.send(err);
                res.json(task);
            });
        })

        .put(function(req, res) {

            // use our task model to find the task we want
            Task.findById(req.params.task_id, function(err, task) {

                if (err)
                    res.send(err);

                task.name = req.body.name;  // update the tasks info
                task.code = req.body.code;

                // save the task
                task.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json(task);
                });

            });
        })

        // delete the task with this id
        .delete(function(req, res) {
            Task.remove({
                _id: req.params.task_id
            }, function(err, task) {
                if (err)
                    res.send(err);

                res.end();
            });
        });

    return router;
}
