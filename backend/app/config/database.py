from __future__ import annotations

"""Conexión a la base de datos.

Este archivo prepara la sesión que usarán los endpoints para consultar o guardar datos.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config.settings import settings


class Base(DeclarativeBase):
    # Clase base para todos los modelos de SQLAlchemy.
    pass


# Crear el motor principal de la base de datos.
# El motor encapsula la URL de la base de datos y la forma de conectar.
# Aquí se usa settings.database_url para leer la dirección de la DB desde la configuración.
# pool_pre_ping=True hace un pequeño chequeo antes de usar cada conexión,
# lo que ayuda a evitar errores si la conexión quedó inactiva.
engine = create_engine(settings.database_url, pool_pre_ping=True)

# Crear una fábrica de sesiones para abrir conexiones cuando sea necesario.
# Cada vez que llamamos a SessionLocal(), obtenemos una nueva sesión independiente.
# La sesión es el objeto que usamos para hacer consultas y cambios en la base de datos.
# Se conecta al motor creado arriba, por eso pasamos bind=engine.
SessionLocal = sessionmaker(bind=engine, class_=Session)


def get_db() -> Generator[Session, None, None]:
    # Abrir una sesión nueva para una petición.
    db = SessionLocal()
    try:
        # Entregar la sesión al endpoint.
        yield db
    finally:
        # Cerrar la sesión al terminar.
        db.close()

