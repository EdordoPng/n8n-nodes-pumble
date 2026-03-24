# n8n-nodes-pumble-integration


[![npm version](https://img.shields.io/npm/v/n8n-nodes-pumble-integration?color=cb3837&logo=npm&label=npm)](https://www.npmjs.com/package/n8n-nodes-pumble-integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![CI](https://github.com/EdordoPng/n8n-nodes-pumble/actions/workflows/ci.yml/badge.svg)](https://github.com/EdordoPng/n8n-nodes-pumble/actions/workflows/ci.yml)
[![n8n compatibility](https://img.shields.io/badge/n8n-%3E%3D2.11.2-FF6B6B?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIzIiBmaWxsPSIjRkY2QjZCIi8+PC9zdmc+)](https://docs.n8n.io/integrations/community-nodes/)


**n8n-nodes-pumble-integration** is a community node that integrates [Pumble](https://pumble.com) — a free team messaging and collaboration platform — directly into your [n8n](https://n8n.io/) workflows.


With this node you can automate your entire Pumble workspace: send and schedule messages to channels, manage threads and direct messages, create and configure channels, and query workspace users and groups — all without leaving n8n.


**Typical use cases:**


- 🔔 Send real-time notifications to a team channel when a monitored event fires (new form submission, error alert, CI build result)
- 🕐 Schedule recurring digest messages or reminders to be delivered at a precise time
- 💬 Reply inside message threads to keep conversations contextual and organized
- 📢 Create new channels on the fly and add the right users programmatically
- 📩 Send direct messages or group DMs to individuals or custom user groups
- 🔍 Search and retrieve messages to feed downstream workflow steps


---


## Table of Contents


- [Installation](#installation)
- [Operations](#operations)
  - [Scheduled Message](#scheduled-message)
  - [Message](#message)
  - [Channel](#channel)
  - [Direct Message](#direct-message)
  - [User](#user)
- [Credentials](#credentials)
- [Sending as a Bot](#sending-as-a-bot)
- [Compatibility](#compatibility)
- [Contributing](#contributing)
- [Version History](#version-history)
- [License](#license)


---


## Installation


Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.


1. Go to **Settings → Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-pumble-integration` and confirm


The node will be available in your workflow editor under the **Pumble** category.


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


### Message


| Operation          | Description | Send as Bot |
|--------------------|-------------|:-----------:|
| Send               | Post a new message to a channel | ✅ |
| Edit               | Update the text of an existing message | — |
| Delete             | Remove a message from a channel | — |
| Get                | Retrieve a specific message by ID | — |
| Get Many           | List messages in a channel | — |
| Send Reply         | Reply to an existing message inside its thread | ✅ |
| Get Thread Replies | Retrieve all replies in a message thread | — |
| Search             | Search for messages in the workspace by keyword | — |


### Channel


| Operation   | Description |
|-------------|-------------|
| Create      | Create a new channel in the workspace |
| Get         | Retrieve details of a specific channel by ID |
| Get Many    | List all channels in the workspace |
| Add Users   | Add one or more members to an existing channel |
| Remove User | Remove a member from a channel |


### Direct Message


| Operation     | Description |
|---------------|-------------|
| Send          | Send a direct message to a single user |
| Send to Group | Send a message to a group of users via a group DM |


### User


| Operation       | Description |
|-----------------|-------------|
| Get Many        | Retrieve all users in the workspace |
| Get Me          | Retrieve the profile of the authenticated user |
| Get User Groups | Retrieve all user groups (teams) in the workspace |


---


## Credentials


To authenticate with Pumble you need an **API Key** tied to your workspace:


1. Go to your Pumble workspace
2. Navigate to **Apps & Integrations → API Keys**
3. Generate a new API key
4. Copy your **Workspace ID** and **API Key**
5. In n8n, add a new credential of type **Pumble API** and fill in both fields


> 📖 Full guide: [Pumble API Key Integration](https://pumble.com/help/integrations/automation-workflow-integrations/api-keys-integration/)


---


## Sending as a Bot


The **Message → Send** and **Message → Send Reply** operations include a **Send As Bot** toggle.

When enabled, the message is posted under the workspace's **Addon Bot** identity (displayed as `API` with an `APP` badge in Pumble) instead of the personal account that owns the API Key. This keeps automation messages visually separated from human conversation.

| `Send As Bot` | Message appears as |
|:---:|---|
| `false` (default) | The user who owns the API Key |
| `true` | The workspace Addon Bot (`API [APP]`) |

**How it works under the hood:** each API Key in Pumble is linked to a single Addon Bot identity that is created automatically when the key is generated — no manual bot setup is required.

> ⚠️ **Limitations:**
> - The Addon Bot **cannot post to private channels** — the API will return a `403` error.
> - Bot identity customization (custom name, avatar) is **not supported** by the Pumble API Addon.
> - Direct Messages (`dmUser`, `dmGroup`) do **not** support the `asBot` parameter.


---


## Compatibility


| Property            | Value |
|---------------------|-------|
| Minimum n8n version | `2.11.2` |
| Tested against      | n8n `2.11.2` (self-hosted) |
| Node.js             | `v22+` |
| Package manager     | `pnpm` |
| Language            | TypeScript |


> ⚠️ **Important — `sendAt` field:** The Pumble API expects scheduled message timestamps in **milliseconds** (e.g. `1714000000000`), not Unix seconds and not ISO 8601 strings. This node handles the conversion automatically, applying the timezone offset from the n8n server's configured timezone. No manual conversion is required on your end.


---


## Contributing


Contributions, bug reports and feature requests are welcome!


### Development setup


**Prerequisites:** Node.js v22+, pnpm


```bash
# 1. Clone the repository
git clone https://github.com/EdordoPng/n8n-nodes-pumble.git
cd n8n-nodes-pumble

# 2. Install dependencies
pnpm install

# 3. Build the node
pnpm build

# 4. (Optional) Watch mode for development
pnpm dev


```

### Submitting a pull request

1. Fork the repository and create a new branch: `git checkout -b feat/your-feature`
2. Make your changes and ensure the build passes: `pnpm build`
3. Commit with a clear message following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push your branch and open a Pull Request against `main`
5. Describe what the PR changes and why — screenshots or workflow examples are appreciated

---

## Version History

### v0.1.2 — Send As Bot

Added **"Send As Bot"** toggle to 
  
  → Send a Message 
  → Send a Reply to a Message  

When enabled, messages are posted under the workspace Addon Bot identity instead of the authenticated user

### v0.1.0 — Initial release

First public release of `n8n-nodes-pumble-integration`.

**Resources implemented:**

- **Scheduled Message** — Create, Edit, Get, Get Many, Delete
- **Message** — Send, Edit, Delete, Get, Get Many, Send Reply, Get Thread Replies, Search
- **Channel** — Create, Get, Get Many, Add Users, Remove User
- **Direct Message** — Send, Send to Group
- **User** — Get Many, Get Me, Get User Groups

---

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Pumble API documentation](https://pumble.com/help/integrations/automation-workflow-integrations/api-keys-integration/)
- [Pumble website](https://pumble.com)

---

## License

[MIT](LICENSE.md)
