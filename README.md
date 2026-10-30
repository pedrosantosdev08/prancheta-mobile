# Prancheta FC

App mobile para treinadora de futebol: biblioteca de exercícios com fotos e vídeos, treino do dia, elenco e prancheta tática.
Stack: Expo (SDK 58) + Expo Router + TypeScript + Firebase (Auth, Firestore, Storage) + Zustand.

## Rodar (3 passos)

1. Instalar as dependências (uma vez, ~1 min; as versões já estão travadas no `package-lock.json`):
   ```bash
   npm install
   ```
2. Configurar o Firebase:
   - Crie um projeto em console.firebase.google.com e adicione um app **Web**.
   - Ative **Authentication** (e-mail/senha), **Firestore** e **Storage**.
   - Copie `.env.example` para `.env` e preencha com as chaves do app Web.
   - Cole `firestore.rules` e `storage.rules` na aba **Regras** de cada serviço e publique.
3. Iniciar:
   ```bash
   npx expo start
   ```
   Escaneie o QR code com o app **Expo Go** (use a versão do Expo Go compatível com o SDK 58).

## Estrutura
```
app/                 telas (Expo Router)
  login.tsx
  (tabs)/            Treinos, Exercícios, Prancheta, Elenco
  exercicio/         novo e detalhe
src/
  lib/firebase.ts    inicialização do Firebase
  lib/exercicios.ts  todo o acesso a dados (Firestore e Storage)
  store/auth.ts      estado de login (Zustand)
```

## Status
- Pronto: login, biblioteca de exercícios em tempo real, novo exercício com fotos e vídeos, detalhe com player.
- Próximos: treino do dia, elenco, prancheta tática (Skia).

## Verificações já feitas
`npx tsc --noEmit` sem erros e `npx expo export --platform android` empacotando com sucesso.

