import logger from '@/shared/logger';

export interface ExternalDriverPayload {
    status: 'existing';
    licensePlate: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
}

export interface ExternalDisplayPayload {
    vehicle: ExternalDriverPayload;
}

export class IntegrationService {
    public async dispatchToExternalDisplay(payload: ExternalDisplayPayload): Promise<void> {
        // TODO: Replace this placeholder with a real API/webhook call to the external IHM.
        logger.info({ payload }, 'Dispatching existing vehicle data to external display (placeholder)');
    }
}

