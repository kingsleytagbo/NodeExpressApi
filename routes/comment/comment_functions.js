
const sql = require("mssql");

const CommentFunctions = {

    /*
            SELECT a paged list of Comments & associated roles from SQL Server
    */
    getItems: async (config, privateKeyID, offset, pageSize) => {
        try {
            await sql.connect(config);

            let query = ' SELECT DISTINCT US.* ';
            query += ' FROM [ITCC_Comment] US ';
            query += ' JOIN [ITCC_Blog] BG (NOLOCK) ON (US.ITCC_PostID = BG.ITCC_BlogID) ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( (WS.PrivateKeyID = @PrivateKeyID) ) ';
            query += ' ORDER BY US.ModifyDate Desc ';
            query += ' OFFSET @Offset ROWS ';
            query += ' FETCH NEXT @PageSize ROWS ONLY ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('Offset', sql.Int, offset);
            request.input('PageSize', sql.Int, pageSize);

            const result = await request.query(query);
            return result;

        } catch (err) {
            //console.log({getComments: err});
            throw err
        }
    },

    /*
        SELECTS a singLe Comment from SQL Server
    */
    getItem: async (config, privateKeyID, id) => {

        try {
            await sql.connect(config);
            let query = ' SELECT DISTINCT US.* ';
            query += ' FROM [ITCC_Comment] US ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( ' +
                ' (US.ITCC_CommentID = @ID) AND (WS.PrivateKeyID = @PrivateKeyID) ' +
                ') ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('ID', sql.Int, id);
            const result = await request.query(query);
            return result;

        } catch (err) {
            throw err
        }
    },

    /*
    SELECTS a singLe Comment By Slug from SQL Server
*/
    getItemsBySlug: async (config, privateKeyID, slug) => {

        try {
            await sql.connect(config);
            let query = ' SELECT DISTINCT US.* ';
            query += ' FROM [ITCC_Comment] US ';
            query += ' JOIN [ITCC_Blog] BG (NOLOCK) ON (US.ITCC_PostID = BG.ITCC_BlogID) ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( ' +
                ' ( LOWER(TRIM(BG.Slug)) = LOWER(TRIM(@Slug)) ) AND (WS.PrivateKeyID = @PrivateKeyID) ' +
                ') ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('Slug', sql.NVarChar(256), (slug || ''));
            const promiseResult = await request.query(query);
            const result = (promiseResult && promiseResult.recordset) ?promiseResult.recordset : [];
            return result;

        } catch (err) {
            throw err
        }
    },


    /*
    Creates a singLe Comment & associated roles in SQL Server
*/
    createItem: async (config, privateKeyID, user, data) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;

        try {
            await sql.connect(config);
            const request = new sql.Request();
            request.input('Name', sql.NVarChar(125), data.Name);
            request.input('Description', sql.NVarChar(), data.Description);
            request.input('Slug', sql.NVarChar(256), (data.Slug || ''));
            request.input('CommentType', sql.NVarChar(), (data.CommentType || ''));
            request.input('PostDate', sql.DateTime2, data.PostDate);
            request.input('SortOrder', sql.Int, (data.SortOrder || 0));
            request.input('Category', sql.NVarChar(), (data.Category || ''));
            request.input('Tags', sql.NVarChar(), (data.Tags || ''));
            request.input('PostSummary', sql.NVarChar(), (data.PostSummary || {}));
            request.input('ITCC_UserID', sql.Int, user.ITCC_UserID);
            request.input('SiteID', sql.Int, data.ITCC_WebsiteID);
            request.input('ITCC_StatusID', sql.Int, 2);
            request.input('CreateDate', sql.DateTime, data.CreateDate);
            request.input('ModifyDate', sql.DateTime, data.ModifyDate);
            request.input('ModifyUserID', sql.Int, data.ModifyUserID);
            request.input('RoleName', sql.NVarChar(), data.RoleName);
            request.input('Author', sql.NVarChar(256), user.FirstName + ' ' + user.LastName);
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);

            let query = ' SELECT @SiteID = ITCC_WebsiteID FROM ITCC_WEBSITE (NOLOCK) WHERE (PrivateKeyID = @PrivateKeyID) ';
            query += ' BEGIN TRAN; ';
            query += ' INSERT INTO ITCC_Comment (Name, Description, Slug, CommentType, Permalink, PostDate, Category, Tags, PostSummary, ';
            query += ' ITCC_UserID, ITCC_WebsiteID, ITCC_StatusID, CreateDate, ModifyDate, ModifyUserID, RoleName, SortOrder, Author )';
            query += '  VALUES (@Name, @Description, @Slug, @CommentType, NEWID(), @PostDate, @Category, @Tags, @PostSummary, ';
            query += ' @ITCC_UserID, @SiteID, @ITCC_StatusID, @CreateDate, @ModifyDate, @ModifyUserID, @RoleName, @SortOrder, @Author )';

            query += ' COMMIT TRANSACTION;';
            query += ' SELECT SCOPE_IDENTITY() NEWID;';

            const authResult = await request.query(query);
            const result = (authResult && authResult.recordset && authResult.recordset.length > 0) ? authResult.recordset[0] : null;

            return result;

        } catch (err) {
            throw err
        }
    },

    /*
        Updates a singLe Comment's information on SQL Server
    */
    updateItem: async (config, privateKeyID, user, data) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;

        try {
            await sql.connect(config);
            const request = new sql.Request();

            request.input('ITCC_CommentID', sql.Int, data.ITCC_CommentID);
            request.input('SiteID', sql.NVarChar(), data.ITCC_WebsiteID);
            request.input('ITCC_StatusID', sql.NVarChar(), 2);
            request.input('ITCC_UserID', sql.Int, user.ITCC_UserID);
            request.input('ITCC_PostID', sql.Int, data.ITCC_PostID);
            request.input('ReplyPostID', sql.Int, data.ReplyPostID);

            request.input('CommentTitle', sql.NVarChar(384), data.CommentTitle || '');
            request.input('CommentDetail', sql.NVarChar(), data.CommentDetail);
            request.input('CommentFullName', sql.NVarChar(128), (data.CommentFullName || ''));

            request.input('SortOrder', sql.Int, (data.SortOrder || 0));
            request.input('ReplyLevel', sql.Int, (data.ReplyLevel || 0));

            request.input('ModifyDate', sql.DateTime, data.ModifyDate);
            request.input('ModifyAccountID', sql.NVarChar(), data.ModifyAccountID);

            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);

            let query = ' ';
            query += ' BEGIN TRAN; ';
            query += ' UPDATE ITCC_Comment SET CommentTitle=@CommentTitle, CommentDetail=@CommentDetail, CommentFullName=@CommentFullName,';
            query += ' ITCC_StatusID=@ITCC_StatusID, ReplyLevel=@ReplyLevel, ReplyPostID=@ReplyPostID, SortOrder = @SortOrder, ';
            query += ' ModifyDate = getDate(), ModifyAccountID=@ModifyAccountID ';
            query += ' WHERE ITCC_CommentID = @ITCC_CommentID; ';
            query += ' COMMIT TRANSACTION;';
            query += ' SELECT @@ROWCOUNT;';

            const authResult = await request.query(query);
            const result = data;

            return result;

        } catch (err) {
            throw err
        }
    },

    /*
        Deletes a singLe non-admin Comment's information on SQL Server  
    */
    deleteItem: async (config, privateKeyID, id) => {

        try {
            await sql.connect(config);

            let query = ' DELETE US ';
            query += ' FROM [ITCC_Comment] US ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( ' +
                ' (US.ITCC_CommentID = @ID) AND (WS.PrivateKeyID = @PrivateKeyID) ' +
                ') ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('ID', sql.Int, id);
            const result = await request.query(query);
            return result;

        } catch (err) {
            throw err
        }
    }
};

module.exports = CommentFunctions;