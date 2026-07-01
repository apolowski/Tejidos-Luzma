import sys
from pathlib import Path

backend_path = Path(__file__).parent
sys.path.append(str(backend_path))

from app.config.database import SessionLocal
from app.models.category import Category


CATEGORIES = [
    ("Camisetas", "Camisetas basicas, estampadas y urbanas."),
    ("Camisas", "Camisas casuales, formales y manga corta."),
    ("Pantalones", "Jeans, joggers, pantalones casuales y formales."),
    ("Chaquetas", "Chaquetas, buzos, hoodies y prendas exteriores."),
    ("Vestidos", "Vestidos casuales, elegantes y de temporada."),
    ("Faldas", "Faldas cortas, largas y estilos casuales."),
    ("Zapatos", "Tenis, botas, sandalias y calzado casual."),
    ("Accesorios", "Gorras, bolsos, correas y complementos."),
]


def seed():
    db = SessionLocal()
    try:
        created = 0
        for name, description in CATEGORIES:
            existing = db.query(Category).filter(Category.name == name).first()
            if existing:
                continue

            db.add(Category(name=name, description=description))
            created += 1

        db.commit()
        print(f"Categorias creadas: {created}")
    except Exception as exc:
        db.rollback()
        print(f"Error al crear categorias: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
