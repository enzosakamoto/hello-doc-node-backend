# hello-doc-node-backend

API em Node.js que replica a antiga API FastAPI para baixar vídeos do YouTube.

Rotas:
- GET `/` -> mensagem de boas-vindas
- GET `/videoInfo?url=<video_url>` -> informações (title, author, embed, thumbnail)
- GET `/download?url=<video_url>` -> baixa o vídeo como attachment

## Desenvolvimento

Requisitos: Node 18+ e pnpm.

Instalação:
```
pnpm install
```

Rodar em desenvolvimento:
```
pnpm dev
```

Build e produção:
```
pnpm build
pnpm start
```
