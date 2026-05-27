import { defineEventHandler, getQuery, setCookie, sendRedirect, createError } from 'h3';

// Controlador para procesar la respuesta (Callback) de Discord OAuth2
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;

  // Si no hay código de autorización en la petición, abortar con error 400
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Código de autorización faltante.'
    });
  }

  const config = useRuntimeConfig();

  try {
    // 1. Intercambiar el código de autorización por un Access Token
    const tokenParams = new URLSearchParams({
      client_id: config.public.discordClientId,
      client_secret: config.discordClientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: config.public.discordRedirectUri
    });

    const tokenResponse = await $fetch<any>('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    // 2. Obtener el perfil del usuario de Discord autenticado (@me)
    const userResponse = await $fetch<any>('https://discord.com/api/users/@me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`
      }
    });

    // 3. Estructurar el payload de la sesión de manera segura
    const sessionData = {
      id: userResponse.id,
      username: userResponse.username,
      discriminator: userResponse.discriminator,
      avatar: userResponse.avatar,
      accessToken: tokenResponse.access_token
    };

    // Almacenar en una Cookie segura HTTP-Only accesible solo por el servidor
    setCookie(event, 'talkitier_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // Duración: 1 semana
    });

    // 4. Redirigir de vuelta al inicio de la Landing Page
    return sendRedirect(event, '/');

  } catch (error: any) {
    console.error('Error durante el flujo de autenticación de Discord:', error);
    
    // Captura segura de errores de API para evitar fugas de información
    throw createError({
      statusCode: 500,
      statusMessage: 'Fallo al autenticar con Discord.',
      data: error.message
    });
  }
});
