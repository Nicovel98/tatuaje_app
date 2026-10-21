# 🐉 Sistema de Información - Estudio de Tatuajes

Este es un sistema Fullstack desarrollado con **Vite + React** para el Frontend y **Node.js + Express** para el Backend, conectado a una base de datos relacional **MySQL (administrada localmente con XAMPP y phpMyAdmin**).

## 📋 Prerrequisitos

Antes de encender los servidores de desarrollo, es obligatorio activar el entorno de la base de datos local utilizando **XAMPP**:

1. Abre el panel de control de **XAMPP**.
2. Enciende el módulo **Apache** (necesario para levantar el entorno web de phpMyAdmin).
3. Enciende el módulo **MySQL** (el motor de base de datos relacional del sistema).
4. Ve a tu navegador e ingresa a `http://localhost:8080/phpmyadmin/` o el puerto que uses.
5. Crea la base de datos llamada `tatuaje` e importa el archivo ejecutable ubicado en `/database/DDL_tatuaje.sql`.

---

## 🚀 Instalación y Despliegue Local

Una vez que los servicios de XAMPP estén activos (en verde), ejecuta los siguientes comandos en terminales separadas:

### 1. Servidor Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

_El servidor backend se ejecutará de forma segura en `http://localhost:5000` con contraseñas encriptadas mediante `bcrypt`._

### 2. Servidor Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

_La interfaz gráfica se desplegará en `http://localhost:5173` (o el puerto asignado por Vite)._
