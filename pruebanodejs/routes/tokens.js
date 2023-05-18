const { jwt, cookieParser, User, http, router } = require('./npm');


async function checkTokenSetUser(req, res, next) {
    const token = req.cookies['auth-token'];

    if (token) {
        try {
            const decoded = jwt.verify(token, 'your_secret_key');
            const user = await User.findById(decoded._id);

            if (user) {
                res.locals.usuario = user.user;
                res.locals.fotoUsuario = user.foto;
            }
        } catch (err) {
            console.error(err);
        }
    }

    next();
}

async function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).send('Access Denied');
    }

    try {
        const verified = jwt.verify(token, 'your_secret_key');
        req.user = verified;

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new Error('User not found');
        }

        res.locals.usuario = user.user;
        res.locals.fotoUsuario = user.foto;

        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}


  
