import { Router } from 'express';

/**
 * Base interface for all controllers.
 * Defines the contract that all controller classes must follow.
 */
export interface IController {
    getRouter(): Router;
}

