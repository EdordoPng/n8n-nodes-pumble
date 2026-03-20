import type {
    IDataObject,
    IExecuteFunctions,
    ILoadOptionsFunctions,      
    IHttpRequestMethods,
    IHttpRequestOptions,
    JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const PUMBLE_BASE_URL = 'https://pumble-api-keys.addons.marketplace.cake.com';
const PUMBLE_CREDENTIAL_NAME = 'pumbleApi';

export async function pumbleApiRequest(
    this: IExecuteFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
): Promise<IDataObject> {
    const options: IHttpRequestOptions = {
        method,
        url: `${PUMBLE_BASE_URL}${endpoint}`,
        headers: { 'Content-Type': 'application/json' },
        ...(method !== 'GET' && method !== 'DELETE' ? { body } : {}),
        qs,
        json: true,
    };

    try {
        return await this.helpers.httpRequestWithAuthentication.call(
            this,
            PUMBLE_CREDENTIAL_NAME,
            options,
        );
    } catch (error) {
        throw new NodeApiError(this.getNode(), error as unknown as JsonObject);
    }
}
