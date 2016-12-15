module.exports = {
    //Secret key for jwt signing and encryption
    'secret': 'super secret passphrase',
    'database': 'mongodb://localhost:27017/sass-tutorial',
    'port': process.env.PORT || 3000
}