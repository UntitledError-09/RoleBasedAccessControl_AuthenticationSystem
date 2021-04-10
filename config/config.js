
module.exports = {
    db_url: `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.${process.env.cluster_id}.mongodb.net/UserDB?retryWrites=true&w=majority`,
    cookie_options: {
        httpOnly: true, sameSite: 'strict', secure: true, path: "/"
    }
}