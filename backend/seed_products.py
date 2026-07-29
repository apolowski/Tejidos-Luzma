import sys
import os
import secrets
import shutil
from pathlib import Path

# Add the backend directory to python path
backend_path = Path(__file__).parent
sys.path.append(str(backend_path))

from app.config.database import SessionLocal
from app.services import product_service
from app.config.settings import settings

def seed_products():
    db = SessionLocal()
    try:
        public_dir = backend_path.parent / "frontend" / "public"
        products_dir = public_dir / "images" / "products"
        if not products_dir.exists():
            products_dir = public_dir

        uploads_dir = backend_path / settings.upload_dir
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Get category id for 'Bolsos Tejidos' or 'Mochilas'
        categories = product_service.list_categories(db)
        if not categories:
            print("No categories found. Run seed_categories.py first.")
            return
            
        category_id = categories[0].id
        
        image_files = [f for f in products_dir.iterdir() if f.is_file() and f.suffix.lower() in [".jpeg", ".jpg", ".png", ".webp"]]
        
        if not image_files:
            print(f"No images found in {products_dir}")
            return
            
        count = 1
        for img_path in image_files:
            # Create a product
            product_name = f"Bolso Tejido Exclusivo {count}"
            product_desc = "Hermoso bolso tejido a mano con diseño único y colores vibrantes. Perfecto para cualquier ocasión."
            product_price = 85000.00 + (count * 1000)
            
            product = product_service.create_product(
                db=db,
                name=product_name,
                description=product_desc,
                price=product_price,
                category_id=category_id,
                image_url=None
            )
            db.commit()
            db.refresh(product)
            
            # Create a variant (stock)
            product_service.add_variant(
                db=db,
                product=product,
                size="Única",
                color="Multicolor",
                stock=5
            )
            db.commit()
            
            # Handle image
            extension = img_path.suffix.lower()
            nombre_archivo = f"p{product.id}_{secrets.token_hex(8)}{extension}"
            destino = uploads_dir / nombre_archivo
            
            # Copy image to uploads
            shutil.copy2(img_path, destino)
            
            url_publica = str(settings.public_base_url).rstrip("/")
            image_url = f"{url_publica}/static/{nombre_archivo}"
            
            product_service.update_product(db, product, image_url=image_url)
            db.commit()
            print(f"Created product: {product_name} with image {nombre_archivo}")
            
            count += 1
            
    except Exception as e:
        print(f"Error seeding products: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
