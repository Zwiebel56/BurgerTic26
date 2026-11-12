import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler, TOKEN_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // Si hay un token guardado, hay que validarlo contra la API antes de decidir.
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }, []);

  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  // Al abrir la app: restaurar la sesión con GET /auth/me (valida token y vencimiento).
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api('/auth/me')
      .then((d) => setUsuario(d.usuario))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', auth: false, body: { email, password } });
    localStorage.setItem(TOKEN_KEY, d.token); // el JWT se guarda en localStorage
    setUsuario(d.usuario);
    return d.usuario;
  };

  const register = async (datos) => {
    await api('/auth/register', { method: 'POST', auth: false, body: datos });
    return login(datos.email, datos.password); // tras registrarse, inicia sesión
  };

  return (
    <AuthContext.Provider value={{ usuario, isAdmin: !!usuario?.admin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
