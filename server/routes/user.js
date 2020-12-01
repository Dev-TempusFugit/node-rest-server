const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const User = require('../models/user');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const { json } = require('body-parser');
const app = express();

app.get('/usuario', verificaToken,(req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let perPage = req.query.perPage || 5;
    perPage = Number(perPage);

    User.find({estado: true},'nombre email role estado google img')
        .skip(desde)
        .limit(perPage)
        .exec((err, users) =>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            User.countDocuments({estado: true}, (err, count) =>{
                return res.json({
                    ok:true,
                    usuarios: users,
                    cantidad: count
                })

            })
        })


});
  
app.post('/usuario',[verificaToken, verificaAdminRole],(req, res) =>{
    let body = req.body;

    let user = new User({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    
    user.save()
        .then(userDB =>{
            return res.json({
                ok:true,
                usuario: userDB
            })
        })
        .catch(err =>{
            return res.status(400).json({
                ok: false,
                err
            })
        })

});

app.put('/usuario/:id', [verificaToken, verificaAdminRole],(req, res) =>{
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    console.log(body);
    User.findByIdAndUpdate(id, body, {useFindAndModify: true, new: true, runValidators:true},(err, userDB) =>{
        if(err){
            return res.status(400).json({
                ok: false,
            })
        }

        res.json({
            ok: true,
            usuario: userDB
        });   
    });
    

});
  
app.delete('/usuario/:id',[verificaToken, verificaAdminRole],(req, res) =>{
    
    req.usuario;
    let id = req.params.id;
    //let body = _.pick(req.body, ['nombre', 'email','img','role','estado']);
    // body.role = false;
    let changedState = {
        estado: false
    }

     User.findByIdAndUpdate(id, changedState, {useFindAndModify:false, new:true})
        .then(deletedUser =>{

            return res.json({
                ok: true,
                usuario:deletedUser
            });
        })
        
        .catch(err =>{
            return res.status(400).json({
                ok: false,
                err
            });
        })


    // Añadir comprobar si el usuario tiene estado false? 
    //User.findByIdAndRemove(id, {userFindAndModify:false}, (err, deletedUser) =>{
    // User.findByIdAndUpdate(id, {userFindAndModify:false, new:true}, (err, deletedUser) =>{
    //     if(err){
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         })
    //     }
    //     if(!deletedUser){
    //         return res.status(400).json({
    //             ok: false,
    //             err:{
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }
    //     res.json({
    //         ok: true,
    //         usuarioBorrado: deletedUser
    //     });

    });

  

module.exports = app;