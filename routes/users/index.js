const router = require('express').Router();
const configs = require('../../config_functions'); //require('../../config');
const users = require('./user_functions');
const LoginFunctions = require('../login/login_functions');

const UserFactory = {
    Fields: {
        ITCC_UserID: -1, UserID: '', ITCC_WebsiteID: -1, ITCC_StatusID: -1,
        CreateDate: new Date(), ModifyDate: new Date(), CreateUserID: -1, ModifyUserID: -1, RoleName: 'subscriber',
        UserName: '', Password: '', EmailAddress: '', FirstName: '', IsOnline: -1, UserToken: '',
        IsApproved: -1, IsLockedOut: -1
    }
    , Set: function (value) {
        this.Fields = Object.assign(this.Fields, value);
    }
    , Get: function () {
        return this.Fields;
    }
};



// http://localhost:3011/api/blog/1DC52158-0175-479F-8D7F-D93FC7B1CAA4/page/1?pagenum=1
//  https://nodeapi.launchfeatures.com/api/gallery/88B8B45E-2BE7-44CB-BBEA-547BB9A8C7D5/2
// get a paginated list of users
router.get("/:siteid/page/:pagenum/:pagesize", async function (request, response) {

    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const pageNum = (request.params.pagenum) ? request.params.pagenum : 1;
    const pageSize = (request.params.pagesize) ? request.params.pagesize : 10;
    const offset = (pageNum - 1) * pageSize;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    //admin gets all users
    // authenticated users get only their record
    // un-authenticated users get nothing
    const result = await users.getUsers(config, authUser, siteid, offset, pageSize);
    return response.status(200).send(result);


});

// get one user
router.get("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser.RoleNames.indexOf('admin') > -1) {
        const authResult = await users.getUser(config, siteid, id);
        const result = (authResult.recordset && (authResult.recordset.length > 0))
            ? authResult.recordset[0] : null;
        return response.send(result);
    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }
});

// create a new user along with some basic roles needed to access the system
router.post("/:siteid", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);

    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser.RoleNames.indexOf('admin') > -1) {
        UserFactory.Set(request.body);
        const dataValues = UserFactory.Get();

        const result = await users.createUser(config, siteid, authUser, dataValues);
        return response.send(result);

    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }
});

// delete a user
router.delete("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser.RoleNames.indexOf('admin') > -1) {
        const authResult = await users.deleteUser(config, siteid, id);
        return response.send(id);
    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }
});

// update a user
router.put("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.body.id;
    const username = request.body.username;
    const emailaddress = request.body.emailaddress;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await LoginFunctions.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const result = await users.updateUser(config, siteid, id, username, emailaddress);
        return response.send(result);
    }
    else {
        return response.send({ err: 'you\'re not authorized to access this' });
    }
});

module.exports = router;