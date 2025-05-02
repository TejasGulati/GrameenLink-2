services:
  - type: web
    name: gramseva-backend
    env: python
    buildCommand: "pip install -r requirements.txt && python manage.py collectstatic --noinput"
    startCommand: "gunicorn gramseva_backend.wsgi:application"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: DATABASE_URL
        fromDatabase:
          name: gramseva-db
          property: connectionString

databases:
  - name: gramseva-db
    plan: free