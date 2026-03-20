# n8n-nodes-pumble

This is an n8n community node. It lets you use **Pumble** in your n8n workflows.

[Pumble](https://pumble.com) is a free team messaging and collaboration platform that allows teams to communicate via channels, direct messages, threads, and file sharing.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)  

---

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings → Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-pumble` and confirm

---

## Operations

### Scheduled Message
| Operation | Description |
|-----------|-------------|
| Create    | Schedule a message to be sent to a channel at a specific date and time |
| Edit      | Update the text or delivery time of an existing scheduled message |
| Get       | Retrieve a specific scheduled message by ID |
| Get Many  | List all scheduled messages in a channel |
| Delete    | Delete a scheduled message before it is sent |

### User
| Operation        | Description |
|------------------|-------------|
| Get Many         | Retrieve all users in the workspace |
| Get User Groups  | Retrieve all user groups (teams) in the workspace |

---

## Credentials

To authenticate, you need a **Pumble API Key**:

1. Go to your Pumble workspace
2. Navigate to **Apps & Integrations → API Keys**
3. Generate a new API key
4. Copy your **Workspace ID** and **API Key**
5. In n8n, create a new **Pumble API** credential and fill in both fields

> Full guide: [Pumble API Key Integration](https://pumble.com/help/integrations/automation-workflow-integrations/api-keys-integration/)

---

## Compatibility

- **Minimum n8n version:** 2.11.2
- **Tested against:** n8n 2.11.2 (self-hosted)
- **Node.js:** v22+

> ⚠️ The `sendAt` field in the Pumble API expects a **timestamp in milliseconds**, not a Unix timestamp in seconds and not an ISO string. This node handles the conversion automatically, including timezone offset from the n8n server timezone.

---

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Pumble API documentation](https://pumble.com/help/integrations/automation-workflow-integrations/api-keys-integration/)
- [Pumble website](https://pumble.com)

---

## License

[MIT](LICENSE.md)
