# Configuración de SonarQube para el Proyecto

Este proyecto está configurado con SonarQube para análisis de cobertura de código y calidad.

## Requisitos Previos

1. **SonarQube Server**: Necesitas tener un servidor SonarQube corriendo. Puedes:
   - Usar SonarCloud (recomendado para proyectos open source)
   - Instalar SonarQube localmente
   - Usar Docker: `docker run -d --name sonarqube -p 9000:9000 sonarqube:latest`

2. **Token de SonarQube**: Crea un token en tu servidor SonarQube para autenticación.

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
SONAR_TOKEN=tu_token_de_sonarqube
SONAR_HOST_URL=http://localhost:9000  # o tu URL de SonarCloud
```

### Archivo sonar-project.properties

Ya está configurado con:
- **Project Key**: `frontend-subacol-angular`
- **Source**: `src/`
- **Tests**: `src/**/*.spec.ts`
- **Coverage**: `coverage/lcov.info`

## Comandos Disponibles

### Ejecutar Análisis Completo

```bash
npm run sonar:analyze
```

Este comando:
1. Ejecuta los tests con cobertura (`npm run test:ci`)
2. Envía los resultados a SonarQube

### Solo Tests con Cobertura

```bash
npm run test:ci
```

### Solo SonarQube Scanner

```bash
npm run sonar
```

## Configuración de Cobertura

- **Archivo de configuración**: `karma.conf.ci.js`
- **Reportes generados**:
  - HTML: `coverage/html/`
  - LCOV: `coverage/lcov.info`
  - Cobertura: `coverage/cobertura-coverage.xml`

### Umbrales de Cobertura

- **Statements**: 50%
- **Branches**: 30%
- **Functions**: 50%
- **Lines**: 50%

## Ver Resultados

1. Ve a tu servidor SonarQube (http://localhost:9000 por defecto)
2. Busca el proyecto `frontend-subacol-angular`
3. Revisa las métricas de calidad y cobertura

## Solución de Problemas

### Error de Token
Asegúrate de que el token en `.env` sea válido y tenga permisos para el proyecto.

### Error de Conexión
Verifica que el `SONAR_HOST_URL` apunte al servidor correcto.

### Cobertura Baja
Los umbrales están configurados para un proyecto en desarrollo. Puedes ajustarlos en `karma.conf.ci.js`.

### Tests Fallando
Ejecuta `npm test` para verificar que los tests pasen localmente antes de enviar a SonarQube.

## Configuración Avanzada

### Exclusiones de Cobertura

En `sonar-project.properties`:
```
sonar.coverage.exclusions=**/*.spec.ts,**/*.test.ts,**/testing/**,**/environments/**,**/main.ts,**/polyfills.ts
```

### Reglas de Calidad

Puedes configurar reglas específicas en el servidor SonarQube o usar un `sonarlint.json` para ESLint integration.

## CI/CD Integration

Para integrar con GitHub Actions, Azure DevOps, etc.:

```yaml
- name: Run SonarQube Analysis
  run: npm run sonar:analyze
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}