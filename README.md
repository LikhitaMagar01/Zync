It is a messaging application dedicated for instant chating, scheduled messages and group chats with a user-friendly interface.

# development
1. pnpm install
2. pnpm run dev / pnpm run dev --host

# production
1. pnpm run build
2. pnpm run preview

# security flow diagram
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Client    │    │   Server     │    │  Database   │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Login Request  │                   │
       ├──────────────────►│                   │
       │                   │ 2. Validate       │
       │                   │    Credentials    │
       │                   ├──────────────────►│
       │                   │ 3. User Found    │
       │                   │◄──────────────────┤
       │                   │ 4. Generate       │
       │                   │    Tokens         │
       │                   │ 5. Store Refresh  │
       │                   │    Token ID       │
       │                   ├──────────────────►│
       │ 6. Set Cookies    │                   │
       │◄──────────────────┤                   │
       │                   │                   │
       │ 7. API Request    │                   │
       │    (with cookies) │                   │
       ├──────────────────►│                   │
       │                   │ 8. Verify Token   │
       │                   │ 9. Allow Access   │
       │ 10. Response      │                   │
       │◄──────────────────┤                   │