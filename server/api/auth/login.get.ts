import { defineEventHandler, sendRedirect } from 'h3';

// Controlador para la redirección inicial del flujo OAuth2 hacia Discord
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const clientId = config.public.discordClientId;
  const redirectUri = config.public.discordRedirectUri;

  // Construcción de la URL de autorización solicitando alcances 'identify' y 'guilds.join'
  const authorizationUrl = new URL('https://discord.com/api/oauth2/authorize');
  authorizationUrl.searchParams.append('client_id', clientId);
  authorizationUrl.searchParams.append('redirect_uri', redirectUri);
  authorizationUrl.searchParams.append('response_type', 'code');
  authorizationUrl.searchParams.append('scope', 'identify guilds.join');

  // Redirigir al usuario de manera segura al login de Discord
  return sendRedirect(event, authorizationUrl.toString());
});
