// Demo Vercel: no se importa Firebase, por lo que nunca se inicializa en esta rama.
// La implementación con Firebase permanece en la rama main.
const demoUser = {
  email: '',
  getIdToken: async () => null,
}

export const ADMIN_EMAIL = ''

export const loginAdmin = async (email) => ({
  user: { ...demoUser, email: String(email || '').trim() },
})

export const logoutAdmin = async () => undefined

export const getCurrentUser = async () => demoUser

export const getAdminToken = async () => null

// Mantiene accesibles las rutas administrativas sin solicitar credenciales.
export const isAdminSessionActive = async () => true
