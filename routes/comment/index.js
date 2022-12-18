const router = require('express').Router();
const configs = require('../../config_functions'); //require('../../config');
const comments = require('./comment_functions');
const SharedFunctions = require('../../shared/shared_functions');
const LoginFunctions = require('../login/login_functions');

const CommentFactory = {
    Fields: {
        ITCC_CommentID: 0, ITCC_WebsiteID: -1, ITCC_StatusID: -1, ITCC_UserID: -1, ITCC_PostID:1, ReplyPostID:-1,
        CommentTitle: '', CommentDetail: '', CommentFullName: '',  PermaID: '', ReplyLevel:1, SortOrder:1,
        CreateDate: new Date(), ModifyDate: new Date(), CreateAccountID: -1, ModifyAccountID: -1
    }
    , Set: function (value) {
        this.Fields = Object.assign(this.Fields, value);
    }
    , Get: function () {
        return this.Fields;
    }
};


//  http://localhost:3010/api/gallery/FEA91F56-CBE3-4138-8BB6-62F9A5808D57/1
//  http://localhost:3010/api/users/1DC52158-0175-479F-8D7F-D93FC7B1CAA4/page/1
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
    const roleNames = await LoginFunctions.getUserRolesByAuthToken(config, siteid, authID);
    const itemsResult = await comments.getItems(config, siteid, offset, pageSize);
    const result = itemsResult.recordset;

    if (roleNames && roleNames.indexOf('admin') > -1) {
        return response.status(200).send(result);
    }
    else {
        // return a trimmed down result
        return response.status(200).send(result);
    }

});

// get one comment
router.get("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await LoginFunctions.getUserRolesByAuthToken(config, siteid, authID);
    const authResult = await comments.getItem(config, siteid, id);
    const result = (authResult.recordset && (authResult.recordset.length > 0))
        ? authResult.recordset[0] : null;

    if (roleNames && roleNames.indexOf('admin') > -1) {
        return response.send(result);
    }
    else {
        return response.send(result);
    }
});

// get all comments by blog slug
router.get("/:siteid/slug/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);

    const roleNames = await LoginFunctions.getUserRolesByAuthToken(config, siteid, authID);
    const result = await comments.getItemsBySlug(config, siteid, id);

    if (roleNames && roleNames.indexOf('admin') > -1) {
        return response.send(result);
    }
    else {
        return response.send(result);
    }
});

// create a new Item along with some basic roles needed to access the system
router.post("/:siteid", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);
    //console.log({authUser: authUser});

    if (authUser.RoleNames.indexOf('admin') > -1) {
        CommentFactory.Set(request.body);
        const dataValues = CommentFactory.Get();

        if (!dataValues.Slug || dataValues.Slug.trim().length === 0) {
            dataValues.Slug = SharedFunctions.slugify(dataValues.Name);
        }

        const authResult = await comments.createItem(config, siteid, authUser, dataValues);
        const result = authResult;
        return response.send(result);
    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }

});

// update an Item
router.put("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);

    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);
    CommentFactory.Set(request.body);
    const dataValues = CommentFactory.Get();

    if ((authUser.ITCC_UserID === dataValues.ITCC_UserID) || (authUser.RoleNames.indexOf('admin') > -1)) {

        if (!dataValues.Slug || dataValues.Slug.trim().length === 0) {
            dataValues.Slug = SharedFunctions.slugify(dataValues.Name);
        }

        const result = await comments.updateItem(config, siteid, authUser, dataValues);

        console.log({
            UpdateComment: result
        })

        return response.send(result);
    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }
});

// delete a Item
router.delete("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser.RoleNames.indexOf('admin') > -1) {
        await comments.deleteItem(config, siteid, id);
        return response.send(id);
    }
    else {
        return response.status(401).send({ error: 'you\'re not authorized to access this' });
    }
});


module.exports = router;