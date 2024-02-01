'use strict';

import 'mongoose-pagination';
import Follow from '../models/follow';

// METODO PARA GUARDAR EL SEGUIMIENTO A UN USUARIO
async function saveFollow(req: any, res: any) {
  // Capturar los datos(parametros) que vienen en el cuerpo de la petición
  const data = req.body;

  // Crear el objeto del modelo(instancia)
  const follow: any = new Follow();
  // Validar que el usuario que hace la petición de seguir es el mismo que esta logueado
  follow.user = req.user;
  follow.followed = data.followed;

  const followStored = await follow.save();
  if (!followStored) {
    const error = new Error('No se ha podido seguir al usuario');
    return res.status(500).json({ msg: error.message });
  }

  try {
    return res.json({ followStored });
  } catch (error) {
    console.log(error);
  }
}

// METODO PARA DEJAR DE SEGUIR A UN USUARIO
function deleteFollow(req: any, res: any) {
  // Capturar el id del usuario logueado
  let userId = req.user;
  // Recoger el id del usuario a borrar(este viene como parametro por la URL)
  var followId = req.params.id;

  Follow.find({ user: userId, followed: followId }).remove();
  try {
    return res.json({ msg: 'Ha dejado de seguir este usuario!' });
  } catch (error) {
    console.log(error);
  }
}

// METODO PARA LISTAR LOS USUARIOS QUE SIGO
function getFollowingUser(req: any, res: any) {
  // Capturar el id del usuario logueado
  let userId = req.user;
  // Validar si por la URL me pasan algun id entonces usarlo como referencia sustituyento el valor de
  // userId por el id que llego como parametro
  if (req.params.id && req.params.page) {
    userId = req.params.id;
  }

  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }

  let itemsPerPage = 5;

  Follow.find({ user: userId })
    .populate({ path: 'followed' })
    .paginate(
      page,
      itemsPerPage,
      (err: string, follows: any, total: number) => {
        if (err) {
          const error = new Error('Error en el servidor');
          return res.json({ msg: error.message });
        }

        if (!follows) {
          const error = new Error('No estas siguiendo ningun usuario');
          return res.json({ msg: error.message });
        }

        return res.json({
          total: total,
          pages: Math.ceil(total / itemsPerPage),
          follows,
        });
      }
    );
}

// METODO PARA LISTAR LOS USUARIOS QUE ME SIGUEN
function getFollowedUsers(req: any, res: any) {
  // Recoger los parametros de usuario identificado
  let userId = req.user;
  // Validar si por la URL me pasan algun id entonces usarlo como referencia sustituyento el valor de
  // userId por el id que llego como parametro
  if (req.params.id && req.params.page) {
    userId = req.params.id;
  }

  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }

  let itemsPerPage = 5;

  Follow.find({ followed: userId })
    .populate({ path: 'user' })
    .paginate(
      page,
      itemsPerPage,
      (err: string, follows: any, total: number) => {
        if (err) {
          const error = new Error('Error en el servidor');
          return res.json({ msg: error.message });
        }

        if (!follows) {
          const error = new Error('No estas siguiendo ningun usuario');
          return res.json({ msg: error.message });
        }

        return res.status(200).send({
          total: total,
          pages: Math.ceil(total / itemsPerPage),
          follows,
        });
      }
    );
}

// METODO PARA DEVOLVER LISTADO DE USUARIOS SIN PAGINACION
function getMyFollows(req: any, res: any) {
  const userId = req.user;

  let find = Follow.find({ user: userId });

  if (req.params.followed) {
    find = Follow.find({ followed: userId });
  }

  const follows = find.populate('user followed').exec();
  if (!follows) {
    const error = new Error('No hay usuarios para visualizar');
    return res.json({ msg: error.message });
  }

  try {
    return res.json({ follows });
  } catch (error) {
    console.log(error);
  }
}

export default {
  saveFollow,
  deleteFollow,
  getFollowingUser,
  getFollowedUsers,
  getMyFollows,
};
