
# Annah System Architecture

```mermaid
graph TD
    subgraph Client
        UI[User Interface]
        WS[WebSocket Client]
        RC[React Components]
        QC[Query Client]
    end

    subgraph Server
        API[Express Server]
        WSS[WebSocket Server]
        Auth[Authentication]
        DB[(PostgreSQL)]
    end

    %% Client-side flows
    UI -->|User Input| RC
    RC -->|API Calls| QC
    QC -->|HTTP Requests| API
    WS -->|Real-time Updates| WSS

    %% Server-side flows
    API -->|Validate| Auth
    API -->|CRUD Operations| DB
    WSS -->|Task Notifications| WS
    Auth -->|User Data| DB

    %% Data flows
    DB -->|Tasks & Events| API
    API -->|Response| QC
    QC -->|Data| RC
    RC -->|Render| UI

    %% Feature specific
    Task[Task Management] -->|Create/Update| API
    Calendar[Calendar Events] -->|Create/Update| API
    Notif[Notifications] -->|Push| WSS
```

## Flow Description

1. **Authentication Flow**
   - User credentials → Auth → Database verification
   - JWT session management

2. **Task Management Flow**
   - Create/Update tasks → API → Database
   - Real-time updates via WebSocket

3. **Calendar Flow**
   - Event creation → API → Database
   - Event retrieval and display

4. **Notification Flow**
   - Server monitors tasks
   - WebSocket pushes notifications
   - Browser notifications displayed
