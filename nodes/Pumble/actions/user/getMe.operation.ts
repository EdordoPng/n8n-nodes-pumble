import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
} from 'n8n-workflow';

import { pumbleApiRequest } from '../../GenericFunctions';

// getMe takes no parameters — it returns the authenticated user's own profile.
// The description array is empty but must still be exported to satisfy the
// aggregator pattern used by index.ts and Pumble.node.ts.
export const description: INodeProperties[] = [];

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    // No parameters needed — the API identifies the user via the ApiKey header
    const responseData = await pumbleApiRequest.call(
        this, 'GET', '/myInfo', {}, {},
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}
