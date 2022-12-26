
const sql = require("mssql");

const BlogFunctions = {

    /*
            SELECT a paged list of Blogs & associated roles from SQL Server
    */
    getItems: async (config, privateKeyID, offset, pageSize) => {
        try {
            await sql.connect(config);

            let query = ' SELECT DISTINCT US.* ';
            query += ' FROM [ITCC_Blog] US ';
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
            //console.log({getBlogs: err});
            throw err
        }
    },

    /*
        SELECTS a singLe Blog from SQL Server
    */
    getItem: async (config, privateKeyID, id) => {

        try {
            await sql.connect(config);
            let query = ' SELECT DISTINCT US.* ';
            query += ' FROM [ITCC_Blog] US ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( ' +
                ' (US.ITCC_BlogID = @ID) AND (WS.PrivateKeyID = @PrivateKeyID) ' +
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
    SELECTS a singLe Blog By Slug from SQL Server
*/
    getItemBySlug: async (config, privateKeyID, slug) => {

        try {
            await sql.connect(config);
            let query = ' SELECT DISTINCT US.* ';
            query += ' FROM [ITCC_Blog] US ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( ' +
                ' (US.Slug = @Slug) AND (WS.PrivateKeyID = @PrivateKeyID) ' +
                ') ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('Slug', sql.NVarChar(256), (slug || ''));
            const blogResult = await request.query(query);
            const result = (blogResult.recordset && blogResult.recordset.length > 0)
                            ? blogResult.recordset[0] : null;
            return result;

        } catch (err) {
            throw err
        }
    },


    /*
    Creates a singLe Blog & associated roles in SQL Server
*/
    createItem: async (config, privateKeyID, user, data) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;

        try {
            await sql.connect(config);
            const request = new sql.Request();
            request.input('Name', sql.NVarChar(125), data.Name);
            request.input('Description', sql.NVarChar(), data.Description);
            request.input('Slug', sql.NVarChar(256), (data.Slug || ''));
            request.input('BlogType', sql.NVarChar(), (data.BlogType || ''));
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
            request.input('RoleName', sql.NVarChar(), data.RoleName);
            request.input('Author', sql.NVarChar(256), user.FirstName + ' ' + user.LastName);
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);

            let query = ' SELECT @SiteID = ITCC_WebsiteID FROM ITCC_WEBSITE (NOLOCK) WHERE (PrivateKeyID = @PrivateKeyID) ';
            query += ' BEGIN TRAN; ';
            query += ' INSERT INTO ITCC_BLOG (Name, Description, Slug, BlogType, Permalink, PostDate, Category, Tags, PostSummary, ';
            query += ' ITCC_UserID, ITCC_WebsiteID, ITCC_StatusID, CreateDate, ModifyDate, CreateUserID, ModifyUserID, RoleName, SortOrder, Author )';
            query += '  VALUES (@Name, @Description, @Slug, @BlogType, NEWID(), @PostDate, @Category, @Tags, @PostSummary, ';
            query += ' @ITCC_UserID, @SiteID, @ITCC_StatusID, @CreateDate, @ModifyDate, @ITCC_UserID, @ITCC_UserID, @RoleName, @SortOrder, @Author )';

            query += ' COMMIT TRANSACTION;';
            query += ' SELECT SCOPE_IDENTITY() NEWID;';

            const authResult = await request.query(query);
            const result = (authResult && authResult.recordset && authResult.recordset.length > 0) ? authResult.recordset[0] : null;

            return result;

        } catch (err) {
            console.log({CreateBlog_Error: err});
            return null;
        }
    },

    /*
        Updates a singLe Blog's information on SQL Server
    */
    updateItem: async (config, privateKeyID, user, data) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;

        try {
            await sql.connect(config);
            const request = new sql.Request();
            request.input('Name', sql.NVarChar(125), data.Name);
            request.input('Description', sql.NVarChar(), data.Description);
            request.input('Slug', sql.NVarChar(256), (data.Slug || ''));
            request.input('BlogType', sql.NVarChar(), (data.BlogType || ''));
            request.input('PostDate', sql.DateTime2, data.PostDate);
            request.input('SortOrder', sql.Int, (data.SortOrder || 0));
            request.input('Category', sql.NVarChar(), (data.Category || ''));
            request.input('Tags', sql.NVarChar(), (data.Tags || ''));
            request.input('PostSummary', sql.NVarChar(), (data.PostSummary || {}));
            request.input('ITCC_BlogID', sql.Int, data.ITCC_BlogID);
            request.input('ITCC_UserID', sql.Int, user.ITCC_UserID);
            request.input('SiteID', sql.NVarChar(), data.ITCC_WebsiteID);
            request.input('ITCC_StatusID', sql.NVarChar(), 2);
            request.input('CreateDate', sql.DateTime, data.CreateDate);
            request.input('ModifyDate', sql.DateTime, data.ModifyDate);
            request.input('ModifyUserID', sql.NVarChar(), data.ModifyUserID);
            request.input('RoleName', sql.NVarChar(), data.RoleName);
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);

            let query = ' ';
            query += ' BEGIN TRAN; ';
            query += ' UPDATE ITCC_BLOG SET Name=@Name, Description=@Description, Slug=@Slug, BlogType=@BlogType, ';
            query += ' PostDate = @PostDate, Category=@Category, Tags=@Tags, ITCC_StatusID=@ITCC_StatusID, ModifyDate = @ModifyDate, SortOrder = @SortOrder ';
            query += ' WHERE ITCC_BlogID = @ITCC_BlogID; ';
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
        Deletes a singLe non-admin Blog's information on SQL Server  
    */
    deleteItem: async (config, privateKeyID, id) => {

        try {
            await sql.connect(config);

            let query = ' DELETE US ';
            query += ' FROM [ITCC_Blog] US ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( ' +
                ' (US.ITCC_BlogID = @ID) AND (WS.PrivateKeyID = @PrivateKeyID) ' +
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

module.exports = BlogFunctions;