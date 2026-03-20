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
        displayName: 'Scheduled Message ID',
        name: 'scheduledMessageId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['scheduledMessage'],
                operation: ['edit'],
            },
        },
        default: '',
        placeholder: 'SCH1234567890',
        description: 'The ID of the scheduled message to edit',
    },
    {
        displayName: 'Channel ID',
        name: 'channelId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['scheduledMessage'],
                operation: ['edit'],
            },
        },
        default: '',
        description: 'The ID of the channel containing the scheduled message',
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
                operation: ['edit'],
            },
        },
        default: '',
        description: 'The new text content to replace the current message',
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
                operation: ['edit'],
            },
        },
        options: [
            {
                displayName: 'Scheduled Time',
                name: 'scheduledTime',
                type: 'dateTime',
                default: '',
                description: 'The new date and time when the message should be sent',
            },
        ],
    },
];

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const scheduledMessageId = this.getNodeParameter(
        'scheduledMessageId', i, '',
    ) as string;

    const channelId = this.getNodeParameter(
        'channelId', i, '',
    ) as string;

    const text = this.getNodeParameter(
        'text', i, '',
    ) as string;

    const additionalFields = this.getNodeParameter(
        'additionalFields', i, {},
    ) as IDataObject;

    if (!scheduledMessageId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Scheduled Message ID cannot be empty.',
            { itemIndex: i },
        );
    }

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

    const body: IDataObject = {
        scheduledMessageId,
        channelId: channelId.trim(),
        text: text.trim(),
    };

    if (additionalFields.scheduledTime) {
        const timezone = this.getTimezone();
        const rawTime = additionalFields.scheduledTime as string;

        const localDate = new Date(
            new Date(rawTime).toLocaleString('en-US', { timeZone: timezone }),
        );
        const utcDate = new Date(rawTime);
        const offsetMs = utcDate.getTime() - localDate.getTime();
        const sendAt = new Date(rawTime).getTime() + offsetMs;

        if (isNaN(sendAt)) {
            throw new NodeOperationError(
                this.getNode(),
                'Scheduled Time is not a valid date.',
                { itemIndex: i },
            );
        }

        body.sendAt = sendAt; // millisecondi, con offset timezone corretto
    }

    const responseData = await pumbleApiRequest.call(
        this, 'POST', '/editScheduledMessage', body,
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}
