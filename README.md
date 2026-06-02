# hub-salesforce

API intermediaria para centralizar integracoes externas usadas pelo Salesforce.

A primeira funcionalidade consulta a API publica ViaCEP a partir de um CEP, normaliza o retorno e registra a chamada em um banco PostgreSQL.

## Pre-requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL local

## Instalacao

```bash
npm install
```

## Criacao da database

Conecte no PostgreSQL com um usuario administrativo e crie a database da aplicacao:

```sql
CREATE DATABASE hub_salesforce;
```

Nao use a database padrao `postgres` para as tabelas da aplicacao.

## Configuracao do ambiente

Copie o arquivo de exemplo:

```bash
copy .env.example .env
```

Configure o `.env`:

```env
PORT=3000

VIACEP_BASE_URL=https://viacep.com.br/ws

DATABASE_URL=
DB_SSL=false

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=hub_salesforce

SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_USERNAME=
SALESFORCE_PASSWORD=
SALESFORCE_SECURITY_TOKEN=
SALESFORCE_LOGIN_URL=https://login.salesforce.com

HUB_OAUTH_CLIENT_ID=salesforce-client
HUB_OAUTH_CLIENT_SECRET=change-this-secret
HUB_JWT_SECRET=change-this-jwt-secret
HUB_ACCESS_TOKEN_EXPIRES_IN=3600
```

Para usar banco em nuvem, como Neon, preencha `DATABASE_URL` e deixe `DB_SSL=true`:

```env
DATABASE_URL=postgresql://usuario:senha@host/database?sslmode=require&uselibpqcompat=true
DB_SSL=true
```

Quando `DATABASE_URL` estiver definida, ela tem prioridade sobre `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` e `DB_DATABASE`.

## Migrations

O TypeORM esta configurado com `synchronize: false`. Portanto, crie a database e rode a migration inicial:

```bash
npm run migration:run
```

Para gerar novas migrations depois de alterar entidades:

```bash
npm run migration:generate -- src/database/migrations/NomeDaMigration
```

Para desfazer a ultima migration:

```bash
npm run migration:revert
```

## Rodando o projeto

```bash
npm run start:dev
```

A API ficara disponivel em:

```http
http://localhost:3000/api
```

## Endpoint de CEP

As rotas da API sao protegidas por Bearer Token. Primeiro gere um token:

```http
POST http://localhost:3000/api/auth/token
Content-Type: application/json
```

Body:

```json
{
  "grant_type": "client_credentials",
  "client_id": "salesforce-client",
  "client_secret": "change-this-secret"
}
```

Resposta:

```json
{
  "success": true,
  "message": "Token gerado com sucesso.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

Depois use o token no header `Authorization`:

```http
GET http://localhost:3000/api/cep/01001000
Authorization: Bearer {access_token}
```

Exemplo de resposta:

```json
{
  "success": true,
  "message": "Endereco encontrado com sucesso.",
  "data": {
    "cep": "01001000",
    "street": "Praça da Sé",
    "complement": "lado ímpar",
    "neighborhood": "Sé",
    "city": "São Paulo",
    "state": "SP",
    "stateName": "São Paulo",
    "region": "Sudeste",
    "ibge": "3550308",
    "gia": "1004",
    "ddd": "11",
    "siafi": "7107"
  }
}
```

Erros seguem o formato:

```json
{
  "success": false,
  "message": "Mensagem clara do erro.",
  "error": "BAD_REQUEST"
}
```

## Estrutura de pastas

```text
src/
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── response.interceptor.ts
│   └── interfaces/
│       └── api-response.interface.ts
│
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   └── typeorm.config.ts
│
├── integrations/
│   └── viacep/
│       ├── interfaces/
│       │   └── viacep-response.interface.ts
│       └── viacep.client.ts
│
├── modules/
│   ├── cep/
│   │   ├── dto/
│   │   │   └── find-address.dto.ts
│   │   ├── cep.controller.ts
│   │   ├── cep.service.ts
│   │   └── cep.module.ts
│   │
│   ├── integration-log/
│   │   ├── entities/
│   │   │   └── integration-log.entity.ts
│   │   ├── integration-log.service.ts
│   │   └── integration-log.module.ts
│   │
│   └── auth/
│       ├── salesforce-auth.service.ts
│       └── auth.module.ts
│
├── database/
│   └── migrations/
│       └── 1710000000000-CreateIntegrationLogsTable.ts
│
├── app.module.ts
└── main.ts
```

## Observacoes de arquitetura

- O prefixo global da API e `/api`.
- O endpoint `/api/auth/token` e publico para emissao de token.
- Todas as demais rotas atuais e futuras exigem `Authorization: Bearer {token}` por padrao.
- O fluxo atual usa OAuth 2.0 Client Credentials para chamadas sistema-sistema, adequado para o Salesforce consumir o hub.
- As configuracoes sensiveis ficam em variaveis de ambiente.
- A URL do ViaCEP vem de `VIACEP_BASE_URL`.
- As entidades ficam organizadas por modulo.
- O log de integracao e persistido na tabela `integration_logs`.
- O modulo `auth` ja deixa preparados os metodos futuros de OAuth 2.0 com Salesforce.
