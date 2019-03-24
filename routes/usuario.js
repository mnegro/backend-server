var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var Usuario = require('../models/usuario');

//============================================================
// OBTENER TODOS LOS USUARIOS
//============================================================
app.get('/', (req, res, next) => {

    Usuario.find({},'nombre email img role')
    .exec(
                (err, usuarios)=>{

                if(err){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuario',
                        errors: err
                    });
                }


            res.status(200).json({
                ok: true,
            usuarios: usuarios
            });
            })

}); 


//============================================================
// ACTUALIZAR UN USUARIO   
//============================================================

app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                errors: err
            });
        }

        if( !usuario ){

            res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: {message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {

            if(err){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Usuario',
                    errors: err
                });
             }

             usuarioGuardado.password = ':)'
             res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

    } )

})
});


//============================================================
// CREAR UN NUEVO USUARIO   
//============================================================
app.post('/', mdAutenticacion.verificarToken ,(req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10 ),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado) =>{

        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Usuario',
                errors: err
            });
        }


    res.status(201).json({
        ok: true,
        usuario: usuarioGuardado,
        usuarioToken: req.usuario
    });
    })

});


//============================================================
// ELIMINAR UN NUEVO USUARIO   
//============================================================
app.delete('/:id',mdAutenticacion.verificarToken, (req,res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, ( err, usuarioBorrado ) =>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar usuario',
                errors: err
            });
         }

         if(!usuarioBorrado){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: {message: 'No existe usuario con ese id'}
            });
         }

         res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    } )
});

module.exports = app;