import { Router } from 'express';
import {
  createPublication,
  getPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
  getMyPublications,
} from './publication.controller.js';
import {
  createPublicationValidator,
  updatePublicationValidator,
  mongoIdValidator,
} from './publication.validator.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { handleValidationErrors } from '../../middlewares/validation.js';

const router = Router();

/* ============================================================
   RUTAS PROTEGIDAS ESPECÍFICAS (Prioridad Máxima)
   ============================================================ */

router.get('/my', validateJWT, getMyPublications);

router.post(
  '/',
  validateJWT,
  createPublicationValidator,
  handleValidationErrors,
  createPublication
);

/* ============================================================
   RUTAS GENERALES Y CON PARÁMETROS
   ============================================================ */

router.get('/', getPublications);

router.get(
  '/:id',
  mongoIdValidator,
  handleValidationErrors,
  getPublicationById
);

router.put(
  '/:id',
  validateJWT,
  updatePublicationValidator,
  handleValidationErrors,
  updatePublication
);

router.delete(
  '/:id',
  validateJWT,
  mongoIdValidator,
  handleValidationErrors,
  deletePublication
);

export default router;