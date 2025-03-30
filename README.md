# Rural-flow-ai

## Environment Variables Setup

### Development Setup
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
   Or run the setup script:
   ```bash
   ./setup-env.sh
   ```

2. Edit the `.env` file with your actual values.

### Deployment Setup

#### Vercel / Netlify (Frontend)
1. Go to your project settings
2. Navigate to Environment Variables section
3. Add all required variables from `.env.example`
4. For client-side variables, prefix with `VITE_` or `NEXT_PUBLIC_`

#### AWS / DigitalOcean / Heroku (Backend)
1. Add environment variables through your platform's dashboard
2. For Heroku:
   ```bash
   heroku config:set API_KEY=your-key
   ```

#### Docker Deployment
1. Create a `.env` file in your project root
2. Add all required variables
3. The `docker-compose.yml` will automatically load the `.env` file

### Important Notes
- Never commit `.env` files to version control
- Keep your API keys secure
- Use different environment variables for development and production
- For client-side variables, prefix with `VITE_` or `NEXT_PUBLIC_`
