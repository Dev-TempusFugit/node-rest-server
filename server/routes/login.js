const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const User = require('../models/user');

const app = express();



app.post('/login', (req, res) =>{

    let body = req.body;

    User.findOne({ email: body.email }, (err, userDB)=> {
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if( !userDB ){
            return res.status(500).json({
                ok:false,
                err:{
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

         if( !bcrypt.compareSync( body.password, userDB.password ) ){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
         }

         let token = jwt.sign({
             usuario: userDB
         }, process.env.SEED, {expiresIn: process.env.TOKEN_EXPIRES });

         res.json({
             ok: true,
             usuario: userDB,
             token: token
         });

    })

});

//Configuraciones de Google
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}
// verify().catch(console.error);

app.post('/google', async(req, res) =>{
    let token = req.body.idtoken;
    
    let googleUser = await verify(token)
        .catch(err =>{
            return res.status(403).json({
                ok: false,
                err
            });
        });
    
    User.findOne({email: googleUser.email}, (err, userDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        };

        if( userDB ){
            if(userDB.google === false){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message: 'Debe usar su atenticación normal'
                    }
                });
            }else{
                let token = jwt.sign({
                    usuario: userDB
                }, process.env.SEED, {expiresIn: process.env.TOKEN_EXPIRES });


                return res.json({
                    ok: true,
                    usuario: userDB,
                    token
                });
            }
        }else{
            //Si el usuario no existe en nuestra BD
            let user = new User();

            user.nombre = googleUser.nombre;
            user.email  = googleUser.email;
            user.img    = googleUser.img;
            user.google = googleUser.google;
            user.password = ':)';


            user.save()
                .then(userDB =>{
                    let token = jwt.sign({
                        usuario: userDB
                    }, process.env.SEED, {expiresIn: process.env.TOKEN_EXPIRES });
    
    
                    return res.json({
                        ok: true,
                        usuario: userDB,
                        token
                    });
                })
                .catch(err=>{
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                })

        }
    });
});


















module.exports = app;