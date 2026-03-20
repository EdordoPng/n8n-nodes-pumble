import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { pumbleApiRequest } from '../../GenericFunctions';

export const description: INodeProperties[] = [
    {
        displayName: 'Channel Name or ID',
        name: 'channelId',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getChannels' },
        required: true,
        displayOptions: {
            show: {
                resource: ['channel'],
                operation: ['removeUser'],
            },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },
    {
        displayName: 'User Name or ID',
        name: 'userId',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getUsers' },
        required: true,
        displayOptions: {
            show: {
                resource: ['channel'],
                operation: ['removeUser'],
            },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },

];

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const channelId = this.getNodeParameter('channelId', i, '') as string;
    const userId    = this.getNodeParameter('userId', i, '') as string;

    if (!channelId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Channel ID cannot be empty.',
            { itemIndex: i },
        );
    }
    if (!userId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'User ID cannot be empty.',
            { itemIndex: i },
        );
    }

    const responseData = await pumbleApiRequest.call(
        this, 'POST', '/removeUserFromChannel', { channelId, userId },
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}
