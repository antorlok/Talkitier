import { defineEventHandler, readBody, getCookie, createError } from 'h3';

// Estructura de la sesión del usuario obtenida de la cookie
interface DiscordSession {
  id: string;
  username: string;
  avatar: string;
  accessToken: string;
}

// Estructura interna de configuración de roles por idioma
interface LanguageRoleConfig {
  languageRoleId: string; // ID del rol principal del idioma (ej. Portugués)
  levels: Record<string, string>; // Mapeo de niveles CEFR a su respectivo ID de rol
}

// Diccionario estático con el mapeo de roles por idioma y nivel (CEFR)
// Permite asignar tanto el rol base del idioma como el rol del nivel obtenido.
const ROLE_MAP: Record<string, LanguageRoleConfig> = {
  es: {
    languageRoleId: '1509241994487009382',
    levels: {
      A1: '1509246743727046666',
      A2: '1509246685489139802',
      B1: '1509246647010594816',
      B2: '1509246601611182101',
      C1: '1509246463966969886',
      C2: '1509246463966969886'
    }
  },
  de: {
    languageRoleId: '1509241289353465976',
    levels: {
      A1: '1509247608202203237',
      A2: '1509247547389120562',
      B1: '1509247429063737414',
      B2: '1509247340295225575',
      C1: '1509247265896665168',
      C2: '1509247265896665168'
    }
  },
  en: {
    languageRoleId: '1509240790008729690',
    levels: {
      A1: '1509245076180697159',
      A2: '1509245283203154112',
      B1: '1509245334906212422',
      B2: '1509245440682623077',
      C1: '1509245629484761199',
      C2: '1509245629484761199'
    }
  },
  pt: {
    languageRoleId: '1509241377123205202',
    levels: {
      A1: '1509248129055326329',
      A2: '1509248079390572634',
      B1: '1509248021639073962',
      B2: '1509247955348099244',
      C1: '1509247751471497226',
      C2: '1509247751471497226'
    }
  },
  it: {
    languageRoleId: '1509241145946013828',
    levels: {
      A1: '1509246258261266482',
      A2: '1509246182659068015',
      B1: '1509246052987834481',
      B2: '1509246007521710231',
      C1: '1509245942841475284',
      C2: '1509245942841475284'
    }
  }
};

export default defineEventHandler(async (event) => {
  // 1. Obtener la sesión activa del usuario desde la cookie segura
  const sessionCookie = getCookie(event, 'talkitier_session');
  if (!sessionCookie) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Inicia sesión con Discord primero.'
    });
  }

  let session: DiscordSession;
  try {
    session = JSON.parse(sessionCookie);
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La sesión guardada es inválida.'
    });
  }

  const { id: userId } = session;

  // 2. Extraer los datos enviados en el cuerpo del POST (idioma y nivel calculado)
  const body = await readBody(event);
  const { language, tier } = body;

  if (!language || !tier) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El idioma y nivel son obligatorios.'
    });
  }

  const normalizedLang = language.toLowerCase();
  const normalizedTier = tier.toUpperCase();

  // Validar si el idioma está configurado en el mapa de roles
  const langConfig = ROLE_MAP[normalizedLang];
  if (!langConfig) {
    throw createError({
      statusCode: 400,
      statusMessage: `El idioma '${language}' no está configurado.`
    });
  }

  // Obtener el ID del nuevo rol de nivel asignable
  const newLevelRoleId = langConfig.levels[normalizedTier];
  if (!newLevelRoleId) {
    throw createError({
      statusCode: 400,
      statusMessage: `El nivel '${tier}' no está configurado para el idioma '${language}'.`
    });
  }

  // Obtener el ID del rol principal del idioma
  const baseLanguageRoleId = langConfig.languageRoleId;

  // 3. Recuperar configuración de Discord en runtimeConfig
  const config = useRuntimeConfig();
  const botToken = config.discordBotToken;
  const guildId = config.discordGuildId;

  if (!botToken || !guildId) {
    console.error('Falta la configuración de Discord (DISCORD_BOT_TOKEN o DISCORD_GUILD_ID).');
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno en la configuración de la integración de Discord.'
    });
  }

  const authHeaders = {
    Authorization: `Bot ${botToken}`
  };

  try {
    // --- PASO A: Obtener la información del miembro actual del gremio ---
    const memberUrl = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`;
    let memberData: any;

    try {
      memberData = await $fetch<any>(memberUrl, {
        method: 'GET',
        headers: authHeaders
      });
    } catch (fetchError: any) {
      // Captura si el usuario no se encuentra en el servidor de Discord
      if (fetchError.status === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: 'No estás en el servidor de Discord de Talkitier. Por favor, únete primero al servidor para recibir tus roles.'
        });
      }
      throw fetchError;
    }

    const currentRoles: string[] = memberData.roles || [];

    // --- PASO B: Filtrar roles actuales contra los roles del diccionario del idioma evaluado ---
    // Obtenemos todos los IDs de roles de niveles de este idioma (A1, A2, B1, B2, C1)
    // El rol base del idioma (ej. Portugués) se queda permanente, por lo que NO se limpia.
    const levelRoleIds = Object.values(langConfig.levels);
    const rolesToRemove = currentRoles.filter(roleId => levelRoleIds.includes(roleId));

    // --- PASO C: Eliminar de forma limpia los roles de nivel previos para evitar apilamiento ---
    for (const oldRoleId of rolesToRemove) {
      // Omitir si ya tiene el rol correcto para no realizar llamadas API redundantes
      if (oldRoleId === newLevelRoleId) continue;

      const deleteRoleUrl = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${oldRoleId}`;
      try {
        await $fetch(deleteRoleUrl, {
          method: 'DELETE',
          headers: authHeaders
        });
      } catch (delError) {
        // Logueamos pero continuamos para asegurar que se intente asignar los nuevos roles
        console.warn(`No se pudo remover el rol antiguo de nivel ${oldRoleId} del usuario ${userId}:`, delError);
      }
    }

    // --- PASO D1: Asignar el rol principal del idioma (ej. Portugués) ---
    // Esto nos permite llevar la métrica de cuántos usuarios aprenden cada idioma independientemente de su nivel.
    const putBaseLanguageUrl = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${baseLanguageRoleId}`;
    await $fetch(putBaseLanguageUrl, {
      method: 'PUT',
      headers: authHeaders
    });

    // --- PASO D2: Asignar el nuevo rol correspondiente al nivel evaluado (ej. Portugués A1) ---
    const putLevelRoleUrl = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${newLevelRoleId}`;
    await $fetch(putLevelRoleUrl, {
      method: 'PUT',
      headers: authHeaders
    });

    return {
      success: true,
      message: `Sincronización exitosa: Rol del idioma '${normalizedLang}' y rol de nivel '${normalizedTier}' asignados.`
    };

  } catch (error: any) {
    console.error('Error al asignar los roles en Discord:', error);

    // Conservar código de error semántico si es un error controlado (ej. 404 del gremio)
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error al conectar con la API de Discord para asignar roles.',
      data: error.message
    });
  }
});
