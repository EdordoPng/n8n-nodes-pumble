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
        displayName: 'Channel Name or ID',
        name: 'channelId',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getChannels' },
        required: true,
        displayOptions: {
            show: {
                resource: ['scheduledMessage'],
                operation: ['create'],
            },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },
    {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: { rows: 4 },
        required: true,
        displayOptions: {
            show: {
                resource: ['scheduledMessage'],
                operation: ['create'],
            },
        },
        default: '',
        placeholder: 'Team standup in 10 minutes!',
        description: 'The text content of the scheduled message',
    },
    {
        displayName: 'Scheduled Time',
        name: 'scheduledTime',
        type: 'dateTime',
        required: true,
        displayOptions: {
            show: {
                resource: ['scheduledMessage'],
                operation: ['create'],
            },
        },
        default: '',
        description: 'The date and time when the message should be sent. Must be at least 5 minutes in the future. Times are interpreted using the timezone configured in n8n.',
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['scheduledMessage'],
                operation: ['create'],
            },
        },
        options: [
            {
                displayName: 'Attachments',
                name: 'attachments',
                type: 'json',
                default: '[]',
                description: 'A JSON array of attachment objects to include with the message',
            },
        ],
    },
];


export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const channelId        = this.getNodeParameter('channelId', i, '') as string;
    const text             = this.getNodeParameter('text', i, '') as string;
    const scheduledTime    = this.getNodeParameter('scheduledTime', i, '') as string;
    const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

    if (!channelId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Channel ID cannot be empty.',
            { itemIndex: i },
        );
    }
    if (!text.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Text cannot be empty.',
            { itemIndex: i },
        );
    }
    if (!scheduledTime) {
        throw new NodeOperationError(
            this.getNode(),
            'Scheduled Time cannot be empty.',
            { itemIndex: i },
        );
    }

    const timezone = this.getTimezone();
    const localDate = new Date(
        new Date(scheduledTime).toLocaleString('en-US', { timeZone: timezone })
    );
    const utcDate = new Date(scheduledTime);
    const offsetMs = utcDate.getTime() - localDate.getTime();
    const sendAt = new Date(scheduledTime).getTime() + offsetMs;

    if (isNaN(sendAt)) {
        throw new NodeOperationError(
            this.getNode(),
            'Scheduled Time is not a valid date.',
            { itemIndex: i },
        );
    }


    const body: IDataObject = {
        channelId,
        text,
        sendAt,
    };

    if (additionalFields.attachments !== undefined) {
        let attachments: unknown;
        try {
            attachments =
                typeof additionalFields.attachments === 'string'
                    ? (JSON.parse(additionalFields.attachments) as unknown)
                    : additionalFields.attachments;
        } catch {
            throw new NodeOperationError(
                this.getNode(),
                'Attachments must be a valid JSON array.',
                { itemIndex: i },
            );
        }
        if (!Array.isArray(attachments)) {
            throw new NodeOperationError(
                this.getNode(),
                'Attachments must be a JSON array, not an object or primitive.',
                { itemIndex: i },
            );
        }
        body.attachments = attachments as IDataObject[];
    }

    const responseData = await pumbleApiRequest.call(
        this, 'POST', '/createScheduledMessage', body,
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}
