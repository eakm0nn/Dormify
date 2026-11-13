const validateDatabaseUrl = value => {
    let url;
    try { url = new URL(value); } catch {
        throw new Error('DATABASE_URL must be a valid MySQL URL. Run npm run setup.');
    }
    if (url.protocol !== 'mysql:' || url.pathname !== '/dormify' || !url.hostname || !url.username || !url.password) {
        throw new Error('DATABASE_URL must connect to the dormify MySQL database with an application account.');
    }
    return url;
};

module.exports = { validateDatabaseUrl };
