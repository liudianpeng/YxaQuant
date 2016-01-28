var step1 = function() {
    console.log('Step1');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Step1 timeout.');
            resolve('Hello');
        }, 1000);
        setTimeout(() => {
            // reject('No catch, no next then.');
        }, 500);
    });
};

var step2 = function(previous) {
    console.log('Step2');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Step2 timeout.');
            resolve(previous + ' World');
        }, 1000);
        setTimeout(() => {
            reject('Rejection!');
        }, 500)
    });
};

var step3 = function(previous) {
    console.log('Step3:');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(previous + ' !');
        }, 1000);
    });
};

step1()

.then(() => {
    console.log(0);
}).then(() => {
    console.log(1);
    // return Promise.reject('e1');
}).then(() => {
    console.log(2);
}).then(() => {
    throw new Error('e3');
    console.log(3);
}).then(() => {
    console.log(4);
}).then(() => {
    console.log(5);
}).then(() => {
    console.log(6);
}).catch((err) => {
    console.log(7, err);
});
