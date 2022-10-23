const router = require('express').Router();
const configs = require('../../config_functions'); //require('../../config');
const users = require('./user_functions');
const login = require('../login/login_functions');


//  http://localhost:3010/api/gallery/FEA91F56-CBE3-4138-8BB6-62F9A5808D57/1
//  https://nodeapi.launchfeatures.com/api/gallery/88B8B45E-2BE7-44CB-BBEA-547BB9A8C7D5/2
// get a paginated list of users
router.get("/:siteid/page/:pagenum?", async function (request, response) {
    const siteid = request.params.siteid;
    const authID = request.headers.authid;
    const pageNum = (request.params.pagenum) ? request.params.pagenum : 1;
    const pageSize = 20; 
    const offset = (pageNum - 1) * pageSize;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const usersResult = await users.getUsers(config, siteid, offset, pageSize);
        const result = usersResult.recordset;
        return response.send(result);
    }
    else {
        return response.status(401).send({error: 'you\'re not authorized to access this'});
    }

});

// get one user
router.get("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authID = request.headers.authid;
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const authResult = await users.getUser(config, siteid, id);
        const result =  authResult.recordset;
        return response.send(result);
    }
    else {
        return response.status(401).send({error: 'you\'re not authorized to access this'});
    }
});

// create a new user along with some basic roles needed to access the system
router.post("/:siteid", async function (request, response) {
    const siteid = request.params.siteid;
    const authID = request.headers.authid;
    const id = request.params.id;
    const firstname = request.body.firstname;
    const lastname = request.body.lastname;
    const username = request.body.username;
    const emailaddress = request.body.emailaddress;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const authResult = await users.createUser(config, siteid, 
            username, username, username, emailaddress, 1, 1, 0,
            emailaddress, 1, 1, 1);
        const result =  authResult.recordset;
        return response.send(result);
    }
    else {
        return response.status(401).send({error: 'you\'re not authorized to access this'});
    }
});

// delete a user
router.delete("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authID = request.headers.authid;
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const authResult = await users.deleteUser(config, siteid, id);
        const result =  authResult.recordset;
        return response.send(result);
    }
    else {
        return response.status(401).send({error: 'you\'re not authorized to access this'});
    }
});

// update a user
router.put("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authID = request.headers.authid;
    const id = request.body.id;
    const username = request.body.username;
    const emailaddress = request.body.emailaddress;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const authResult = await users.updateUser(config, siteid, id, username, emailaddress);
        const result =  authResult.recordset;
        return response.send(result);
    }
    else {
        return response.send({err: 'you\'re not authorized to access this'});
    }
});

module.exports = router;