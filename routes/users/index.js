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
    //admin gets all users
    // authenticated users get only their record
    // un-authenticated users get nothing

    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const pageNum = (request.params.pagenum) ? request.params.pagenum : 1;
    const pageSize = (request.params.pagesize) ? request.params.pagesize : 10;
    const offset = (pageNum - 1) * pageSize;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser) {
        const result = await users.getUsers(config, authUser, siteid, offset, pageSize);
        return response.status(200).send(result);
    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }

});

// get one user
router.get("/:siteid/:id", async function (request, response) {
    //admin gets any users
    // authenticated users get only their record
    // un-authenticated users get nothing

    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser) {
        const result = await users.getUser(config, authUser, siteid, id);
        return response.send(result);
    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }

});

// create a new user along with some basic roles needed to access the system
router.post("/:siteid", async function (request, response) {
    //admin only can create a new user

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
    // admin only can delete a user
    // admin cannot delete their own user 
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser.RoleNames.indexOf('admin') > -1) {
        await users.deleteUser(config, siteid, id);
        return response.send(id);
    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }
});

// update a user
router.put("/:siteid/:id", async function (request, response) {
    // admin can update any users
    // authenticated users can update only their own record
    // un-authenticated users can update nothing

    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    UserFactory.Set(request.body);
    const dataValues = UserFactory.Get();

    if ((authUser.RoleNames.indexOf('admin') > -1) || (dataValues.ITCC_UserID === authUser.ITCC_UserID)) {
        const result = await users.updateUser(config, siteid, authUser, dataValues);
        return response.send(result);
    }
    else {
        return response.send({ err: 'you\'re not authorized to access this' });
    }
});

module.exports = router;