'use strict';

// Librerías
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Configuraciones
import { dbConnection } from "./db-postgresql.js";
import { mongoConnection } from "./db-mongodb.js";
import { seedRoles } from '../helpers/role-seed.js';
import { corsOptions } from "./cors-configuration.js";
import { helmetConfiguration } from "./helmet-configuration.js";

// Servicios
import auth from "../Services/auth/auth.routes.js";
import user from "../Services/user/user.routes.js";

const BASE_PATH = '/OpinionManagement/v1';

/* =========================
    Middlewares Globales
    ========================= */
const middlewares = (app) => {
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));
};

/* =========================
   Definición de Rutas
   ========================= */
const routes = (app) => {
    // Rutas de Servicios
    app.use(`${BASE_PATH}/auth`, auth);

    app.use(`${BASE_PATH}/user`, user);

    // Health Check
    app.get(`${BASE_PATH}/health`, (req, res) => {
        return res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'OpinionManagement Server',
            databases: { postgresql: 'Connected', mongodb: 'Connected' }
        });
    });

    // 404 Handler
    app.use((req, res) => {
        res.status(404).json({ success: false, message: 'Endpoint not found' });
    });
};

/* =========================
   Inicialización del Servidor
   ========================= */
export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3006;

    try {
        console.log('--- STARTING OpinionManagement Server INFRASTRUCTURE ---');

        // Conexiones a DB
        try {
            await dbConnection();
            console.log('PostgreSQL| Connected');
            await mongoConnection();
            console.log('MongoDB| Connected');
        } catch (error) {
            console.error('CRITICAL ERROR:', error.message);
            process.exit(1);
        }

        await dbConnection();
        await mongoConnection();

        if (process.env.NODE_ENV === 'development') {
            await seedRoles();
        }

        middlewares(app);
        routes(app);

        // Encendido
        app.listen(PORT, () => {
            console.log('---------------------------------------------');
            console.log(`Server running on port: ${PORT}`);
            console.log(`Health: http://localhost:${PORT}${BASE_PATH}/health`);
            console.log('---------------------------------------------');
        });

    } catch (error) {
        console.error('CRITICAL ERROR: Server initialization failed:', error.message);
        process.exit(1);
    }
};