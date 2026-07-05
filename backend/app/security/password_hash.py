from __future__ import annotations

"""Funciones para proteger contraseñas con bcrypt.

No se guarda la contraseña en texto plano; se cifra antes de almacenarla.
"""

import bcrypt


def hash_password(password: str) -> str:
    # Limitar la contraseña a 72 bytes, porque bcrypt tiene ese límite.
    # password.encode("utf-8") convierte el texto en bytes, que es la forma en que bcrypt trabaja.
    # Los bytes son una representación binaria de la información, muy usada para procesar datos de forma eficiente.
    # En este caso, los bytes permiten enviar la contraseña a bcrypt de manera segura y compatible.
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    # Comprobar si la contraseña ingresada coincide con el hash guardado.
    # Primero se convierte la contraseña a bytes, igual que en el proceso de creación del hash.
    # Después bcrypt compara ambos valores sin mostrar la contraseña original.
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = password_hash.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

