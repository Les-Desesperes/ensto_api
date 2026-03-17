import { Router } from 'express';

/**
 * Base interface for all route classes.
 * Defines the contract that all route classes must follow.
 */
export interface IRoute {
    getRouter(): Router;
}

