import { computed } from 'vue';

// Interfaz que modela el payload seguro de sesión del usuario de Discord
interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator?: string;
  accessToken: string;
}

// Composable de sesión bajo arquitectura DRY y SOLID
export const useAuth = () => {
  // Recuperación reactiva de la cookie talkitier_session expuesta por el servidor
  const sessionCookie = useCookie<DiscordUser | null>('talkitier_session', {
    sameSite: 'lax',
    watch: 'shallow'
  });

  // Propiedades reactivas computadas de acceso seguro
  const user = computed(() => sessionCookie.value);
  const isAuthenticated = computed(() => !!sessionCookie.value);

  // Destrucción segura de la sesión limpiando la cookie y refrescando el DOM
  const logout = () => {
    sessionCookie.value = null;
    window.location.reload();
  };

  return {
    user,
    isAuthenticated,
    logout
  };
};
