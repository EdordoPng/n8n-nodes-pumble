import type {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { pumbleApiRequest } from '../../GenericFunctions';

export const description: INodeProperties[] = [
    {
        displayName: 'Channel Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
            show: { resource: ['channel'], operation: ['create'] },
        },
        default: '',
        placeholder: 'project-alpha',
        description: 'The name for the new channel. Must be lowercase with no spaces.',
    },
    {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        required: true,
        displayOptions: {
            show: { resource: ['channel'], operation: ['create'] },
        },
        options: [
            { name: 'Public', value: 'PUBLIC' },
            { name: 'Private', value: 'PRIVATE' },
        ],
        default: 'PUBLIC',
        description: 'Whether the channel is open to everyone or invite-only',
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: { resource: ['channel'], operation: ['create'] },
        },
        options: [
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                description: 'An optional description for the new channel',
            },
        ],
    },
];

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const name = this.getNodeParameter('name', i, '') as string;
    const type = this.getNodeParameter('type', i, 'PUBLIC') as string;
    const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

    const sanitized = name.trim();

    if (!sanitized) {
        throw new NodeOperationError(this.getNode(), 'Channel Name cannot be empty.', { itemIndex: i });
    }

    if (sanitized !== sanitized.toLowerCase()) {
        throw new NodeOperationError(
            this.getNode(),
            `Channel name "${sanitized}" contains uppercase letters. Use only lowercase (e.g. "${sanitized.toLowerCase()}").`,
            { itemIndex: i },
        );
    }

    if (sanitized.includes(' ')) {
        throw new NodeOperationError(
            this.getNode(),
            `Channel name "${sanitized}" contains spaces. Use hyphens instead (e.g. "${sanitized.replace(/\s+/g, '-')}").`,
            { itemIndex: i },
        );
    }

    const body: IDataObject = {
        name: sanitized,
        type,                    // ← sempre presente, sempre PUBLIC o PRIVATE
    };

    if (additionalFields.description) {
        body.description = additionalFields.description as string;
    }

    const responseData = await pumbleApiRequest.call(this, 'POST', '/createChannel', body);

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}
