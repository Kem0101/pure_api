'use strict';

import path from 'path';
import fs from 'fs';
import 'mongoose-pagination';

import Publication from '../models/publication';
import User from '../models/user';
import Follow from '../models/follow';

// METODO PARA GUARDAR UNA PUBLICACION
async function savePublication(req: any, res: any) {
  const { text, file } = req.body;

  if (!text && !file) {
    const error = new Error('La publicación no puede estar vacía');
    return res.json({ msg: error.message });
  }

  try {
    const publication: any = new Publication(req.body);
    publication.user = req.user;
    const publicationSaved = await publication.save();
    res.json(publicationSaved);
  } catch (error) {
    console.log(error);
  }
}

// METODO PUBLICACIONES TIMELINE (sacar todas las publicaciones)
// REVISAR ESTE METODO
function getPublications(req: any, res: any) {
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  let itemsPerPage = 5;
  let total: number;

  Follow.find({ user: req.user })
    .populate('followed')
    .exec((err: string, follows: any) => {
      if (err) {
        const error = new Error('Error al devolver seguimiento');
        return res.status(500).json({ msg: error.message });
      }

      let follows_clean = <any>[];

      follows.forEach((follow: any) => {
        follows_clean.push(follow.followed);
      });

      Publication.find({ user: { $in: follows_clean } })
        .sort('-creacted_at')
        .populate('user')
        .paginate(
          page,
          itemsPerPage,
          (err: string, publications: any, total: number) => {
            if (err) {
              const error = new Error('Error al devolver publicaciones');
              return res.status(500).json({ msg: error.message });
            }

            if (!publications) {
              const error = new Error('No hay publicaciones');
              return res.status(204).json({ msg: error.message });
            }

            // Eliminar la propiedad user.password de cada publicación
            publications = publications.map((publication: any) => {
              const {
                password,
                confirmed,
                email,
                fullname,
                role,
                token,
                __v,
                ...newUser
              } = publication.user.toObject();
              return { ...publication.toObject(), user: newUser };
            });

            return res.status(200).send({
              total_items: total,
              pages: Math.ceil(total / itemsPerPage),
              page: page,
              publications,
            });
          }
        );
    });
}

// // METODO PARA DEVOLVER UNA PUBLICACION EN CONCRETO
function getPublication(req: any, res: any) {
  let publicationId = req.params.id;

  const publication = Publication.findById(publicationId);
  if (!publication) return res.json({ msg: 'No existe la publicación' });

  return res.json({ publication });
}

// METODO PARA ELIMINAR UNA PUBLICACION
function deletePublication(req: any, res: any) {
  let publicationId = req.params.id;

  const publicationRemoved = Publication.find({
    user: req.user.sub,
    _id: publicationId,
  }).remove();
  if (!publicationRemoved) {
    const error = new Error('No se ha borrado la publicación');
    return res.json({ msg: error.message });
  }

  try {
    return res.json({ msg: 'Publicación borrada correctamente' });
  } catch (error) {
    console.log(error);
  }
}

function uploadImagePub(req: any, res: any) {
  // Capturar el id que viene por la url, del usuario que esta haciendo la petición
  let publicationId = req.params.id;

  if (req.files) {
    let filePath = req.files.image.path;
    let fileSplit = filePath.split('/');
    let fileName = fileSplit[2];
    let extSplit = fileName.split('.');
    let fileExt = extSplit[1];

    if (
      fileExt == 'png' ||
      fileExt == 'jpg' ||
      fileExt == 'jpeg' ||
      fileExt == 'gif'
    ) {
      const publication = Publication.findOne({
        user: req.user.sub,
        _id: publicationId,
      }).exec();
      if (publication) {
        // Actualizar documentos de la publicación
        const publicationUpdated = Publication.findByIdAndUpdate(
          publicationId,
          { file: fileName },
          { new: true }
        );
        if (!publicationUpdated) {
          const error = new Error('No se ha podido actualizar el usuario');
          return res.json({ msg: error.message });
        }

        try {
          return res.json({ publicationUpdated });
        } catch (error) {
          console.log(error);
        }
      } else {
        return removeFilesOFUploadsPub(
          res,
          filePath,
          'No tiene permiso para actualizar esta publicación'
        );
      }
    } else {
      return removeFilesOFUploadsPub(res, filePath, 'Extensión no valida');
    }
  } else {
    const error = new Error('No se han subido la imagen');
    return res.json({ msg: error.message });
  }
}

function removeFilesOFUploadsPub(res: any, filePath: any, message: string) {
  fs.unlink(filePath, (err: any) => {
    return res.json({ msg: message });
  });
}

// METODO PARA DEVOLVER UNA IMAGEN
// PROBAR ESTE METODO LUEGO DE CORREGIR EL METODO UploadImage
function getImageFilePub(req: any, res: any) {
  let imageFile = req.params.imageFile;
  let pathFile = './uploads/publications' + imageFile;

  fs.exists(pathFile, (exists: any) => {
    if (exists) {
      res.sendFile(path.resolve(pathFile));
    } else {
      const error = new Error('No existe la imagen...');
      res.json({ msg: error.message });
    }
  });
}

export default {
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImagePub,
  getImageFilePub,
};
