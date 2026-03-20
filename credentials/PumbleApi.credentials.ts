import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PumbleApi implements ICredentialType {
	name = 'pumbleApi';
	displayName = 'Pumble API';
	icon = 'file:pumble.svg' as const;
	documentationUrl = 'https://pumble.com/help/integrations/automation-workflow-integrations/api-keys-integration/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				ApiKey: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://pumble-api-keys.addons.marketplace.cake.com',
			url: '/myInfo',
			method: 'GET',
		},
	};
}
