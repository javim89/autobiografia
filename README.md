# azu-bio

Web autobiográfica de Javier Zucaro. Dark editorial. Con personalidad.

## Setup

```bash
npm install
cp .env.example .env
# editá .env con tus credenciales de Supabase
npm run dev
```

## Supabase (gratuito, sin tablas)

1. Creá una cuenta en [supabase.com](https://supabase.com)
2. Creá un nuevo proyecto (free tier)
3. En **Project Settings → API** copiá:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_KEY`
4. No necesitás crear tablas — solo se usa **Realtime Broadcast** (sin persistencia)

> Sin Supabase configurado el sitio funciona igual en modo demo (sin cursores colaborativos).

## Easter eggs

| # | Easter egg | Cómo activarlo |
|---|-----------|---------------|
| 1 | Frase bloqueada +18 | Click en la frase #3 |
| 2 | Modo épico Fortnite | Hover 3 segundos en la card de Fortnite |
| 3 | Confetti | Scroll hasta la última frase |
| 4 | Modo arcoíris | Konami Code: ↑↑↓↓←→←→BA |
| 5 | Easter egg en consola | Abrí DevTools → Console |
| 6 | Mapa colaborativo | Pasá el cursor por Trenque Lauquen en el mapa |

## Deploy en Netlify

```bash
npm run build
```

Arrastrá la carpeta `dist/` a [netlify.com/drop](https://app.netlify.com/drop).

O con Netlify CLI:

```bash
npx netlify deploy --prod --dir=dist
```
# autobiografia
