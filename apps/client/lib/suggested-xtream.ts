/**
 * Plantillas de servidores VOD (Xtream). Al tocar una se rellena el formulario.
 * Sustituye URL, usuario y contraseña por los de tu proveedor.
 */

export type SuggestedXtream = {
  id: string;
  name: string;
  baseUrl: string;
  username: string;
  password: string;
};

export const SUGGESTED_XTREAM: SuggestedXtream[] = [
  {
    id: "plantilla-1",
    name: "Servidor 1",
    baseUrl: "http://ejemplo.com:8080",
    username: "usuario",
    password: "contraseña",
  },
  {
    id: "plantilla-2",
    name: "Servidor 2",
    baseUrl: "http://tu-servidor.com:80",
    username: "usuario",
    password: "contraseña",
  },
  {
    id: "plantilla-3",
    name: "Servidor 3",
    baseUrl: "https://panel.ejemplo.net:443",
    username: "usuario",
    password: "contraseña",
  },
  {
    id: "plantilla-4",
    name: "Servidor 4",
    baseUrl: "http://iptv.ejemplo.com:8080",
    username: "usuario",
    password: "contraseña",
  },
  {
    id: "plantilla-5",
    name: "Servidor 5",
    baseUrl: "http://vod.ejemplo.tv:80",
    username: "usuario",
    password: "contraseña",
  },
];
