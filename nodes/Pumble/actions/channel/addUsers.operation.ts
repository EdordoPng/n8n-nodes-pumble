import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { pumbleApiRequest } from '../../GenericFunctions';

export const description: INodeProperties[] = [
    {
        displayName: 'Channel Name or ID',           // ← aggiornato per riflettere il dropdown
        name: 'channelId',
        type: 'options',                             // ← era 'string'
        typeOptions: { loadOptionsMethod: 'getChannels' },  // ← aggiunto
        required: true,
        displayOptions: {
            show: {
                resource: ['channel'],
                operation: ['addUsers'],
            },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
        // ← rimossi placeholder e description vecchi, non servono col dropdown
    },
    {
        displayName: 'User Names or IDs',
        name: 'userIds',
        type: 'multiOptions',
        typeOptions: { loadOptionsMethod: 'getUsers' },
        required: true,
        displayOptions: {
            show: {
                resource: ['channel'],
                operation: ['addUsers'],
            },
        },
        default: [],
        description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },
];

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const channelId = this.getNodeParameter('channelId', i, '') as string;
    const userIds   = this.getNodeParameter('userIds', i, []) as string[];

    if (!channelId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Channel ID cannot be empty.',
            { itemIndex: i },
        );
    }

    if (userIds.length === 0) {
        throw new NodeOperationError(
            this.getNode(),
            'At least one valid User ID is required.',
            { itemIndex: i },
        );
    }

    const responseData = await pumbleApiRequest.call(
        this, 'POST', '/addUsersToChannel', { channelId, userIds },
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}
